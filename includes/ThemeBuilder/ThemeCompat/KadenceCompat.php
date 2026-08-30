<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Kadence theme header/footer hook integration.
 */
class KadenceCompat {

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			self::disable_theme_header();
			add_action( 'kadence_header', array( ClassicThemeLocations::class, 'render_header' ), 0 );
		}

		if ( $footer_enabled ) {
			self::disable_theme_footer();
			add_action( 'kadence_footer', array( ClassicThemeLocations::class, 'render_footer' ), 0 );
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_header() {
		remove_all_actions( 'kadence_header' );
	}

	/**
	 * @return void
	 */
	public static function disable_theme_footer() {
		remove_all_actions( 'kadence_footer' );
	}
}
