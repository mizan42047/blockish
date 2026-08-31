<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

use Blockish\ThemeBuilder\ClassicThemeLocations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Astra: disable native header/footer markup and inject TB parts on theme hooks.
 *
 * Same integration Header Footer Elementor uses for Astra.
 */
class AstraCompat {

	/**
	 * @param bool $header_enabled TB header matched.
	 * @param bool $footer_enabled TB footer matched.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( $header_enabled ) {
			self::disable_theme_header();
			add_action( 'astra_header', array( ClassicThemeLocations::class, 'render_header' ), 0 );
		}

		if ( $footer_enabled ) {
			self::disable_theme_footer();
			add_action( 'astra_footer', array( ClassicThemeLocations::class, 'render_footer' ), 0 );
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_header() {
		remove_action( 'astra_header', 'astra_header_markup' );

		if ( class_exists( '\Astra_Builder_Helper' ) && ! empty( \Astra_Builder_Helper::$is_header_footer_builder_active ) ) {
			remove_action( 'astra_header', array( \Astra_Builder_Header::get_instance(), 'prepare_header_builder_markup' ) );
		}
	}

	/**
	 * @return void
	 */
	public static function disable_theme_footer() {
		remove_action( 'astra_footer', 'astra_footer_markup' );

		if ( class_exists( '\Astra_Builder_Helper' ) && ! empty( \Astra_Builder_Helper::$is_header_footer_builder_active ) ) {
			remove_action( 'astra_footer', array( \Astra_Builder_Footer::get_instance(), 'footer_markup' ) );
		}
	}
}
