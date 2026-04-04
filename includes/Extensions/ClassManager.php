<?php

namespace Blockish\Extensions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ClassManager {
	use \Blockish\Traits\SingletonTrait;

	/**
	 * @var array<string, array{slug: string, id: int}>
	 */
	private $used_classes = array();

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_action( 'wp_footer', array( $this, 'print_used_class_styles' ), 99 );
	}

	public function register_post_type() {
		register_post_type(
			'blockish-classes',
			array(
				'label'                 => __( 'Class Manager', 'blockish' ),
				'public'                => true,
				'show_ui'               => true,
				'show_in_menu'          => true,
				'show_in_admin_bar'     => true,
				'show_in_nav_menus'     => false,
				'exclude_from_search'   => true,
				'publicly_queryable'    => false,
				'hierarchical'          => false,
				'show_in_rest'          => true,
				'rest_base'             => 'blockish-classes',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
				'supports'              => array( 'title', 'editor' ),
				'capability_type'       => 'post',
				'map_meta_cap'          => true,
				'rewrite'               => false,
				'query_var'             => false,
			)
		);
	}

	public function render_block( $block_content, $block ) {
		if ( empty( $block['blockName'] ) || ! $this->is_supported_block_name( $block['blockName'] ) ) {
			return $block_content;
		}

		$class_items = $block['attrs']['classManager'] ?? array();
		if ( ! is_array( $class_items ) || empty( $class_items ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		foreach ( $class_items as $class_item ) {
			$class_data = $this->normalize_class_item( $class_item );
			if ( empty( $class_data['slug'] ) ) {
				continue;
			}

			$processor->add_class( $class_data['slug'] );
			$this->used_classes[ $class_data['slug'] ] = $class_data;
		}

		return $processor->get_updated_html();
	}

	public function print_used_class_styles() {
		if ( empty( $this->used_classes ) ) {
			return;
		}

		$styles = $this->get_styles_for_classes( $this->used_classes );

		if ( empty( $styles ) ) {
			return;
		}

		echo '<style id="blockish-class-manager-styles">' . $styles . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * @param array<string, array{slug: string, id: int}> $classes
	 * @return string
	 */
	private function get_styles_for_classes( $classes ) {
		$posts = get_posts(
			array(
				'post_type'      => 'blockish-classes',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
			)
		);

		if ( empty( $posts ) ) {
			return '';
		}

		$lookup = array();
		$css    = '';

		foreach ( $classes as $class ) {
			if ( empty( $class['slug'] ) ) {
				continue;
			}

			$lookup[ $class['slug'] ] = absint( $class['id'] ?? 0 );
		}

		foreach ( $posts as $post ) {
			$slug = $this->normalize_class_slug( $post->post_title );
			if ( empty( $slug ) || ! isset( $lookup[ $slug ] ) ) {
				continue;
			}

			$expected_id = absint( $lookup[ $slug ] );
			if ( $expected_id > 0 && (int) $post->ID !== $expected_id ) {
				continue;
			}

			$content = trim( (string) $post->post_content );
			if ( '' === $content ) {
				continue;
			}

			if ( str_contains( $content, '{' ) ) {
				$css .= $content;
				continue;
			}

			$declarations = $this->sanitize_css_declarations( $content );
			if ( '' === $declarations ) {
				continue;
			}

			if ( ! str_ends_with( $declarations, ';' ) ) {
				$declarations .= ';';
			}

			$css .= '.' . $slug . '{' . $declarations . '}';
		}

		return $css;
	}

	/**
	 * @param mixed $class_item
	 * @return array{slug: string, id: int}
	 */
	private function normalize_class_item( $class_item ) {
		if ( is_string( $class_item ) ) {
			return array(
				'slug' => $this->normalize_class_slug( $class_item ),
				'id'   => 0,
			);
		}

		if ( ! is_array( $class_item ) ) {
			return array(
				'slug' => '',
				'id'   => 0,
			);
		}

		$title = '';
		if ( isset( $class_item['title'] ) && is_string( $class_item['title'] ) ) {
			$title = $class_item['title'];
		}

		if ( '' === $title && isset( $class_item['slug'] ) && is_string( $class_item['slug'] ) ) {
			$title = $class_item['slug'];
		}

		return array(
			'slug' => $this->normalize_class_slug( $title ),
			'id'   => absint( $class_item['id'] ?? 0 ),
		);
	}

	/**
	 * @param string $block_name
	 * @return bool
	 */
	private function is_supported_block_name( $block_name ) {
		if ( ! is_string( $block_name ) || '' === $block_name ) {
			return false;
		}

		return str_starts_with( $block_name, 'blockish/' );
	}

	private function normalize_class_slug( $value ) {
		$value = strtolower( trim( (string) $value ) );
		$value = str_replace( ' ', '-', $value );
		$value = preg_replace( '/[^a-z0-9_-]/', '', $value );

		if ( ! is_string( $value ) ) {
			return '';
		}

		if ( ! preg_match( '/^[a-z_][a-z0-9_-]*$/', $value ) ) {
			return '';
		}

		return $value;
	}

	private function sanitize_css_declarations( $css ) {
		$css = wp_strip_all_tags( (string) $css );
		$css = str_replace( array( '{', '}' ), '', $css );
		return trim( $css );
	}
}
