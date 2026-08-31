<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Copy Theme Builder templates & parts into Site Editor (wp_template / wp_template_part).
 *
 * Used when switching to a block theme — TB does not run on block themes.
 */
class SiteEditorMigration {

	/**
	 * Summary of migratable Theme Builder items.
	 *
	 * @return array{templates:int,parts:int,total:int,siteEditorUrl:string}
	 */
	public static function get_status() {
		$counts = self::count_migratable_posts();

		return array(
			'templates'     => $counts['templates'],
			'parts'         => $counts['parts'],
			'total'         => $counts['templates'] + $counts['parts'],
			'siteEditorUrl' => admin_url( 'site-editor.php' ),
		);
	}

	/**
	 * Migrate all Theme Builder templates and parts to Site Editor posts.
	 *
	 * @param bool $overwrite When true, replace content on existing Site Editor slugs.
	 * @return array{status:string,migrated:array,skipped:array,errors:array,siteEditorUrl:string}
	 */
	public static function migrate_all( $overwrite = true ) {
		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			return array(
				'status'  => 'fail',
				'message' => array( __( 'Migration is only available on block themes.', 'blockish' ) ),
			);
		}

		$migrated = array();
		$skipped  = array();
		$errors   = array();

		$parts = self::query_tb_posts( PostType::KIND_PART );
		foreach ( $parts as $post ) {
			$result = self::migrate_post( $post, 'wp_template_part', (bool) $overwrite );
			self::bucket_result( $result, $migrated, $skipped, $errors );
		}

		$templates = self::query_tb_posts( PostType::KIND_TEMPLATE );
		foreach ( $templates as $post ) {
			$result = self::migrate_post( $post, 'wp_template', (bool) $overwrite );
			self::bucket_result( $result, $migrated, $skipped, $errors );
		}

		return array(
			'status'        => empty( $errors ) ? 'success' : 'partial',
			'migrated'      => $migrated,
			'skipped'       => $skipped,
			'errors'        => $errors,
			'siteEditorUrl' => admin_url( 'site-editor.php' ),
			'message'       => array(
				sprintf(
					/* translators: 1: migrated count, 2: skipped count */
					__( 'Moved %1$d item(s) to Site Editor. Skipped %2$d.', 'blockish' ),
					count( $migrated ),
					count( $skipped )
				),
			),
		);
	}

	/**
	 * @param array $result
	 * @param array $migrated
	 * @param array $skipped
	 * @param array $errors
	 * @return void
	 */
	private static function bucket_result( $result, &$migrated, &$skipped, &$errors ) {
		if ( ! is_array( $result ) ) {
			return;
		}

		$state = $result['state'] ?? '';
		if ( 'migrated' === $state ) {
			$migrated[] = $result;
		} elseif ( 'skipped' === $state ) {
			$skipped[] = $result;
		} elseif ( 'error' === $state ) {
			$errors[] = $result;
		}
	}

	/**
	 * @return array{templates:int,parts:int}
	 */
	private static function count_migratable_posts() {
		return array(
			'templates' => count( self::query_tb_posts( PostType::KIND_TEMPLATE ) ),
			'parts'     => count( self::query_tb_posts( PostType::KIND_PART ) ),
		);
	}

	/**
	 * @param string $kind PostType::KIND_TEMPLATE or KIND_PART.
	 * @return \WP_Post[]
	 */
	private static function query_tb_posts( $kind ) {
		$query = new \WP_Query(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => 'publish',
				'posts_per_page'         => 200, // phpcs:ignore WordPress.WP.PostsPerPage.posts_per_page_posts_per_page -- TB catalog is bounded.
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
			if ( ! $post instanceof \WP_Post ) {
				continue;
			}
			$active = get_post_meta( $post->ID, PostType::META_ACTIVE, true );
			if ( '' !== $active && ! $active ) {
				continue;
			}
			$content = trim( (string) $post->post_content );
			if ( '' === $content ) {
				continue;
			}
			$posts[] = $post;
		}

		return $posts;
	}

	/**
	 * @param \WP_Post $post          TB post.
	 * @param string   $template_type wp_template or wp_template_part.
	 * @param bool     $overwrite     Replace existing Site Editor content.
	 * @return array
	 */
	private static function migrate_post( \WP_Post $post, $template_type, $overwrite ) {
		$slug = sanitize_title( (string) get_post_meta( $post->ID, PostType::META_SLUG, true ) );
		if ( '' === $slug ) {
			$slug = sanitize_title( $post->post_name );
		}
		if ( '' === $slug ) {
			return array(
				'state'   => 'error',
				'source'  => $post->ID,
				'message' => __( 'Missing slug.', 'blockish' ),
			);
		}

		$theme_slug = wp_get_theme()->get_stylesheet();
		$existing   = self::find_site_editor_post( $slug, $template_type, $theme_slug );

		if ( $existing instanceof \WP_Post && ! $overwrite ) {
			return array(
				'state'  => 'skipped',
				'slug'   => $slug,
				'type'   => $template_type,
				'reason' => 'exists',
			);
		}

		$content = (string) $post->post_content;
		if ( 'wp_template' === $template_type ) {
			$content = self::transform_template_content( $content );
		}

		$post_data = array(
			'post_type'    => $template_type,
			'post_name'    => $slug,
			'post_title'   => $post->post_title ? (string) $post->post_title : $slug,
			'post_status'  => 'publish',
			'post_content' => wp_slash( $content ),
		);

		if ( $existing instanceof \WP_Post ) {
			$post_data['ID'] = $existing->ID;
			$post_id         = wp_update_post( $post_data, true );
			$action          = 'updated';
		} else {
			$post_id = wp_insert_post( $post_data, true );
			$action  = 'created';
		}

		if ( is_wp_error( $post_id ) ) {
			return array(
				'state'   => 'error',
				'slug'    => $slug,
				'type'    => $template_type,
				'message' => $post_id->get_error_message(),
			);
		}

		wp_set_post_terms( (int) $post_id, $theme_slug, 'wp_theme' );

		if ( 'wp_template_part' === $template_type ) {
			$area = get_post_meta( $post->ID, PostType::META_AREA, true );
			if ( '' === (string) $area ) {
				$area = PostType::area_from_slug( $slug );
			}
			wp_set_post_terms( (int) $post_id, (string) $area, 'wp_template_part_area' );
		}

		return array(
			'state'    => 'migrated',
			'slug'     => $slug,
			'type'     => $template_type,
			'action'   => $action,
			'id'       => (int) $post_id,
			'edit_url' => get_edit_post_link( (int) $post_id, 'raw' ),
		);
	}

	/**
	 * @param string $slug
	 * @param string $template_type
	 * @param string $theme_slug
	 * @return \WP_Post|null
	 */
	private static function find_site_editor_post( $slug, $template_type, $theme_slug ) {
		$query = new \WP_Query(
			array(
				'post_type'      => $template_type,
				'name'           => $slug,
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array(
					array(
						'taxonomy' => 'wp_theme',
						'field'    => 'name',
						'terms'    => $theme_slug,
					),
				),
			)
		);

		if ( empty( $query->posts[0] ) || ! $query->posts[0] instanceof \WP_Post ) {
			return null;
		}

		return $query->posts[0];
	}

	/**
	 * Replace blockish/template-part slots with core/template-part references.
	 *
	 * @param string $content Block markup.
	 * @return string
	 */
	public static function transform_template_content( $content ) {
		$blocks = parse_blocks( (string) $content );
		if ( empty( $blocks ) ) {
			return (string) $content;
		}

		return serialize_blocks( self::transform_blocks( $blocks ) );
	}

	/**
	 * @param array $blocks Parsed blocks.
	 * @return array
	 */
	private static function transform_blocks( $blocks ) {
		$out = array();

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			if ( 'blockish/template-part' === ( $block['blockName'] ?? '' ) ) {
				$block = self::slot_to_core_template_part( $block );
			} elseif ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = self::transform_blocks( $block['innerBlocks'] );
			}

			$out[] = $block;
		}

		return $out;
	}

	/**
	 * @param array $block Parsed blockish/template-part block.
	 * @return array
	 */
	private static function slot_to_core_template_part( $block ) {
		$attrs     = is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
		$area      = sanitize_title( (string) ( $attrs['area'] ?? PostType::AREA_HEADER ) );
		$slug_attr = sanitize_title( (string) ( $attrs['slug'] ?? '' ) );

		if ( '' !== $slug_attr ) {
			$part_slug = $slug_attr;
		} elseif ( in_array( $area, array( PostType::AREA_HEADER, PostType::AREA_FOOTER ), true ) ) {
			$part_slug = $area;
		} else {
			$part_slug = $area ? $area : PostType::AREA_HEADER;
		}

		return array(
			'blockName'    => 'core/template-part',
			'attrs'        => array(
				'slug'  => $part_slug,
				'theme' => get_stylesheet(),
				'area'  => $area,
			),
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);
	}
}
