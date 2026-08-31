<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve which Theme Builder part fills a placeholder area.
 */
class PartResolver {

	/**
	 * Find the best matching active part for an area on the current request.
	 *
	 * @param string $area    header|footer|custom slug.
	 * @param array  $context Optional condition context overrides.
	 * @return \WP_Post|null
	 */
	public static function resolve( $area, array $context = array() ) {
		$area = sanitize_title( (string) $area );
		if ( '' === $area ) {
			return null;
		}

		if ( ! class_exists( '\Blockish\Extensions\ThemeBuilder' ) || ! \Blockish\Extensions\ThemeBuilder::is_enabled() ) {
			return null;
		}

		$query = new \WP_Query(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => 'publish',
				'posts_per_page'         => 100,
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					array(
						'key'   => PostType::META_KIND,
						'value' => PostType::KIND_PART,
					),
				),
			)
		);

		if ( ! $query->have_posts() ) {
			return null;
		}

		$candidates = array();
		foreach ( $query->posts as $part ) {
			$part_area = get_post_meta( $part->ID, PostType::META_AREA, true );
			if ( '' === (string) $part_area ) {
				$part_area = PostType::area_from_slug(
					get_post_meta( $part->ID, PostType::META_SLUG, true )
				);
			}
			if ( sanitize_title( (string) $part_area ) !== $area ) {
				continue;
			}

			$active = get_post_meta( $part->ID, PostType::META_ACTIVE, true );
			if ( '' !== $active && ! $active ) {
				continue;
			}

			$conditions = get_post_meta( $part->ID, PostType::META_CONDITIONS, true );
			if ( ! Conditions::matches( $conditions, $context ) ) {
				continue;
			}

			$priority     = (int) get_post_meta( $part->ID, PostType::META_PRIORITY, true );
			$candidates[] = array(
				'post'     => $part,
				'priority' => $priority,
			);
		}

		if ( ! $candidates ) {
			return null;
		}

		usort(
			$candidates,
			static function ( $a, $b ) {
				if ( $a['priority'] === $b['priority'] ) {
					return $b['post']->ID <=> $a['post']->ID;
				}
				return $b['priority'] <=> $a['priority'];
			}
		);

		return $candidates[0]['post'];
	}

	/**
	 * Render a resolved area slot (header/footer) with semantic wrapper markup.
	 *
	 * @param string $area    header|footer.
	 * @param array  $context Optional condition context overrides.
	 * @return string HTML or empty string.
	 */
	public static function render_area( $area, array $context = array() ) {
		$area = sanitize_title( (string) $area );
		if ( '' === $area ) {
			return '';
		}

		$part = self::resolve( $area, $context );
		if ( ! $part instanceof \WP_Post ) {
			return '';
		}

		if ( class_exists( '\Blockish\Core\PostPrime' ) ) {
			\Blockish\Core\PostPrime::prime_pattern_refs_from_blocks( parse_blocks( $part->post_content ) );
		}

		$html = self::render_part( $part );
		if ( '' === trim( $html ) ) {
			return '';
		}

		return self::wrap_area_html( $area, $html );
	}

	/**
	 * @param string $area Area slug (header|footer|…).
	 * @param string $html Inner HTML.
	 * @return string
	 */
	public static function wrap_area_html( $area, $html ) {
		$area         = sanitize_title( (string) $area );
		$wrapper_tag  = 'div';
		$wrapper_class = 'blockish-template-part blockish-template-part--' . sanitize_html_class( $area );

		if ( function_exists( 'get_allowed_block_template_part_areas' ) ) {
			foreach ( get_allowed_block_template_part_areas() as $defined_area ) {
				if ( isset( $defined_area['area'] ) && $defined_area['area'] === $area ) {
					if ( ! empty( $defined_area['area_tag'] ) ) {
						$wrapper_tag = tag_escape( $defined_area['area_tag'] );
					}
					break;
				}
			}
		} elseif ( 'header' === $area ) {
			$wrapper_tag = 'header';
		} elseif ( 'footer' === $area ) {
			$wrapper_tag = 'footer';
		}

		$attrs = '';
		if ( function_exists( 'get_block_wrapper_attributes' ) ) {
			$attrs = get_block_wrapper_attributes(
				array(
					'class' => $wrapper_class,
				)
			);
		} else {
			$attrs = 'class="' . esc_attr( $wrapper_class ) . '"';
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper_tag is tag_escape()'d or a fixed literal; $html is escaped at block render.
		return sprintf( '<%1$s %2$s>%3$s</%1$s>', $wrapper_tag, $attrs, $html );
	}

	/**
	 * WooCommerce / named template parts — matched by catalog slug only (no Show on rules).
	 *
	 * @param string $slug Part catalog slug (mini-cart, checkout-header, …).
	 * @return \WP_Post|null
	 */
	public static function resolve_by_slug( $slug ) {
		$slug = sanitize_title( (string) $slug );
		if ( '' === $slug || in_array( $slug, array( 'header', 'footer' ), true ) ) {
			return null;
		}

		if ( ! class_exists( '\Blockish\Extensions\ThemeBuilder' ) || ! \Blockish\Extensions\ThemeBuilder::is_enabled() ) {
			return null;
		}

		$query = new \WP_Query(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => 'publish',
				'posts_per_page'         => 1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					'relation' => 'AND',
					array(
						'key'   => PostType::META_KIND,
						'value' => PostType::KIND_PART,
					),
					array(
						'key'   => PostType::META_SLUG,
						'value' => $slug,
					),
				),
			)
		);

		if ( ! $query->have_posts() ) {
			return null;
		}

		$part = $query->posts[0];

		$active = get_post_meta( $part->ID, PostType::META_ACTIVE, true );
		if ( '' !== $active && ! $active ) {
			return null;
		}

		return $part;
	}

	/**
	 * Render a resolved part's block content.
	 *
	 * @param \WP_Post $part Part post.
	 * @return string
	 */
	public static function render_part( \WP_Post $part ) {
		$key = 'id:' . (int) $part->ID;
		if ( ! isset( $GLOBALS['blockish_tb_rendering_parts'] ) || ! is_array( $GLOBALS['blockish_tb_rendering_parts'] ) ) {
			$GLOBALS['blockish_tb_rendering_parts'] = array();
		}
		if ( isset( $GLOBALS['blockish_tb_rendering_parts'][ $key ] ) ) {
			return '';
		}

		$GLOBALS['blockish_tb_rendering_parts'][ $key ] = true;

		try {
			$html = '';
			foreach ( parse_blocks( $part->post_content ) as $parsed_block ) {
				$html .= render_block( $parsed_block );
			}
		} finally {
			unset( $GLOBALS['blockish_tb_rendering_parts'][ $key ] );
			if ( empty( $GLOBALS['blockish_tb_rendering_parts'] ) ) {
				unset( $GLOBALS['blockish_tb_rendering_parts'] );
			}
		}

		return $html;
	}
}
