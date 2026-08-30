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

		$custom_id = CustomTemplateRegistry::post_id_from_slug( $slug );
		if ( $custom_id > 0 ) {
			$custom = self::resolve_post( $custom_id );
			if ( $custom instanceof \WP_Post ) {
				return $custom;
			}
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

		return self::resolve_post( (int) $query->posts[0]->ID );
	}

	/**
	 * @param int $post_id Theme Builder template post ID.
	 * @return \WP_Post|null
	 */
	private static function resolve_post( $post_id ) {
		$post_id = (int) $post_id;
		if ( $post_id <= 0 ) {
			return null;
		}

		$post = get_post( $post_id );
		if ( ! $post instanceof \WP_Post || PostType::POST_TYPE !== $post->post_type ) {
			return null;
		}

		if ( PostType::KIND_TEMPLATE !== get_post_meta( $post_id, PostType::META_KIND, true ) ) {
			return null;
		}

		$active = get_post_meta( $post_id, PostType::META_ACTIVE, true );
		if ( '' !== $active && ! $active ) {
			return null;
		}

		return $post;
	}
}
