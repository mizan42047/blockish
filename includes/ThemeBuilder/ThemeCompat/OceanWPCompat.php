<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OceanWP theme header/footer hook integration.
 */
class OceanWPCompat {

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			self::disable_theme_header();
			add_action( 'ocean_header', array( ClassicThemeLocations::class, 'render_header' ) );
		}

		if ( $footer_enabled ) {
			self::disable_theme_footer();
			add_action( 'ocean_footer', array( ClassicThemeLocations::class, 'render_footer' ) );
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_header() {
		remove_action( 'ocean_top_bar', 'oceanwp_top_bar_template' );
		remove_action( 'ocean_header', 'oceanwp_header_template' );
		remove_action( 'ocean_page_header', 'oceanwp_page_header_template' );
	}

	/**
	 * @return void
	 */
	public static function disable_theme_footer() {
		remove_action( 'ocean_footer', 'oceanwp_footer_template' );
	}
}
