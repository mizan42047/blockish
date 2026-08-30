<?php

namespace Blockish\Mcp;

use Blockish\Extensions\ThemeBuilder;

defined( 'ABSPATH' ) || exit;

/**
 * Route template MCP tools to FSE or Theme Builder based on the active theme.
 */
class TemplateRouting {

	const BACKEND_FSE           = 'fse';
	const BACKEND_THEME_BUILDER = 'theme_builder';

	/**
	 * @return string One of BACKEND_* constants, or empty when unavailable.
	 */
	public static function backend(): string {
		if ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) {
			return self::BACKEND_FSE;
		}

		if ( class_exists( ThemeBuilder::class ) && ThemeBuilder::is_enabled() ) {
			return self::BACKEND_THEME_BUILDER;
		}

		return '';
	}

	/**
	 * @return array{error:string}
	 */
	public static function unavailable_error(): array {
		if ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) {
			return array(
				'error' => 'Template tools are unavailable on this block theme setup.',
			);
		}

		return array(
			'error' => 'No template backend is available. On classic themes, enable the Theme Builder extension. On block themes, use Full Site Editing (Site Editor) templates.',
		);
	}
}
