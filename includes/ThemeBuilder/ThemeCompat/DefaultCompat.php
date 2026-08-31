<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fallback for themes without a dedicated compat class.
 *
 * Mirrors Header Footer Elementor's default compat: intercept get_header / get_footer,
 * render a minimal document shell + TB part, and require_once the theme template so
 * WordPress skips loading it again (load_template uses require_once).
 */
class DefaultCompat {

	/** @var bool */
	private static $header_hooked = false;

	/** @var bool */
	private static $footer_hooked = false;

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			add_action( 'get_header', array( __CLASS__, 'override_header' ), 0 );
			add_action( 'blockish_tb_header', array( ClassicThemeLocations::class, 'render_header' ) );
			self::$header_hooked = true;

			add_filter( 'show_admin_bar', array( __CLASS__, 'relocate_admin_bar' ) );
		}

		if ( $footer_enabled ) {
			add_action( 'get_footer', array( __CLASS__, 'override_footer' ), 0 );
			add_action( 'blockish_tb_footer', array( ClassicThemeLocations::class, 'render_footer' ) );
			self::$footer_hooked = true;
		}
	}

	/**
	 * Render admin bar after wp_body_open when the theme header.php is bypassed.
	 *
	 * @param bool $show Whether to show the admin bar.
	 * @return bool
	 */
	public static function relocate_admin_bar( $show ) {
		if ( ! $show || ! self::$header_hooked ) {
			return $show;
		}

		add_action( 'wp_body_open', 'wp_admin_bar_render', 0 );

		return false;
	}

	/**
	 * @param string|null $name Header name.
	 * @param array       $args Template args.
	 * @return void
	 */
	public static function override_header( $name = null, $args = array() ) {
		unset( $name, $args );

		require BLOCKISH_DIR . 'includes/ThemeBuilder/stubs/document-header.php';

		$templates   = array();
		$templates[] = 'header.php';

		remove_all_actions( 'wp_head' );
		ob_start();
		locate_template( $templates, true );
		ob_end_clean();
	}

	/**
	 * @param string|null $name Footer name.
	 * @param array       $args Template args.
	 * @return void
	 */
	public static function override_footer( $name = null, $args = array() ) {
		unset( $name, $args );

		require BLOCKISH_DIR . 'includes/ThemeBuilder/stubs/document-footer.php';

		$templates   = array();
		$templates[] = 'footer.php';

		remove_all_actions( 'wp_footer' );
		ob_start();
		locate_template( $templates, true );
		ob_end_clean();
	}
}
