<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Classic / hybrid PHP themes: render Theme Builder templates on the frontend
 * using the same block canvas as Site Editor (template-canvas.php).
 *
 * Block themes use the Site Editor — Theme Builder does not run there.
 */
class ClassicThemeBridge {

	/** @var string[] */
	private static $template_hierarchy = array();

	/** @var array{post:\WP_Post,slug:string}|null */
	private static $resolved = null;

	/** @var bool */
	private static $resolve_attempted = false;

	/**
	 * @return void
	 */
	public static function register_hooks() {
		if ( wp_is_block_theme() || ! self::is_enabled() ) {
			return;
		}

		foreach ( self::hierarchy_filter_types() as $type ) {
			add_filter( "{$type}_template_hierarchy", array( __CLASS__, 'capture_template_hierarchy' ), 1 );
		}

		add_filter( 'template_include', array( __CLASS__, 'template_include' ), 100 );
	}

	/**
	 * @return bool
	 */
	public static function is_enabled() {
		return class_exists( '\Blockish\Extensions\ThemeBuilder' )
			&& \Blockish\Extensions\ThemeBuilder::is_enabled();
	}

	/**
	 * Resolved TB template for the current classic-theme request (if any).
	 *
	 * @return array{post:\WP_Post,slug:string}|null
	 */
	public static function get_resolved_template() {
		if ( ! self::$resolve_attempted ) {
			self::$resolve_attempted = true;
			self::$resolved          = self::resolve_for_hierarchy( self::$template_hierarchy );
		}

		return self::$resolved;
	}

	/**
	 * @param string[] $templates Template filenames from WP hierarchy.
	 * @return string[]
	 */
	public static function capture_template_hierarchy( $templates ) {
		if ( ! is_array( $templates ) ) {
			return $templates;
		}

		$new_slugs = array_values(
			array_filter(
				array_map(
					static function ( $file ) {
						$file = (string) $file;
						if ( '' === $file ) {
							return '';
						}
						return sanitize_title( basename( $file, '.php' ) );
					},
					$templates
				)
			)
		);

		// Prepend so a later index.php fallback (themes without 404.php, search.php, etc.)
		// does not erase earlier, more-specific hierarchy captures.
		self::$template_hierarchy = array_values(
			array_unique(
				array_merge( $new_slugs, self::$template_hierarchy )
			)
		);

		return $templates;
	}

	/**
	 * @param string $template Path to the theme PHP template.
	 * @return string
	 */
	public static function template_include( $template ) {
		if ( is_admin() || is_feed() || is_embed() || wp_doing_ajax() || wp_doing_cron() ) {
			return $template;
		}

		$match = self::get_resolved_template();
		if ( is_array( $match ) && ! empty( $match['post'] ) && $match['post'] instanceof \WP_Post ) {
			$content = trim( (string) $match['post']->post_content );
			if ( '' !== $content ) {
				return self::boot_canvas(
					$content,
					sanitize_title( (string) $match['slug'] )
				);
			}
		}

		// Parts-only: swap header/footer inside the theme template (HFE / Elementor style).
		ClassicThemeLocations::boot_for_request();

		return $template;
	}

	/**
	 * Load WordPress block template canvas with TB block content.
	 *
	 * @param string $content  Serialized block markup.
	 * @param string $slug     Template slug for $_wp_current_template_id.
	 * @return string Path to template-canvas.php.
	 */
	private static function boot_canvas( $content, $slug ) {
		if ( class_exists( '\Blockish\Core\PostPrime' ) ) {
			\Blockish\Core\PostPrime::prime_pattern_refs_from_blocks( parse_blocks( $content ) );
			\Blockish\Core\PostPrime::prime_theme_builder_parts();
		}

		global $_wp_current_template_content, $_wp_current_template_id;

		$_wp_current_template_content = $content;
		$_wp_current_template_id      = get_stylesheet() . '//' . sanitize_title( $slug );

		self::register_canvas_hooks();

		return ABSPATH . WPINC . '/template-canvas.php';
	}

	/**
	 * @param string[] $template_slugs Slugs from the captured PHP template hierarchy.
	 * @return array{post:\WP_Post,slug:string}|null
	 */
	private static function resolve_for_hierarchy( array $template_slugs ) {
		$slugs       = array();
		$ordered_raw = array_merge( QueryTemplateSlugs::get(), $template_slugs );
		$ordered     = self::prioritize_slugs( $ordered_raw );

		foreach ( $ordered as $slug ) {
			$slug = sanitize_title( (string) $slug );
			if ( '' === $slug ) {
				continue;
			}
			if ( ! in_array( $slug, $slugs, true ) ) {
				$slugs[] = $slug;
			}
			if ( function_exists( 'get_template_hierarchy' ) ) {
				foreach ( get_template_hierarchy( $slug ) as $fallback ) {
					$fallback = sanitize_title( (string) $fallback );
					if ( '' !== $fallback && ! in_array( $fallback, $slugs, true ) ) {
						$slugs[] = $fallback;
					}
				}
			}
		}

		foreach ( $slugs as $slug ) {
			$post = TemplateResolver::resolve_by_slug( $slug );
			if ( $post instanceof \WP_Post && '' !== trim( (string) $post->post_content ) ) {
				return array(
					'post' => $post,
					'slug' => $slug,
				);
			}
		}

		return null;
	}

	/**
	 * Dedupe slugs while preserving order; keep `index` as the final fallback.
	 *
	 * @param string[] $slugs Raw slug candidates.
	 * @return string[]
	 */
	private static function prioritize_slugs( array $slugs ) {
		$ordered   = array();
		$has_index = false;

		foreach ( $slugs as $slug ) {
			$slug = sanitize_title( (string) $slug );
			if ( '' === $slug ) {
				continue;
			}
			if ( 'index' === $slug ) {
				$has_index = true;
				continue;
			}
			if ( ! in_array( $slug, $ordered, true ) ) {
				$ordered[] = $slug;
			}
		}

		if ( $has_index ) {
			$ordered[] = 'index';
		}

		return $ordered;
	}

	/**
	 * Mirror block-theme canvas setup from locate_block_template().
	 *
	 * @return void
	 */
	private static function register_canvas_hooks() {
		static $registered = false;
		if ( $registered ) {
			return;
		}
		$registered = true;

		add_filter( 'wp_robots', 'wp_robots_no_robots' );
		remove_action( 'wp_head', '_wp_render_title_tag', 1 );
		add_action( 'wp_head', '_block_template_render_title_tag', 1 );
		add_action( 'wp_head', '_block_template_viewport_meta_tag', 0 );
	}

	/**
	 * @return string[]
	 */
	private static function hierarchy_filter_types() {
		return array(
			'404',
			'archive',
			'attachment',
			'author',
			'category',
			'date',
			'embed',
			'frontpage',
			'home',
			'index',
			'page',
			'paged',
			'privacypolicy',
			'search',
			'single',
			'singular',
			'tag',
			'taxonomy',
		);
	}
}
