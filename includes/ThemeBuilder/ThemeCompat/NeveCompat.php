<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Neve theme header/footer hook integration.
 */
class NeveCompat {

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			self::disable_theme_header();
		}

		if ( $footer_enabled ) {
			self::disable_theme_footer();
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_header() {
		remove_all_actions( 'neve_do_header' );
		remove_all_actions( 'neve_do_top_bar' );
		add_action( 'neve_do_header', array( ClassicThemeLocations::class, 'render_header' ), 0 );
	}

	/**
	 * @return void
	 */
	public static function disable_theme_footer() {
		remove_all_actions( 'neve_do_footer' );
		add_action( 'neve_do_footer', array( ClassicThemeLocations::class, 'render_footer' ), 0 );
	}
}
