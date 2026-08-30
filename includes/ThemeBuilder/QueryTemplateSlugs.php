<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build Theme Builder catalog slugs from the current main query, mirroring
 * wp-includes/template-loader.php + get_*_template() — independent of whether
 * the active classic theme ships matching PHP files (e.g. Hello Elementor).
 */
class QueryTemplateSlugs {

	/**
	 * Ordered slug candidates for the current request (most specific first).
	 *
	 * @return string[]
	 */
	public static function get() {
		$files = array();

		foreach ( self::loader_steps() as $step ) {
			if ( ! call_user_func( $step['tag'] ) ) {
				continue;
			}

			$templates = call_user_func( $step['files'] );
			if ( ! is_array( $templates ) || ! $templates ) {
				continue;
			}

			$files = array_merge( $files, $templates );
		}

		$files = array_merge( $files, self::woocommerce_template_files() );
		$files[] = 'index.php';

		return self::files_to_slugs( $files );
	}

	/**
	 * Same conditional order as wp-includes/template-loader.php.
	 *
	 * @return array<int, array{tag:string,files:callable():string[]}>
	 */
	private static function loader_steps() {
		return array(
			array(
				'tag'   => 'is_embed',
				'files' => array( __CLASS__, 'embed_template_files' ),
			),
			array(
				'tag'   => 'is_404',
				'files' => static function () {
					return array( '404.php' );
				},
			),
			array(
				'tag'   => 'is_search',
				'files' => static function () {
					return array( 'search.php' );
				},
			),
			array(
				'tag'   => 'is_front_page',
				'files' => static function () {
					return array( 'front-page.php' );
				},
			),
			array(
				'tag'   => 'is_home',
				'files' => static function () {
					return array( 'home.php', 'index.php' );
				},
			),
			array(
				'tag'   => 'is_privacy_policy',
				'files' => static function () {
					return array( 'privacy-policy.php' );
				},
			),
			array(
				'tag'   => 'is_post_type_archive',
				'files' => array( __CLASS__, 'archive_template_files' ),
			),
			array(
				'tag'   => 'is_tax',
				'files' => array( __CLASS__, 'taxonomy_template_files' ),
			),
			array(
				'tag'   => 'is_attachment',
				'files' => array( __CLASS__, 'attachment_template_files' ),
			),
			array(
				'tag'   => 'is_single',
				'files' => array( __CLASS__, 'single_template_files' ),
			),
			array(
				'tag'   => 'is_page',
				'files' => array( __CLASS__, 'page_template_files' ),
			),
			array(
				'tag'   => 'is_singular',
				'files' => static function () {
					return array( 'singular.php' );
				},
			),
			array(
				'tag'   => 'is_category',
				'files' => array( __CLASS__, 'category_template_files' ),
			),
			array(
				'tag'   => 'is_tag',
				'files' => array( __CLASS__, 'tag_template_files' ),
			),
			array(
				'tag'   => 'is_author',
				'files' => array( __CLASS__, 'author_template_files' ),
			),
			array(
				'tag'   => 'is_date',
				'files' => static function () {
					return array( 'date.php' );
				},
			),
			array(
				'tag'   => 'is_archive',
				'files' => array( __CLASS__, 'archive_template_files' ),
			),
		);
	}

	/**
	 * @param string[] $files Template filenames.
	 * @return string[]
	 */
	private static function files_to_slugs( array $files ) {
		$slugs = array();

		foreach ( $files as $file ) {
			$file = (string) $file;
			if ( '' === $file ) {
				continue;
			}

			$slug = sanitize_title( basename( $file, '.php' ) );
			if ( '' === $slug || in_array( $slug, $slugs, true ) ) {
				continue;
			}

			$slugs[] = $slug;
		}

		return $slugs;
	}

	/**
	 * @return string[]
	 */
	private static function embed_template_files() {
		$object    = get_queried_object();
		$templates = array();

		if ( is_object( $object ) && ! empty( $object->post_type ) ) {
			$post_format = get_post_format( $object );
			if ( $post_format ) {
				$templates[] = "embed-{$object->post_type}-{$post_format}.php";
			}
			$templates[] = "embed-{$object->post_type}.php";
		}

		$templates[] = 'embed.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function archive_template_files() {
		$post_types = array_filter( (array) get_query_var( 'post_type' ) );
		$templates  = array();

		if ( count( $post_types ) === 1 ) {
			$post_type   = reset( $post_types );
			$templates[] = "archive-{$post_type}.php";
		}

		$templates[] = 'archive.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function taxonomy_template_files() {
		$term      = get_queried_object();
		$templates = array();

		if ( ! ( $term instanceof \WP_Term ) || empty( $term->slug ) ) {
			$templates[] = 'taxonomy.php';
			return $templates;
		}

		$taxonomy = $term->taxonomy;

		$slug_decoded = urldecode( $term->slug );
		if ( $slug_decoded !== $term->slug ) {
			$templates[] = "taxonomy-$taxonomy-{$slug_decoded}.php";
		}

		$templates[] = "taxonomy-$taxonomy-{$term->slug}.php";
		$templates[] = "taxonomy-$taxonomy-{$term->term_id}.php";
		$templates[] = "taxonomy-$taxonomy.php";
		$templates[] = 'taxonomy.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function attachment_template_files() {
		$attachment = get_queried_object();
		$templates  = array();

		if ( $attachment instanceof \WP_Post ) {
			if ( str_contains( $attachment->post_mime_type, '/' ) ) {
				list( $type, $subtype ) = explode( '/', $attachment->post_mime_type );
			} else {
				list( $type, $subtype ) = array( $attachment->post_mime_type, '' );
			}

			if ( ! empty( $subtype ) ) {
				$templates[] = "{$type}-{$subtype}.php";
				$templates[] = "{$subtype}.php";
			}
			$templates[] = "{$type}.php";
		}

		$templates[] = 'attachment.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function single_template_files() {
		$object    = get_queried_object();
		$templates = array();

		if ( $object instanceof \WP_Post && ! empty( $object->post_type ) ) {
			$template = get_page_template_slug( $object );
			if ( $template && 0 === validate_file( $template ) ) {
				$templates[] = $template;
			}

			$name_decoded = urldecode( $object->post_name );
			if ( $name_decoded !== $object->post_name ) {
				$templates[] = "single-{$object->post_type}-{$name_decoded}.php";
			}

			$templates[] = "single-{$object->post_type}-{$object->post_name}.php";
			$templates[] = "single-{$object->post_type}.php";
		}

		$templates[] = 'single.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function page_template_files() {
		$id       = get_queried_object_id();
		$template = get_page_template_slug();
		$pagename = get_query_var( 'pagename' );
		$templates = array();

		if ( ! $pagename && $id ) {
			$post = get_queried_object();
			if ( $post instanceof \WP_Post ) {
				$pagename = $post->post_name;
			}
		}

		if ( $template && 0 === validate_file( $template ) ) {
			$templates[] = $template;
		}

		if ( $pagename ) {
			$pagename_decoded = urldecode( $pagename );
			if ( $pagename_decoded !== $pagename ) {
				$templates[] = "page-{$pagename_decoded}.php";
			}
			$templates[] = "page-{$pagename}.php";
		}

		if ( $id ) {
			$templates[] = "page-{$id}.php";
		}

		$templates[] = 'page.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function category_template_files() {
		$category  = get_queried_object();
		$templates = array();

		if ( $category instanceof \WP_Term && ! empty( $category->slug ) ) {
			$slug_decoded = urldecode( $category->slug );
			if ( $slug_decoded !== $category->slug ) {
				$templates[] = "category-{$slug_decoded}.php";
			}

			$templates[] = "category-{$category->slug}.php";
			$templates[] = "category-{$category->term_id}.php";
		}

		$templates[] = 'category.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function tag_template_files() {
		$tag       = get_queried_object();
		$templates = array();

		if ( $tag instanceof \WP_Term && ! empty( $tag->slug ) ) {
			$slug_decoded = urldecode( $tag->slug );
			if ( $slug_decoded !== $tag->slug ) {
				$templates[] = "tag-{$slug_decoded}.php";
			}

			$templates[] = "tag-{$tag->slug}.php";
			$templates[] = "tag-{$tag->term_id}.php";
		}

		$templates[] = 'tag.php';

		return $templates;
	}

	/**
	 * @return string[]
	 */
	private static function author_template_files() {
		$author    = get_queried_object();
		$templates = array();

		if ( $author instanceof \WP_User ) {
			$templates[] = "author-{$author->user_nicename}.php";
			$templates[] = "author-{$author->ID}.php";
		}

		$templates[] = 'author.php';

		return $templates;
	}

	/**
	 * WooCommerce block-template slugs (Site Editor parity) on classic themes.
	 *
	 * @return string[]
	 */
	private static function woocommerce_template_files() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return array();
		}

		$templates = array();

		if ( function_exists( 'is_product' ) && is_product() ) {
			$templates[] = 'single-product.php';
		}

		if ( function_exists( 'is_shop' ) && is_shop() ) {
			$templates[] = 'archive-product.php';
		}

		if ( function_exists( 'is_product_taxonomy' ) && is_product_taxonomy() ) {
			$term = get_queried_object();
			if ( $term instanceof \WP_Term ) {
				$taxonomy = $term->taxonomy;
				$templates[] = "taxonomy-{$taxonomy}-{$term->slug}.php";
				$templates[] = "taxonomy-{$taxonomy}.php";
			}
		}

		if ( function_exists( 'is_cart' ) && is_cart() ) {
			$templates[] = 'page-cart.php';
		}

		if ( function_exists( 'is_checkout' ) && is_checkout() ) {
			if ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) {
				$templates[] = 'order-confirmation.php';
			}
			$templates[] = 'page-checkout.php';
		}

		if ( is_search() ) {
			$post_type = get_query_var( 'post_type' );
			if ( 'product' === $post_type || ( is_array( $post_type ) && in_array( 'product', $post_type, true ) ) ) {
				$templates[] = 'product-search-results.php';
			}
		}

		return $templates;
	}
}
