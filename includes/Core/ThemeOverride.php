<?php

namespace Blockish\Core;

defined( 'ABSPATH' ) || exit;

/**
 * Per-block / global theme override strength via body + bb-nested-* wrapper classes.
 */
class ThemeOverride {

	const OPTION_KEY = 'blockish_global_theme_override_level';
	const ATTR_KEY   = 'themeOverrideLevel';
	const MAX_LEVEL  = 4;

	/**
	 * Site-wide default (0–4).
	 *
	 * @return int
	 */
	public static function get_global_level() {
		return self::sanitize_level( (int) get_option( self::OPTION_KEY, 0 ) );
	}

	/**
	 * @param int $level Raw level.
	 * @return int
	 */
	public static function sanitize_level( $level ) {
		return max( 0, min( self::MAX_LEVEL, (int) $level ) );
	}

	/**
	 * Resolve effective level for a block (inherit → global).
	 *
	 * @param array $attrs Block attributes.
	 * @return int
	 */
	public static function resolve_level( $attrs ) {
		if ( ! is_array( $attrs ) ) {
			return self::get_global_level();
		}

		$raw = $attrs[ self::ATTR_KEY ] ?? 'inherit';

		if ( 'inherit' === $raw || '' === $raw || null === $raw ) {
			return self::get_global_level();
		}

		if ( is_numeric( $raw ) ) {
			return self::sanitize_level( (int) $raw );
		}

		return self::get_global_level();
	}

	/**
	 * @param int $level Effective override level.
	 * @return array<int, string>
	 */
	public static function nested_class_names( $level ) {
		$level = self::sanitize_level( $level );
		$names = array();

		for ( $i = 1; $i <= $level; $i++ ) {
			$names[] = 'bb-nested-' . $i;
		}

		return $names;
	}

	/**
	 * CSS selector root for {{WRAPPER}} / {{SELECTOR}} (includes leading dot chain).
	 *
	 * @param string $block_class e.g. bb-a1b2c3 (no dot).
	 * @param int    $level       Effective override level.
	 * @return string
	 */
	public static function wrapper_selector( $block_class, $level ) {
		$block_class = trim( (string) $block_class );
		if ( '' === $block_class ) {
			return '';
		}

		$base  = '.' . $block_class . '.blockish-block-wrapper';
		$level = self::sanitize_level( $level );

		if ( $level <= 0 ) {
			return $base;
		}

		$nested = '';
		for ( $i = 1; $i <= $level; $i++ ) {
			$nested .= '.bb-nested-' . $i;
		}

		return 'body ' . $base . $nested;
	}

	/**
	 * Replace {{WRAPPER}} placeholders using a precomputed wrapper selector.
	 *
	 * @param string $selector     Selector template.
	 * @param string $wrapper_root Precomputed wrapper selector.
	 * @return string
	 */
	public static function replace_wrapper_token_with_root( $selector, $wrapper_root ) {
		return str_replace(
			array( '.{{WRAPPER}}', '{{WRAPPER}}' ),
			array( $wrapper_root, $wrapper_root ),
			(string) $selector
		);
	}

	/**
	 * Replace {{WRAPPER}} placeholders inside a selector string.
	 *
	 * @param string $selector    Selector template.
	 * @param string $block_class Block class slug (bb-*).
	 * @param int    $level       Effective level.
	 * @return string
	 */
	public static function replace_wrapper_token( $selector, $block_class, $level ) {
		return self::replace_wrapper_token_with_root(
			$selector,
			self::wrapper_selector( $block_class, $level )
		);
	}
}
