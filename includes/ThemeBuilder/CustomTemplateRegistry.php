<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Theme Builder custom templates in WordPress's native Template picker
 * (`theme_templates` → `_wp_page_template` → template hierarchy).
 */
class CustomTemplateRegistry {

	const SLUG_PREFIX = 'blockish-tb-';

	/** @var string[] */
	const ASSIGNABLE_POST_TYPES = array( 'page', 'post' );

	/**
	 * @return void
	 */
	public static function register_hooks() {
		add_filter( 'theme_templates', array( __CLASS__, 'filter_theme_templates' ), 10, 4 );
		add_action( 'rest_after_insert_' . PostType::POST_TYPE, array( __CLASS__, 'normalize_slug_after_rest_save' ), 10, 3 );
		add_action( 'save_post_' . PostType::POST_TYPE, array( __CLASS__, 'normalize_slug_on_save' ), 20, 2 );
	}

	/**
	 * Virtual theme template filename stored in `_wp_page_template`.
	 *
	 * @param int $post_id Theme Builder template post ID.
	 * @return string
	 */
	public static function template_file_for_post( $post_id ) {
		return self::SLUG_PREFIX . (int) $post_id . '.php';
	}

	/**
	 * Catalog / hierarchy slug for a custom TB template.
	 *
	 * @param int $post_id Theme Builder template post ID.
	 * @return string
	 */
	public static function slug_for_post( $post_id ) {
		return self::SLUG_PREFIX . (int) $post_id;
	}

	/**
	 * @param string $slug Sanitized slug or template basename.
	 * @return bool
	 */
	public static function is_custom_slug( $slug ) {
		return is_string( $slug ) && 0 === strpos( $slug, self::SLUG_PREFIX );
	}

	/**
	 * @param string $slug Sanitized slug or template basename.
	 * @return int
	 */
	public static function post_id_from_slug( $slug ) {
		if ( ! self::is_custom_slug( $slug ) ) {
			return 0;
		}

		return (int) substr( $slug, strlen( self::SLUG_PREFIX ) );
	}

	/**
	 * @param int    $post_id Theme Builder post ID.
	 * @param string $slug    Current blockish_tb_slug meta.
	 * @return bool
	 */
	public static function is_assignable_custom_template( $post_id, $slug ) {
		$post_id = (int) $post_id;
		$slug    = sanitize_title( (string) $slug );

		if ( 'custom' === $slug ) {
			return true;
		}

		return self::is_custom_slug( $slug ) && self::post_id_from_slug( $slug ) === $post_id;
	}

	/**
	 * @param string[]     $post_templates Theme templates keyed by filename.
	 * @param \WP_Theme    $theme          Theme object.
	 * @param \WP_Post|null $post          Post being edited.
	 * @param string       $post_type      Post type.
	 * @return string[]
	 */
	public static function filter_theme_templates( $post_templates, $theme, $post, $post_type ) {
		unset( $theme, $post );

		if ( ! ClassicThemeBridge::is_enabled() ) {
			return $post_templates;
		}

		if ( ! in_array( (string) $post_type, self::ASSIGNABLE_POST_TYPES, true ) ) {
			return $post_templates;
		}

		foreach ( self::query_assignable_templates() as $tb_post ) {
			if ( ! self::is_template_active( $tb_post->ID ) ) {
				continue;
			}

			self::normalize_slug_for_post( $tb_post->ID );

			$label = trim( (string) $tb_post->post_title );
			if ( '' === $label ) {
				$label = sprintf(
					/* translators: %d: Theme Builder template post ID. */
					__( 'Theme Builder template #%d', 'blockish' ),
					$tb_post->ID
				);
			}

			$post_templates[ self::template_file_for_post( $tb_post->ID ) ] = $label;
		}

		return $post_templates;
	}

	/**
	 * @param \WP_Post         $post     Saved post.
	 * @param \WP_REST_Request $request  Request.
	 * @param bool             $creating Created vs updated.
	 * @return void
	 */
	public static function normalize_slug_after_rest_save( $post, $request, $creating ) {
		unset( $request, $creating );

		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		self::normalize_slug_for_post( $post->ID );
	}

	/**
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 * @return void
	 */
	public static function normalize_slug_on_save( $post_id, $post ) {
		unset( $post );

		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		self::normalize_slug_for_post( $post_id );
	}

	/**
	 * Legacy creates used slug `custom`; assign a stable per-template slug.
	 *
	 * @param int $post_id Theme Builder post ID.
	 * @return void
	 */
	public static function normalize_slug_for_post( $post_id ) {
		$post_id = (int) $post_id;
		if ( $post_id <= 0 || PostType::POST_TYPE !== get_post_type( $post_id ) ) {
			return;
		}

		if ( PostType::KIND_TEMPLATE !== get_post_meta( $post_id, PostType::META_KIND, true ) ) {
			return;
		}

		$slug = sanitize_title( (string) get_post_meta( $post_id, PostType::META_SLUG, true ) );
		if ( ! self::is_assignable_custom_template( $post_id, $slug ) ) {
			return;
		}

		$target = self::slug_for_post( $post_id );
		if ( $slug === $target ) {
			return;
		}

		update_post_meta( $post_id, PostType::META_SLUG, $target );
	}

	/**
	 * @return \WP_Post[]
	 */
	private static function query_assignable_templates() {
		$posts = get_posts(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => 'publish',
				'posts_per_page'         => -1,
				'orderby'                => 'title',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					array(
						'key'   => PostType::META_KIND,
						'value' => PostType::KIND_TEMPLATE,
					),
				),
			)
		);

		if ( ! is_array( $posts ) ) {
			return array();
		}

		return array_values(
			array_filter(
				$posts,
				static function ( $post ) {
					if ( ! $post instanceof \WP_Post ) {
						return false;
					}
					$slug = get_post_meta( $post->ID, PostType::META_SLUG, true );
					return self::is_assignable_custom_template( $post->ID, $slug );
				}
			)
		);
	}

	/**
	 * @param int $post_id Theme Builder template post ID.
	 * @return bool
	 */
	private static function is_template_active( $post_id ) {
		$active = get_post_meta( (int) $post_id, PostType::META_ACTIVE, true );
		return '' === $active || (bool) $active;
	}
}
