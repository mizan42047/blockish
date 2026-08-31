<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Replace classic theme header/footer with Theme Builder parts.
 *
 * Full TB templates still render via ClassicThemeBridge + template-canvas.php.
 * Parts-only uses theme hooks (Astra, GeneratePress, …) or the HFE-style
 * get_header / get_footer stub fallback — never CSS hide or a synthetic canvas shell.
 */
class ClassicThemeLocations {

	/** @var bool */
	private static $booted = false;

	/** @var bool */
	private static $header_enabled = false;

	/** @var bool */
	private static $footer_enabled = false;

	/**
	 * @return void
	 */
	public static function register_hooks() {
		// Locations boot from ClassicThemeBridge::template_include when no full template matches.
	}

	/**
	 * Boot header/footer replacement for the current request (once).
	 *
	 * @return void
	 */
	public static function boot_for_request() {
		if ( self::$booted || is_admin() || is_feed() || is_embed() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		if ( ! ClassicThemeBridge::is_enabled() ) {
			return;
		}

		self::$header_enabled = null !== PartResolver::resolve( PostType::AREA_HEADER );
		self::$footer_enabled = null !== PartResolver::resolve( PostType::AREA_FOOTER );

		if ( ! self::$header_enabled && ! self::$footer_enabled ) {
			return;
		}

		self::$booted = true;

		if ( class_exists( '\Blockish\Core\PostPrime' ) ) {
			\Blockish\Core\PostPrime::prime_theme_builder_parts();
		}

		ThemeCompat\ThemeCompatRegistry::boot( self::$header_enabled, self::$footer_enabled );
	}

	/**
	 * Whether a TB location is active for the current request.
	 *
	 * @param string $location header|footer.
	 * @return bool
	 */
	public static function is_location_enabled( $location ) {
		$location = sanitize_title( (string) $location );
		if ( 'header' === $location ) {
			return self::$header_enabled;
		}
		if ( 'footer' === $location ) {
			return self::$footer_enabled;
		}
		return false;
	}

	/**
	 * Echo a resolved header or footer part.
	 *
	 * @param string $location header|footer.
	 * @return void
	 */
	public static function render_location( $location ) {
		$location = sanitize_title( (string) $location );
		if ( ! in_array( $location, array( PostType::AREA_HEADER, PostType::AREA_FOOTER ), true ) ) {
			return;
		}

		if ( ! self::is_location_enabled( $location ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- block render escapes internally.
		echo PartResolver::render_area( $location );
	}

	/**
	 * @return void
	 */
	public static function render_header() {
		self::render_location( PostType::AREA_HEADER );
	}

	/**
	 * @return void
	 */
	public static function render_footer() {
		self::render_location( PostType::AREA_FOOTER );
	}
}
