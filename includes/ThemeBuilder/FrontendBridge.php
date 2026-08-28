<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inject Theme Builder templates + parts wherever WordPress loads block templates
 * (block themes: frontend + Site Editor). Classic PHP themes use ClassicThemeBridge.
 *
 * Active TB template/part for a slug wins over theme defaults and saved Site Editor copies.
 */
class FrontendBridge {

	/** @var array<int, string>|null */
	private static $woocommerce_part_slugs = null;

	/**
	 * @return void
	 */
	public static function register_hooks() {
		add_filter( 'pre_get_block_template', array( __CLASS__, 'pre_get_block_template' ), 10, 3 );
		add_filter( 'get_block_template', array( __CLASS__, 'filter_block_template' ), 10, 3 );
		add_filter( 'get_block_templates', array( __CLASS__, 'filter_block_templates' ), 10, 3 );
	}

	/**
	 * Short-circuit before theme file / Site Editor DB lookup.
	 *
	 * @param \WP_Block_Template|null $template      Template.
	 * @param string                  $id            theme//slug id.
	 * @param string                  $template_type wp_template or wp_template_part.
	 * @return \WP_Block_Template|null
	 */
	public static function pre_get_block_template( $template, $id, $template_type ) {
		if ( ! self::is_enabled() ) {
			return $template;
		}

		$slug = self::slug_from_id( $id );
		if ( '' === $slug ) {
			return $template;
		}

		$override = self::resolve_tb_override( $slug, $template_type );
		if ( ! $override instanceof \WP_Post ) {
			return $template;
		}

		$content = (string) $override->post_content;
		if ( '' === trim( $content ) ) {
			return $template;
		}

		return self::build_block_template( $override, $slug, $template_type );
	}

	/**
	 * Fallback when WordPress already built a template object (file-based themes).
	 *
	 * @param \WP_Block_Template|null $template      Template object.
	 * @param string                  $id            Template id.
	 * @param string                  $template_type wp_template or wp_template_part.
	 * @return \WP_Block_Template|null
	 */
	public static function filter_block_template( $template, $id, $template_type ) {
		if ( ! self::is_enabled() ) {
			return $template;
		}

		$slug = '';
		if ( is_object( $template ) && ! empty( $template->slug ) ) {
			$slug = sanitize_title( (string) $template->slug );
		} else {
			$slug = self::slug_from_id( $id );
		}

		if ( '' === $slug ) {
			return $template;
		}

		$override = self::resolve_tb_override( $slug, $template_type );
		if ( ! $override instanceof \WP_Post ) {
			return $template;
		}

		$content = (string) $override->post_content;
		if ( '' === trim( $content ) ) {
			return $template;
		}

		if ( ! is_object( $template ) ) {
			return self::build_block_template( $override, $slug, $template_type );
		}

		$template->content = $content;
		$template->source  = 'custom';
		$template->is_custom = true;

		return $template;
	}

	/**
	 * @param \WP_Block_Template[] $templates     Templates.
	 * @param array                $query         Query args.
	 * @param string               $template_type wp_template or wp_template_part.
	 * @return \WP_Block_Template[]
	 */
	public static function filter_block_templates( $templates, $query, $template_type ) {
		if ( ! is_array( $templates ) ) {
			$templates = array();
		}

		if ( ! self::is_enabled() ) {
			return $templates;
		}

		$by_slug = array();
		foreach ( $templates as $template ) {
			if ( ! is_object( $template ) || empty( $template->slug ) ) {
				continue;
			}
			$by_slug[ sanitize_title( (string) $template->slug ) ] = self::filter_block_template(
				$template,
				$template->id ?? '',
				$template_type
			);
		}

		$slug_in = self::query_slug_list( $query, 'slug__in' );
		$slug_not_in = self::query_slug_list( $query, 'slug__not_in' );

		foreach ( self::active_tb_posts( $template_type ) as $post ) {
			$slug = sanitize_title( (string) get_post_meta( $post->ID, PostType::META_SLUG, true ) );
			if ( '' === $slug || isset( $by_slug[ $slug ] ) ) {
				continue;
			}
			if ( null !== $slug_in && ! in_array( $slug, $slug_in, true ) ) {
				continue;
			}
			if ( in_array( $slug, $slug_not_in, true ) ) {
				continue;
			}
			if ( '' === trim( (string) $post->post_content ) ) {
				continue;
			}
			$by_slug[ $slug ] = self::build_block_template( $post, $slug, $template_type );
		}

		$result = array_values( $by_slug );

		if ( null !== $slug_in ) {
			$allowed = array_flip( $slug_in );
			$result  = array_values(
				array_filter(
					$result,
					static function ( $template ) use ( $allowed ) {
						return is_object( $template )
							&& ! empty( $template->slug )
							&& isset( $allowed[ sanitize_title( (string) $template->slug ) ] );
					}
				)
			);
		}

		return $result;
	}

	/**
	 * @param array  $query Query args from get_block_templates().
	 * @param string $key   slug__in or slug__not_in.
	 * @return array<int, string>|null Null when the key is absent (no slug filter).
	 */
	private static function query_slug_list( $query, $key ) {
		if ( ! is_array( $query ) || empty( $query[ $key ] ) || ! is_array( $query[ $key ] ) ) {
			return 'slug__in' === $key ? null : array();
		}

		return array_values(
			array_unique(
				array_filter(
					array_map( 'sanitize_title', $query[ $key ] )
				)
			)
		);
	}

	/**
	 * @return bool
	 */
	private static function is_enabled() {
		return class_exists( '\Blockish\Extensions\ThemeBuilder' )
			&& \Blockish\Extensions\ThemeBuilder::is_enabled();
	}

	/**
	 * @param string $id theme//slug.
	 * @return string
	 */
	private static function slug_from_id( $id ) {
		$id = (string) $id;
		if ( false === strpos( $id, '//' ) ) {
			return '';
		}
		$parts = explode( '//', $id, 2 );
		return sanitize_title( (string) ( $parts[1] ?? '' ) );
	}

	/**
	 * @param string $slug          Catalog slug.
	 * @param string $template_type wp_template or wp_template_part.
	 * @return \WP_Post|null
	 */
	private static function resolve_tb_override( $slug, $template_type ) {
		if ( 'wp_template' === $template_type ) {
			return TemplateResolver::resolve_by_slug( $slug );
		}

		if ( 'wp_template_part' !== $template_type ) {
			return null;
		}

		if ( in_array( $slug, self::woocommerce_part_slugs(), true ) ) {
			return PartResolver::resolve_by_slug( $slug );
		}

		if ( PostType::AREA_HEADER === $slug || PostType::AREA_FOOTER === $slug ) {
			return PartResolver::resolve( $slug );
		}

		return PartResolver::resolve_by_slug( $slug );
	}

	/**
	 * @param string $template_type wp_template or wp_template_part.
	 * @return \WP_Post[]
	 */
	private static function active_tb_posts( $template_type ) {
		$kind = 'wp_template' === $template_type ? PostType::KIND_TEMPLATE : PostType::KIND_PART;

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
						'value' => $kind,
					),
				),
			)
		);

		if ( ! $query->have_posts() ) {
			return array();
		}

		$posts = array();
		foreach ( $query->posts as $post ) {
			$active = get_post_meta( $post->ID, PostType::META_ACTIVE, true );
			if ( '' !== $active && ! $active ) {
				continue;
			}
			$posts[] = $post;
		}

		return $posts;
	}

	/**
	 * @param \WP_Post $post          TB template or part post.
	 * @param string   $slug          Catalog slug.
	 * @param string   $template_type wp_template or wp_template_part.
	 * @return \WP_Block_Template
	 */
	private static function build_block_template( \WP_Post $post, $slug, $template_type ) {
		$theme    = get_stylesheet();
		$template = new \WP_Block_Template();

		$template->wp_id          = (int) $post->ID;
		$template->id             = $theme . '//' . $slug;
		$template->theme          = $theme;
		$template->slug           = $slug;
		$template->source         = 'custom';
		$template->origin         = 'theme-builder';
		$template->type           = $template_type;
		$template->title          = $post->post_title ? (string) $post->post_title : $slug;
		$template->content        = (string) $post->post_content;
		$template->status         = 'publish';
		$template->has_theme_file = (bool) _get_block_template_file( $template_type, $slug );
		$template->is_custom      = true;

		if ( 'wp_template_part' === $template_type ) {
			$area = get_post_meta( $post->ID, PostType::META_AREA, true );
			if ( '' === (string) $area ) {
				$area = PostType::area_from_slug( $slug );
			}
			$template->area = (string) $area;
		}

		return $template;
	}

	/**
	 * WooCommerce catalog part slugs loaded by WC blocks (not area slots).
	 *
	 * @return array<int, string>
	 */
	public static function woocommerce_part_slugs() {
		if ( null !== self::$woocommerce_part_slugs ) {
			return self::$woocommerce_part_slugs;
		}

		self::$woocommerce_part_slugs = array(
			'mini-cart',
			'checkout-header',
			'coming-soon-social-links',
			'simple-product-add-to-cart-with-options',
			'external-product-add-to-cart-with-options',
			'variable-product-add-to-cart-with-options',
			'grouped-product-add-to-cart-with-options',
		);

		return self::$woocommerce_part_slugs;
	}
}
