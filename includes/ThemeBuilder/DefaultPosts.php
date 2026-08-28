<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ensures the Theme Builder library host post exists (list UI), like Forms' default form.
 */
class DefaultPosts {
	use \Blockish\Traits\SingletonTrait;

	/** Post slug for the library host (WP post_name). */
	const LIBRARY_POST_SLUG = 'theme-builder-default';

	const OPTION_FLAG = 'blockish_tb_defaults_created';

	protected function __construct() {
		add_action( 'init', array( $this, 'maybe_create_defaults' ), 20 );
		add_action( 'wp_trash_post', array( $this, 'handle_deleted_library_post' ) );
		add_action( 'before_delete_post', array( $this, 'handle_deleted_library_post' ) );
	}

	/**
	 * @param int $post_id Post ID.
	 */
	public function handle_deleted_library_post( $post_id ) {
		$post = get_post( $post_id );
		if ( $post && self::LIBRARY_POST_SLUG === $post->post_name && PostType::POST_TYPE === $post->post_type ) {
			delete_option( self::OPTION_FLAG );
		}
	}

	public function maybe_create_defaults() {
		if ( get_option( self::OPTION_FLAG ) ) {
			if ( self::get_library_post() ) {
				return;
			}
		}

		if ( ! post_type_exists( PostType::POST_TYPE ) ) {
			return;
		}

		$library_id = $this->maybe_create_library_post();
		if ( $library_id ) {
			update_option( self::OPTION_FLAG, true, false );
		}
	}

	/**
	 * @return int
	 */
	private function maybe_create_library_post() {
		$existing = self::get_library_post();
		if ( $existing ) {
			return (int) $existing->ID;
		}

		$library_id = wp_insert_post(
			array(
				'post_type'    => PostType::POST_TYPE,
				'post_name'    => self::LIBRARY_POST_SLUG,
				'post_title'   => __( 'Theme Builder', 'blockish' ),
				'post_content' => '',
				'post_status'  => 'publish',
			),
			true
		);

		if ( is_wp_error( $library_id ) ) {
			return 0;
		}

		update_post_meta( (int) $library_id, PostType::META_KIND, PostType::KIND_LIBRARY );
		update_post_meta( (int) $library_id, PostType::META_SLUG, self::LIBRARY_POST_SLUG );
		update_post_meta( (int) $library_id, PostType::META_ACTIVE, false );

		return (int) $library_id;
	}

	/**
	 * @return string
	 */
	public static function get_library_edit_url() {
		$library = self::get_library_post();
		if ( ! $library ) {
			return admin_url( 'post-new.php?post_type=' . PostType::POST_TYPE );
		}
		return get_edit_post_link( $library->ID, 'raw' );
	}

	/**
	 * @return \WP_Post|null
	 */
	public static function get_library_post() {
		$posts = get_posts(
			array(
				'post_type'              => PostType::POST_TYPE,
				'name'                   => self::LIBRARY_POST_SLUG,
				'post_status'            => 'any',
				'posts_per_page'         => 1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		return ! empty( $posts ) ? $posts[0] : null;
	}
}
