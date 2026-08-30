<?php

namespace Blockish\Mcp\Abilities\GetTemplates;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-templates';

    public static function get(): array
    {
        return [
            'label'               => __('Get Templates', 'blockish'),
            'description'         => __('Fetches templates and template parts for the active theme. Block themes: Site Editor (wp_template / wp_template_part). Classic themes with Theme Builder enabled: blockish_tb templates and parts. Same tool either way — check `backend` in the response (`fse` or `theme_builder`).', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'type' => [
                        'type' => 'string',
                        'description' => 'Optional filter. Either "wp_template" or "wp_template_part". If omitted, returns both.',
                        'enum' => ['wp_template', 'wp_template_part']
                    ],
                    'slug' => [
                        'type' => 'string',
                        'description' => 'Optional slug to fetch a specific template and its schema.',
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'backend'   => ['type' => 'string', 'description' => 'Template backend: fse or theme_builder.'],
                    'theme'     => ['type' => 'string'],
                    'templates' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'            => ['type' => 'integer'],
                                'slug'          => ['type' => 'string'],
                                'title'         => ['type' => 'string'],
                                'type'          => ['type' => 'string', 'description' => 'wp_template or wp_template_part (same for both backends).'],
                                'kind'          => ['type' => 'string', 'description' => 'Theme Builder only: template or part.'],
                                'area'          => ['type' => 'string'],
                                'show_on'       => ['type' => 'string', 'description' => 'Theme Builder header/footer parts only (entire_site, front_page, 404, …).'],
                                'active'        => ['type' => 'boolean', 'description' => 'Theme Builder only.'],
                                'source'        => ['type' => 'string', 'description' => 'Origin of the template: "theme" (default file) or "custom" (user modified).'],
                                'is_custom'     => ['type' => 'boolean', 'description' => 'True if this template has been customized in the database.'],
                                'has_theme_file'=> ['type' => 'boolean', 'description' => 'True if a default physical file exists for this template.'],
                                'schema_staged' => ['type' => 'boolean', 'description' => 'True when template content currently contains a staged blockish/ai-preview block.'],
                                'content'       => ['type' => 'string', 'description' => 'Raw post_content. Only included when fetching via slug.'],
                                'schema'        => ['type' => 'array', 'description' => 'Resolved schema for editing. If content has ai-preview, this is pendingSchema; otherwise parsed from content. Present only if fetched by slug.'],
                            ],
                        ],
                    ],
                    'error'     => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_templates'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use before blockish/manage-template. Works on block themes (FSE) and classic themes with Theme Builder enabled. Response `backend` tells you which system is active.',
            ],
        ];
    }
}
