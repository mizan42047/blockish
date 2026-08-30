<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Blocksy theme header/footer hook integration.
 */
class BlocksyCompat {

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			self::disable_theme_header();
			add_action( 'blocksy:header:before', array( ClassicThemeLocations::class, 'render_header' ), 5 );
		}

		if ( $footer_enabled ) {
			self::disable_theme_footer();
			add_action( 'blocksy:footer:before', array( ClassicThemeLocations::class, 'render_footer' ), 5 );
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_header() {
		add_filter( 'blocksy:builder:header:enabled', '__return_false' );
	}

	/**
	 * @return void
	 */
	public static function disable_theme_footer() {
		add_filter( 'blocksy:builder:footer:enabled', '__return_false' );
	}
}
