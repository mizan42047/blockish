<?php

namespace Blockish\Mcp\Abilities\GetTemplates;

use Blockish\Mcp\Abilities\ThemeBuilderTemplates;
use Blockish\Mcp\SchemaUtils;
use Blockish\Mcp\TemplateRouting;

defined( 'ABSPATH' ) || exit;

class Callbacks {

	public static function get_templates( $input ): array {
		$backend = TemplateRouting::backend();
		if ( TemplateRouting::BACKEND_THEME_BUILDER === $backend ) {
			return ThemeBuilderTemplates::get_templates( is_array( $input ) ? $input : array() );
		}
		if ( TemplateRouting::BACKEND_FSE !== $backend ) {
			return TemplateRouting::unavailable_error();
		}

		return self::get_fse_templates( is_array( $input ) ? $input : array() );
	}

	/**
	 * @param array<string, mixed> $input Tool input.
	 * @return array<string, mixed>
	 */
	private static function get_fse_templates( array $input ): array {
		$theme_slug = wp_get_theme()->get_stylesheet();
		$post_type  = $input['type'] ?? array( 'wp_template', 'wp_template_part' );

		if ( ! is_array( $post_type ) ) {
			$post_type = array( $post_type );
		}

		$templates = array();

		foreach ( $post_type as $pt ) {
			$query_args = array();
			if ( ! empty( $input['slug'] ) ) {
				$query_args['slug__in'] = array( $input['slug'] );
			}

			$block_templates = get_block_templates( $query_args, $pt );

			foreach ( $block_templates as $template ) {
				$has_preview = SchemaUtils::content_has_ai_preview( (string) $template->content );

				$template_data = array(
					'id'             => $template->wp_id ?? 0,
					'slug'           => $template->slug,
					'title'          => $template->title,
					'type'           => $template->type,
					'area'           => $template->area ?? '',
					'source'         => $template->source,
					'is_custom'      => $template->is_custom,
					'has_theme_file' => $template->has_theme_file,
					'schema_staged'  => $has_preview,
				);

				if ( ! empty( $input['slug'] ) ) {
					$template_data['content'] = $template->content;
					$template_data['schema']  = SchemaUtils::resolve_schema_from_content( (string) $template->content );
				}

				$templates[] = $template_data;
			}
		}

		return array(
			'backend'   => TemplateRouting::BACKEND_FSE,
			'theme'     => $theme_slug,
			'templates' => $templates,
		);
	}
}
