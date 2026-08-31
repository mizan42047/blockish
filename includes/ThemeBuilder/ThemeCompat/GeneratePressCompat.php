<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * GeneratePress header/footer hook integration.
 */
class GeneratePressCompat {

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			self::disable_theme_header();
			add_action( 'generate_header', array( ClassicThemeLocations::class, 'render_header' ) );
		}

		if ( $footer_enabled ) {
			self::disable_theme_footer();
			add_action( 'generate_footer', array( ClassicThemeLocations::class, 'render_footer' ) );
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_header() {
		remove_action( 'generate_header', 'generate_construct_header' );
	}

	/**
	 * @return void
	 */
	public static function disable_theme_footer() {
		remove_action( 'generate_footer', 'generate_construct_footer_widgets', 5 );
		remove_action( 'generate_footer', 'generate_construct_footer' );
	}
}
