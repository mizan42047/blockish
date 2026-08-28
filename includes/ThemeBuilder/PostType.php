<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Theme Builder CPT: templates & template parts (own storage, not wp_template).
 */
class PostType {
	use \Blockish\Traits\SingletonTrait;

	const POST_TYPE       = 'blockish_tb';
	const META_KIND       = 'blockish_tb_kind';
	const META_SLUG       = 'blockish_tb_slug';
	const META_ACTIVE     = 'blockish_tb_active';
	const META_AREA       = 'blockish_tb_area';
	const META_CONDITIONS = 'blockish_tb_conditions';
	const META_PRIORITY   = 'blockish_tb_priority';

	/** Meta kind for the library host post (stored value; do not change). */
	const KIND_LIBRARY  = 'shell';
	const KIND_TEMPLATE = 'template';
	const KIND_PART     = 'part';

	/** @deprecated Use KIND_LIBRARY. */
	const KIND_SHELL = self::KIND_LIBRARY;

	const AREA_HEADER        = 'header';
	const AREA_FOOTER        = 'footer';
	const AREA_UNCATEGORIZED = 'uncategorized';

	protected function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_meta' ) );
		add_action( 'load-edit.php', array( $this, 'redirect_list_to_library' ) );
		add_filter( 'wp_insert_post_data', array( $this, 'force_publish_status' ), 10, 2 );
		add_filter( 'pre_trash_post', array( $this, 'force_delete_instead_of_trash' ), 10, 2 );
		add_filter( 'rest_pre_insert_' . self::POST_TYPE, array( $this, 'rest_guard_unique_slug' ), 10, 2 );
		add_filter( 'rest_pre_insert_' . self::POST_TYPE, array( $this, 'rest_guard_unique_part_placement' ), 11, 2 );
		/*
		 * Keep real `title` support for REST create/rename, but tell the block
		 * editor (via /wp/v2/types) that title is unsupported so the canvas
		 * PostTitle (inside the editor iframe) never mounts.
		 */
		add_filter( 'rest_prepare_post_type', array( $this, 'rest_hide_title_support_for_editor' ), 10, 2 );
		add_filter( 'rest_request_before_callbacks', array( $this, 'rest_before_blockish_tb_callbacks' ), 10, 3 );
		add_filter( 'rest_prepare_' . self::POST_TYPE, array( $this, 'rest_skip_block_render_in_content' ), 10, 3 );
	}

	/**
	 * Before blockish_tb REST handlers run, skip server-side block rendering.
	 *
	 * @param mixed            $response Response to replace.
	 * @param array            $handler  Route handler.
	 * @param \WP_REST_Request $request  Request object.
	 * @return mixed
	 */
	public function rest_before_blockish_tb_callbacks( $response, $handler, $request ) {
		unset( $handler );

		$route = $request->get_route();
		if ( ! is_string( $route ) || ! str_contains( $route, '/blockish_tb' ) ) {
			return $response;
		}

		add_filter( 'the_content', array( $this, 'rest_return_empty_rendered_content' ), 0 );

		return $response;
	}

	/**
	 * @param string $content Post content.
	 * @return string
	 */
	public function rest_return_empty_rendered_content( $content ) {
		unset( $content );

		return '';
	}

	/**
	 * Skip server-side block rendering in REST responses.
	 *
	 * Dynamic blocks (e.g. WooCommerce mini-cart) expect a frontend cart session
	 * and can fatal when the Theme Builder library lists all blockish_tb posts.
	 *
	 * @param \WP_REST_Response $response Response object.
	 * @param \WP_Post          $post     Post object.
	 * @param \WP_REST_Request  $request  Request object.
	 * @return \WP_REST_Response
	 */
	public function rest_skip_block_render_in_content( $response, $post, $request ) {
		unset( $post, $request );

		$data = $response->get_data();
		if ( isset( $data['content'] ) && is_array( $data['content'] ) ) {
			$data['content']['rendered'] = '';
			$response->set_data( $data );
		}

		return $response;
	}

	/**
	 * Native WP list → Theme Builder library screen.
	 */
	public function redirect_list_to_library() {
		$post_type = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( self::POST_TYPE !== $post_type ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_safe_redirect( DefaultPosts::get_library_edit_url() );
		exit;
	}

	public function register_post_type() {
		$labels = array(
			'name'               => _x( 'Theme Builder', 'Post Type General Name', 'blockish' ),
			'singular_name'      => _x( 'Theme Builder', 'Post Type Singular Name', 'blockish' ),
			'menu_name'          => __( 'Theme Builder', 'blockish' ),
			'name_admin_bar'     => __( 'Theme Builder', 'blockish' ),
			'all_items'          => __( 'All Items', 'blockish' ),
			'add_new_item'       => __( 'Add New', 'blockish' ),
			'add_new'            => __( 'Add New', 'blockish' ),
			'new_item'           => __( 'New Item', 'blockish' ),
			'edit_item'          => __( 'Edit Item', 'blockish' ),
			'update_item'        => __( 'Update Item', 'blockish' ),
			'view_item'          => __( 'View Item', 'blockish' ),
			'search_items'       => __( 'Search Theme Builder', 'blockish' ),
			'not_found'          => __( 'Not found', 'blockish' ),
			'not_found_in_trash' => __( 'Not found in Trash', 'blockish' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'label'               => __( 'Theme Builder', 'blockish' ),
				'labels'              => $labels,
				'supports'            => array( 'title', 'editor', 'custom-fields', 'revisions' ),
				'hierarchical'        => false,
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_admin_bar'   => false,
				'show_in_nav_menus'   => false,
				'can_export'          => true,
				'has_archive'         => false,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
				'show_in_rest'        => true,
				'rest_base'           => 'blockish_tb',
				'delete_with_user'    => false,
				'menu_icon'           => 'dashicons-welcome-widgets-menus',
			)
		);
	}

	public function register_meta() {
		$auth = static function () {
			return current_user_can( 'manage_options' );
		};

		register_post_meta(
			self::POST_TYPE,
			self::META_KIND,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => self::KIND_TEMPLATE,
				'auth_callback'     => $auth,
				'sanitize_callback' => array( __CLASS__, 'sanitize_kind' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_SLUG,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => '',
				'auth_callback'     => $auth,
				'sanitize_callback' => 'sanitize_title',
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_ACTIVE,
			array(
				'type'              => 'boolean',
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => true,
				'auth_callback'     => $auth,
				'sanitize_callback' => static function ( $value ) {
					return (bool) $value;
				},
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_AREA,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => self::AREA_UNCATEGORIZED,
				'auth_callback'     => $auth,
				'sanitize_callback' => array( __CLASS__, 'sanitize_area' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_CONDITIONS,
			array(
				'type'              => 'array',
				'single'            => true,
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'       => 'object',
							'properties' => array(
								'type'  => array( 'type' => 'string' ),
								'rule'  => array( 'type' => 'string' ),
								'value' => array( 'type' => 'string' ),
							),
						),
					),
				),
				'default'           => array(
					array(
						'type' => 'include',
						'rule' => 'entire_site',
					),
				),
				'auth_callback'     => $auth,
				'sanitize_callback' => array( Conditions::class, 'sanitize' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_PRIORITY,
			array(
				'type'              => 'integer',
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => 10,
				'auth_callback'     => $auth,
				'sanitize_callback' => static function ( $value ) {
					return (int) $value;
				},
			)
		);
	}

	/**
	 * Hierarchy template/part slugs are unique per kind (index, home, header…).
	 * Custom templates may be created many times.
	 *
	 * @param \stdClass        $prepared Prepared post object.
	 * @param \WP_REST_Request $request  Request.
	 * @return \stdClass|\WP_Error
	 */
	public function rest_guard_unique_slug( $prepared, $request ) {
		$meta = $request->get_param( 'meta' );
		if ( ! is_array( $meta ) ) {
			return $prepared;
		}

		$kind = isset( $meta[ self::META_KIND ] ) ? self::sanitize_kind( $meta[ self::META_KIND ] ) : '';
		$slug = isset( $meta[ self::META_SLUG ] ) ? sanitize_title( (string) $meta[ self::META_SLUG ] ) : '';

		// Parts may share areas (multiple headers with different conditions).
		if ( self::KIND_PART === $kind ) {
			return $prepared;
		}

		if ( self::KIND_TEMPLATE !== $kind ) {
			return $prepared;
		}

		if ( '' === $slug || 'custom' === $slug ) {
			return $prepared;
		}

		$exclude_id = 0;
		if ( ! empty( $prepared->ID ) ) {
			$exclude_id = (int) $prepared->ID;
		} elseif ( $request instanceof \WP_REST_Request ) {
			$exclude_id = (int) $request->get_param( 'id' );
		}

		$existing = get_posts(
			array(
				'post_type'              => self::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => 1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'post__not_in'           => $exclude_id ? array( $exclude_id ) : array(),
				'meta_query'             => array(
					'relation' => 'AND',
					array(
						'key'   => self::META_KIND,
						'value' => $kind,
					),
					array(
						'key'   => self::META_SLUG,
						'value' => $slug,
					),
				),
			)
		);

		if ( ! empty( $existing ) ) {
			return new \WP_Error(
				'blockish_tb_slug_exists',
				__( 'This template type already exists. Only one is allowed.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		return $prepared;
	}

	/**
	 * One active placement per area + “Show on” rule (avoids silent frontend conflicts).
	 *
	 * @param \stdClass        $prepared Prepared post object.
	 * @param \WP_REST_Request $request  Request.
	 * @return \stdClass|\WP_Error
	 */
	public function rest_guard_unique_part_placement( $prepared, $request ) {
		if ( is_wp_error( $prepared ) ) {
			return $prepared;
		}

		$meta = $request->get_param( 'meta' );
		if ( ! is_array( $meta ) ) {
			return $prepared;
		}

		$exclude_id = 0;
		if ( ! empty( $prepared->ID ) ) {
			$exclude_id = (int) $prepared->ID;
		} elseif ( $request instanceof \WP_REST_Request ) {
			$exclude_id = (int) $request->get_param( 'id' );
		}

		$kind = isset( $meta[ self::META_KIND ] )
			? self::sanitize_kind( $meta[ self::META_KIND ] )
			: ( $exclude_id ? self::sanitize_kind( get_post_meta( $exclude_id, self::META_KIND, true ) ) : '' );
		if ( self::KIND_PART !== $kind ) {
			return $prepared;
		}

		if ( isset( $meta[ self::META_AREA ] ) ) {
			$area = self::sanitize_area( $meta[ self::META_AREA ] );
		} elseif ( isset( $meta[ self::META_SLUG ] ) ) {
			$area = self::area_from_slug( $meta[ self::META_SLUG ] );
		} elseif ( $exclude_id ) {
			$existing_area = get_post_meta( $exclude_id, self::META_AREA, true );
			$area          = '' !== (string) $existing_area
				? self::sanitize_area( $existing_area )
				: self::area_from_slug( get_post_meta( $exclude_id, self::META_SLUG, true ) );
		} else {
			$area = '';
		}

		if ( '' === $area ) {
			return $prepared;
		}

		if ( array_key_exists( self::META_CONDITIONS, $meta ) ) {
			$conditions = $meta[ self::META_CONDITIONS ];
		} elseif ( $exclude_id ) {
			$conditions = get_post_meta( $exclude_id, self::META_CONDITIONS, true );
		} else {
			$conditions = array();
		}

		$signature = Conditions::signature( $conditions );

		$existing = get_posts(
			array(
				'post_type'              => self::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => 50,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'post__not_in'           => $exclude_id ? array( $exclude_id ) : array(),
				'meta_query'             => array(
					array(
						'key'   => self::META_KIND,
						'value' => self::KIND_PART,
					),
				),
			)
		);

		foreach ( $existing as $post_id ) {
			$post_id   = (int) $post_id;
			$part_area = self::sanitize_area( get_post_meta( $post_id, self::META_AREA, true ) );
			if ( '' === $part_area ) {
				$part_area = self::area_from_slug( get_post_meta( $post_id, self::META_SLUG, true ) );
			}
			if ( $part_area !== $area ) {
				continue;
			}
			$part_sig = Conditions::signature( get_post_meta( $post_id, self::META_CONDITIONS, true ) );
			if ( $part_sig !== $signature ) {
				continue;
			}

			$title = get_the_title( $post_id );
			return new \WP_Error(
				'blockish_tb_part_placement_exists',
				sprintf(
					/* translators: %s: existing part title */
					__( 'Another part already uses this Area + “Show on” combination (“%s”). Choose a different location, or edit that part instead.', 'blockish' ),
					$title ? $title : __( 'Untitled', 'blockish' )
				),
				array(
					'status'      => 400,
					'existing_id' => $post_id,
					'area'        => $area,
					'signature'   => $signature,
				)
			);
		}

		return $prepared;
	}

	/**
	 * Hide title support from the block editor types payload only.
	 * REST post create/update still accepts title (real post type supports it).
	 *
	 * @param \WP_REST_Response $response Response.
	 * @param \WP_Post_Type     $post_type Post type object.
	 * @return \WP_REST_Response
	 */
	public function rest_hide_title_support_for_editor( $response, $post_type ) {
		if ( ! $post_type instanceof \WP_Post_Type || self::POST_TYPE !== $post_type->name ) {
			return $response;
		}

		$data = $response->get_data();
		if ( ! is_array( $data ) || empty( $data['supports'] ) || ! is_array( $data['supports'] ) ) {
			return $response;
		}

		unset( $data['supports']['title'] );
		$response->set_data( $data );

		return $response;
	}

	/**
	 * @param mixed $value Raw kind.
	 * @return string
	 */
	public static function sanitize_kind( $value ) {
		$value = sanitize_key( (string) $value );
		$allowed = array( self::KIND_SHELL, self::KIND_TEMPLATE, self::KIND_PART );
		return in_array( $value, $allowed, true ) ? $value : self::KIND_TEMPLATE;
	}

	/**
	 * @param mixed $value Raw area.
	 * @return string
	 */
	public static function sanitize_area( $value ) {
		$value = sanitize_title( (string) $value );
		if ( '' === $value ) {
			return self::AREA_HEADER;
		}
		$allowed = array( self::AREA_HEADER, self::AREA_FOOTER, self::AREA_UNCATEGORIZED );
		if ( in_array( $value, $allowed, true ) ) {
			return $value;
		}
		return $value;
	}

	/**
	 * Map catalog part slug → area.
	 *
	 * @param string $slug Part slug.
	 * @return string
	 */
	public static function area_from_slug( $slug ) {
		$slug = sanitize_title( (string) $slug );
		if ( 'header' === $slug || 'checkout-header' === $slug ) {
			return self::AREA_HEADER;
		}
		if ( 'footer' === $slug ) {
			return self::AREA_FOOTER;
		}
		// No "General" area in the product UI — unknown slugs stay as custom area keys.
		return $slug ? $slug : self::AREA_HEADER;
	}

	/**
	 * @param array $data    Sanitized post data.
	 * @param array $postarr Raw post data.
	 * @return array
	 */
	public function force_publish_status( $data, $postarr ) {
		if ( empty( $data['post_type'] ) || self::POST_TYPE !== $data['post_type'] ) {
			return $data;
		}

		$status = isset( $data['post_status'] ) ? $data['post_status'] : '';
		if ( in_array( $status, array( 'auto-draft', 'inherit', 'trash' ), true ) ) {
			return $data;
		}

		if ( 'publish' !== $status ) {
			$data['post_status'] = 'publish';
		}

		return $data;
	}

	/**
	 * @param bool|null $trash Whether to short-circuit trashing.
	 * @param \WP_Post  $post  Post being trashed.
	 * @return bool|null
	 */
	public function force_delete_instead_of_trash( $trash, $post ) {
		if ( ! $post instanceof \WP_Post || self::POST_TYPE !== $post->post_type ) {
			return $trash;
		}

		wp_delete_post( $post->ID, true );
		return true;
	}
}
