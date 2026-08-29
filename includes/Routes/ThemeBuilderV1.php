<?php

namespace Blockish\Routes;

use Blockish\ThemeBuilder\SiteEditorMigration;
use WP_REST_Controller;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ThemeBuilderV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'theme-builder';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/migration-status',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_migration_status' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/migrate-to-site-editor',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'migrate_to_site_editor' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'edit_theme_options' );
	}

	public function get_migration_status() {
		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => array( __( 'Migration is only available on block themes.', 'blockish' ) ),
				)
			);
		}

		return rest_ensure_response(
			array(
				'status' => 'success',
				'data'   => SiteEditorMigration::get_status(),
			)
		);
	}

	public function migrate_to_site_editor( WP_REST_Request $request ) {
		unset( $request );

		$result = SiteEditorMigration::migrate_all( true );

		return rest_ensure_response( $result );
	}
}
