<?php
/**
 * Widgets Settings Handler
 *
 * @package Blockish
 * @since 2.7.0
 */

namespace Blockish\Admin\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;


/**
 * Widgets Settings Handler
 *
 * @since 2.7.0
 */
class Blocks_Settings {

	private static $instance = null;

	/**
	 * Namespace
	 *
	 * @var string
	 */
	protected $namespace;

	/**
	 * Rest Base
	 *
	 * @var string
	 */

	protected $rest_base;

	const WIDGETS_DB_KEY           = 'blockish_inactive_blocks';
	const WIDGETS_3RD_PARTY_DB_KEY = 'blockish_inactive_3rd_party_blocks';
	const EXTENSIONS_DB_KEY        = 'blockish_inactive_extensions';
	const API_DB_KEY               = 'blockish_api';

	/**
	 * Construct
	 */
	public function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'blocks-settings';
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register the routes
	 *
	 * @since 2.7.0
	 */
	public function register_rest_routes() {

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'get_settings' ),
				// 'permission_callback' => array( $this, 'permissions_check' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/save',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'set_settings' ),
				'permission_callback' => array( $this, 'permissions_check' ),
			)
		);
	}

	/**
	 * Check the permissions for getting the settings
	 *
	 * @since 2.7.0
	 */
	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Set Sync
	 *
	 * @since 2.7.0
	 */
	public function get_settings( WP_REST_Request $request ) {

		$params = $request->get_params();

		$action = isset( $params['action'] ) ? sanitize_text_field( $params['action'] ) : false;

		if ( ! $action ) {
			return new WP_Error( 'no_settings', esc_html__( 'Oops, Settings is not found.' ), array( 'status' => 404 ) );
		}

		switch ( $action ) {
			case 'get_blocks':
				$blocks = $this->get_blocks_list( 'blockish_blocks' );
				return new WP_REST_Response( $blocks, 200 );

			case 'get_extensions':
				$extensions = $this->get_blocks_list( 'blockish_extensions' );
				return new WP_REST_Response( $extensions, 200 );

			case 'get_3rd_party':
				$_3rd_party = $this->get_blocks_list( 'blockish_3rd_party_widget' );
				return new WP_REST_Response( $_3rd_party, 200 );

			default:
				return new WP_Error( 'no_action', esc_html__( 'Oops, Action is not found.' ), array( 'status' => 404 ) );
		}
	}

	/**
	 * Set Settings
	 *
	 * @since 2.7.0
	 */
	public function set_settings( WP_REST_Request $request ) {

		$params = $request->get_params();

		$action = isset( $params['action'] ) ? sanitize_text_field( $params['action'] ) : false;

		if ( ! $action ) {
			return new WP_Error( 'no_settings', esc_html__( 'Oops, Settings is not found.' ), array( 'status' => 404 ) );
		}

		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_Error( 'rest_cookie_invalid_nonce', __( 'Cookie nonce is invalid' ), array( 'status' => 403 ) );
		}

		switch ( $action ) {
			case 'get_blocks':
				$blocks = $this->save_options( 'blockish_inactive_blocks', $params['blocks'] );
				return new WP_REST_Response( $blocks, 200 );

			case 'get_extensions':
				$extensions = $this->save_options( 'blockish_inactive_extensions', $params['blocks'] );
				return new WP_REST_Response( $extensions, 200 );

			case 'get_3rd_party':
				$_3rd_party = $this->save_options( 'blockish_inactive_3rd_party_blocks', $params['blocks'] );
				return new WP_REST_Response( $_3rd_party, 200 );

			default:
				return new WP_Error( 'no_action', esc_html__( 'Oops, Action is not found.' ), array( 'status' => 404 ) );
		}
	}

	/**
	 * Save Options
	 */
	public function save_options( $option_name, $values ) {

		$post_value = $values ?? '';

		foreach ( $post_value as $key => &$value ) {
			if ( $value === 'on' ) {
				unset( $post_value[ $key ] );
			} else {
				$value = sanitize_text_field( $value );
			}
		}

		if ( self::API_DB_KEY === $option_name || count( $post_value ) > 1 ) {
			unset( $post_value['na'] );
		}

		$filter_value = ( self::API_DB_KEY !== $option_name ) ? array_keys( $post_value ) : $post_value;
		$savedOption  = get_option( $option_name, array() );

		if ( $savedOption === $post_value ) {
			return array(
				'status' => 'error',
				'title'  => esc_html__( 'Already Updated.', 'blockish' ),
				'msg'    => esc_html__( 'There is no change in your settings. So there is no need to save the settings again.', 'blockish' ),
			);
		} elseif ( update_option( $option_name, $filter_value ) ) {
			return array(
				'status' => 'success',
				'title'  => esc_html__( 'Successfully Updated.', 'blockish' ),
				'msg'    => esc_html__( 'Great, your settings saved successfully in your system.', 'blockish' ),
			);
		} else {
			return array(
				'status' => 'error',
				'title'  => esc_html__( 'Update Failed.', 'blockish' ),
				'msg'    => esc_html__( 'There was an error updating your settings. Please try again.', 'blockish' ),
			);
		}
	}


	/**
	 * Get Widgets List
	 *
	 * @since 2.7.0
	 */
	public function get_blocks_list( $list_name ) {

		// $blocks_fields = Blockish_Admin::get_element_list();

		// $_blocks = $blocks_fields[ $list_name ];

		// return $_blocks;
    $blocks_db = get_option( 'blockish_inactive_blocks', array() );
		$blocks = array(
			array(
				'name'         => 'container',
				'label'        => __( 'Container', 'blockish' ),
				'type'         => 'checkbox',
				'value'        => ! in_array( 'container', $blocks_db ) ? 'on' : 'off',
				'default'      => 'on',
				'video_url'    => '#',
				'content_type' => 'custom',
				'widget_type'  => 'free',
				'demo_url'     => '#',
			),
		);
		return $blocks;
	}
}
