<?php
namespace Blockish\ThemeBuilder\ThemeCompat;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pick a theme-specific header/footer integration or fall back to get_header stubs.
 */
class ThemeCompatRegistry {

	/**
	 * @param bool $header_enabled Whether a TB header part matched this request.
	 * @param bool $footer_enabled Whether a TB footer part matched this request.
	 * @return void
	 */
	public static function boot( $header_enabled, $footer_enabled ) {
		if ( ! $header_enabled && ! $footer_enabled ) {
			return;
		}

		$template = get_template();
		$map      = array(
			'astra'         => AstraCompat::class,
			'generatepress' => GeneratePressCompat::class,
			'kadence'       => KadenceCompat::class,
			'oceanwp'       => OceanWPCompat::class,
			'neve'          => NeveCompat::class,
			'blocksy'       => BlocksyCompat::class,
		);

		/**
		 * Map theme template slugs to Theme Builder compat classes.
		 *
		 * Each class must expose a static boot( bool $header, bool $footer ) method.
		 *
		 * @param array<string, class-string> $map      Theme slug => compat class.
		 * @param bool                        $header   TB header active.
		 * @param bool                        $footer   TB footer active.
		 */
		$map = apply_filters( 'blockish_tb_theme_compat_map', $map, $header_enabled, $footer_enabled );

		if ( isset( $map[ $template ] ) && is_string( $map[ $template ] ) && class_exists( $map[ $template ] ) ) {
			$map[ $template ]::boot( $header_enabled, $footer_enabled );
			return;
		}

		DefaultCompat::boot( $header_enabled, $footer_enabled );
	}
}
