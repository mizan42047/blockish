<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve active Theme Builder templates on the frontend (by catalog slug).
 */
class TemplateResolver {

	/**
	 * @param string $slug Template catalog slug (home, single, archive-product, …).
	 * @return \WP_Post|null
	 */
	public static function resolve_by_slug( $slug ) {
		$slug = sanitize_title( (string) $slug );
		if ( '' === $slug ) {
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
						'value' => PostType::KIND_TEMPLATE,
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

		$template = $query->posts[0];

		$active = get_post_meta( $template->ID, PostType::META_ACTIVE, true );
		if ( '' !== $active && ! $active ) {
			return null;
		}

		return $template;
	}
}
