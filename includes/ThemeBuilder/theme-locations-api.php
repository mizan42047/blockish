<?php
/**
 * Theme Builder location API for classic themes.
 *
 * Theme authors can call blockish_theme_do_location() from header.php / footer.php
 * the same way Elementor themes call elementor_theme_do_location().
 *
 * @package Blockish
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'blockish_theme_do_location' ) ) {
	/**
	 * Render a Theme Builder location (header or footer) when active.
	 *
	 * @param string $location header|footer.
	 * @return bool True when Blockish rendered the location; false to fall back to theme markup.
	 */
	function blockish_theme_do_location( $location ) {
		if ( ! class_exists( '\Blockish\ThemeBuilder\ClassicThemeLocations' ) ) {
			return false;
		}

		if ( ! \Blockish\ThemeBuilder\ClassicThemeLocations::is_location_enabled( $location ) ) {
			return false;
		}

		\Blockish\ThemeBuilder\ClassicThemeLocations::render_location( $location );

		return true;
	}
}
