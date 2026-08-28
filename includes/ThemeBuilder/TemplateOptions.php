<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create-modal slug catalogs for Theme Builder templates and parts.
 */
class TemplateOptions {

	/**
	 * Same default slugs Site Editor offers in "Add template"
	 * (`packages/edit-site/.../add-new-template/index.js` → DEFAULT_TEMPLATE_SLUGS).
	 *
	 * @var string[]
	 */
	const DEFAULT_TEMPLATE_SLUGS = array(
		'front-page',
		'home',
		'single',
		'page',
		'index',
		'archive',
		'author',
		'category',
		'date',
		'tag',
		'search',
		'404',
	);

	/**
	 * Create options for templates — Site Editor parity:
	 * DEFAULT_TEMPLATE_SLUGS + dynamic CPT singles/archives + custom taxonomies + custom.
	 * Nothing is pre-seeded; already-created slugs are hidden in the UI.
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string}>
	 */
	public static function template_slug_options() {
		$options = array();
		$types   = function_exists( 'get_default_block_template_types' )
			? get_default_block_template_types()
			: array();

		foreach ( self::DEFAULT_TEMPLATE_SLUGS as $slug ) {
			$type = isset( $types[ $slug ] ) ? $types[ $slug ] : array();
			$options[] = array(
				'slug'        => $slug,
				'label'       => isset( $type['title'] ) ? (string) $type['title'] : $slug,
				'description' => isset( $type['description'] ) ? (string) $type['description'] : '',
				'icon'        => self::template_icon_for_slug( $slug ),
			);
		}

		foreach ( self::dynamic_post_type_template_options() as $row ) {
			$options[] = $row;
		}

		foreach ( self::dynamic_taxonomy_template_options() as $row ) {
			$options[] = $row;
		}

		foreach ( self::woocommerce_template_options() as $row ) {
			$options[] = $row;
		}

		foreach ( self::theme_custom_template_options() as $row ) {
			$options[] = $row;
		}

		$options[] = array(
			'slug'        => 'custom',
			'label'       => __( 'Custom template', 'blockish' ),
			'description' => __( 'A custom template can be manually applied to any post or page.', 'blockish' ),
			'icon'        => 'custom',
		);

		// Prefer WooCommerce titles when the same slug appears twice (e.g. single-product).
		$options = self::dedupe_template_options( $options );

		return $options;
	}

	/**
	 * Keep first occurrence unless a later row is from the WooCommerce group.
	 *
	 * @param array<int, array<string, mixed>> $options Options.
	 * @return array<int, array<string, mixed>>
	 */
	private static function dedupe_template_options( array $options ) {
		$by_slug = array();
		$order   = array();

		foreach ( $options as $row ) {
			$slug = isset( $row['slug'] ) ? (string) $row['slug'] : '';
			if ( '' === $slug ) {
				continue;
			}
			if ( ! isset( $by_slug[ $slug ] ) ) {
				$by_slug[ $slug ] = $row;
				$order[]          = $slug;
				continue;
			}
			if ( isset( $row['group'] ) && 'woocommerce' === $row['group'] ) {
				$by_slug[ $slug ] = $row;
			}
		}

		$out = array();
		foreach ( $order as $slug ) {
			$out[] = $by_slug[ $slug ];
		}
		return $out;
	}

	/**
	 * WooCommerce block templates (Product Catalog, Cart, Checkout, etc.).
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string,group:string,initialContent:string}>
	 */
	private static function woocommerce_template_options() {
		$options = array();

		if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'get_block_templates' ) ) {
			return $options;
		}

		$templates = get_block_templates( array(), 'wp_template' );
		if ( ! is_array( $templates ) ) {
			return $options;
		}

		foreach ( $templates as $template ) {
			if ( ! self::is_woocommerce_block_template( $template ) ) {
				continue;
			}

			$slug = isset( $template->slug ) ? (string) $template->slug : '';
			if ( '' === $slug ) {
				continue;
			}

			$options[] = array(
				'slug'           => $slug,
				'label'          => ! empty( $template->title ) ? (string) $template->title : $slug,
				'description'    => isset( $template->description ) ? (string) $template->description : '',
				'icon'           => self::woocommerce_icon_for_slug( $slug ),
				'group'          => 'woocommerce',
				'initialContent' => isset( $template->content ) ? (string) $template->content : '',
			);
		}

		// WC system pages that are still regular pages (no dedicated block template yet).
		foreach ( self::woocommerce_system_page_options() as $row ) {
			$options[] = $row;
		}

		return $options;
	}

	/**
	 * WooCommerce pages that Site Editor treats as normal pages today (e.g. My Account),
	 * exposed as page-{slug} templates for Theme Builder overrides.
	 * Cart/Checkout/Shop already have dedicated WC block templates.
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string,group:string,initialContent:string}>
	 */
	private static function woocommerce_system_page_options() {
		$options = array();

		if ( ! function_exists( 'wc_get_page_id' ) ) {
			return $options;
		}

		$pages = array(
			'myaccount' => array(
				'label'       => __( 'Page: My account', 'blockish' ),
				'description' => __( 'Displays the customer account area — dashboard, orders, addresses, and account details.', 'blockish' ),
				'icon'        => 'page',
			),
		);

		foreach ( $pages as $wc_page => $meta ) {
			$page_id = (int) wc_get_page_id( $wc_page );
			if ( $page_id <= 0 ) {
				continue;
			}

			$page = get_post( $page_id );
			if ( ! $page instanceof \WP_Post || 'publish' !== $page->post_status ) {
				continue;
			}

			$slug = 'page-' . $page->post_name;
			// Prefer WC dedicated templates when they exist (cart/checkout).
			if ( in_array( $slug, array( 'page-cart', 'page-checkout' ), true ) ) {
				continue;
			}

			$options[] = array(
				'slug'           => $slug,
				'label'          => $meta['label'],
				'description'    => $meta['description'],
				'icon'           => $meta['icon'],
				'group'          => 'woocommerce',
				'initialContent' => '',
			);
		}

		return $options;
	}

	/**
	 * WooCommerce template parts (Mini-Cart, Checkout Header, etc.).
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string,group:string,initialContent:string}>
	 */
	private static function woocommerce_part_options() {
		$options = array();

		if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'get_block_templates' ) ) {
			return $options;
		}

		$parts = get_block_templates( array(), 'wp_template_part' );
		if ( ! is_array( $parts ) ) {
			return $options;
		}

		foreach ( $parts as $part ) {
			if ( ! self::is_woocommerce_block_template( $part ) ) {
				continue;
			}

			$slug = isset( $part->slug ) ? (string) $part->slug : '';
			if ( '' === $slug ) {
				continue;
			}

			$options[] = array(
				'slug'           => $slug,
				'label'          => ! empty( $part->title ) ? (string) $part->title : $slug,
				'description'    => isset( $part->description ) ? (string) $part->description : '',
				'icon'           => self::woocommerce_icon_for_slug( $slug ),
				'group'          => 'woocommerce',
				'initialContent' => isset( $part->content ) ? (string) $part->content : '',
			);
		}

		return $options;
	}

	/**
	 * @param object $template Block template object.
	 * @return bool
	 */
	private static function is_woocommerce_block_template( $template ) {
		if ( ! is_object( $template ) ) {
			return false;
		}

		$theme  = isset( $template->theme ) ? (string) $template->theme : '';
		$source = isset( $template->source ) ? (string) $template->source : '';
		$slug   = isset( $template->slug ) ? (string) $template->slug : '';

		if ( false !== strpos( $theme, 'woocommerce' ) ) {
			return true;
		}

		if ( 'plugin' !== $source ) {
			return false;
		}

		$utils = '\\Automattic\\WooCommerce\\Blocks\\Utils\\BlockTemplateUtils';
		if ( class_exists( $utils ) && is_callable( array( $utils, 'get_template' ) ) ) {
			return null !== call_user_func( array( $utils, 'get_template' ), $slug );
		}

		$known = array(
			'archive-product',
			'single-product',
			'product-search-results',
			'taxonomy-product_attribute',
			'taxonomy-product_cat',
			'taxonomy-product_tag',
			'taxonomy-product_brand',
			'page-cart',
			'page-checkout',
			'page-my-account',
			'order-confirmation',
			'coming-soon',
			'mini-cart',
			'checkout-header',
			'coming-soon-social-links',
			'simple-product-add-to-cart-with-options',
			'external-product-add-to-cart-with-options',
			'variable-product-add-to-cart-with-options',
			'grouped-product-add-to-cart-with-options',
		);

		return in_array( $slug, $known, true );
	}

	/**
	 * @param string $slug Template slug.
	 * @return string
	 */
	private static function woocommerce_icon_for_slug( $slug ) {
		$map = array(
			'archive-product'         => 'archive',
			'single-product'          => 'post',
			'product-search-results'  => 'search',
			'taxonomy-product_cat'    => 'category',
			'taxonomy-product_tag'    => 'tag',
			'taxonomy-product_attribute' => 'category',
			'taxonomy-product_brand'  => 'category',
			'page-cart'               => 'cart',
			'page-checkout'           => 'cart',
			'page-my-account'         => 'page',
			'order-confirmation'      => 'page',
			'coming-soon'             => 'page',
			'mini-cart'               => 'cart',
			'checkout-header'         => 'header',
		);

		return isset( $map[ $slug ] ) ? $map[ $slug ] : 'post';
	}

	/**
	 * Theme-provided custom templates (theme.json customTemplates + classic PHP page templates).
	 * Shown as override options when not already created in Theme Builder.
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string,group:string,initialContent:string}>
	 */
	private static function theme_custom_template_options() {
		$options = array();
		$seen    = array();

		foreach ( self::DEFAULT_TEMPLATE_SLUGS as $slug ) {
			$seen[ $slug ] = true;
		}

		if ( function_exists( 'wp_get_theme_data_custom_templates' ) ) {
			foreach ( wp_get_theme_data_custom_templates() as $slug => $data ) {
				$slug = sanitize_title( (string) $slug );
				if ( '' === $slug || isset( $seen[ $slug ] ) ) {
					continue;
				}
				$seen[ $slug ] = true;

				$title = ! empty( $data['title'] ) ? (string) $data['title'] : $slug;
				$options[] = array(
					'slug'           => $slug,
					'label'          => $title,
					'description'    => sprintf(
						/* translators: %s: Theme custom template title. */
						__( 'Override “%s” from the active theme.', 'blockish' ),
						$title
					),
					'icon'           => 'custom',
					'group'          => 'theme',
					'initialContent' => self::get_theme_block_template_html( $slug ),
				);
			}
		}

		// Classic theme page/post templates (Template Name: headers).
		$theme = wp_get_theme();
		foreach ( array( 'page', 'post' ) as $post_type ) {
			$page_templates = $theme->get_page_templates( null, $post_type );
			if ( ! is_array( $page_templates ) ) {
				continue;
			}
			foreach ( $page_templates as $file => $name ) {
				$slug = sanitize_title( basename( (string) $file, '.php' ) );
				if ( '' === $slug || isset( $seen[ $slug ] ) ) {
					continue;
				}
				$seen[ $slug ] = true;

				$title = $name ? (string) $name : $slug;
				$options[] = array(
					'slug'           => $slug,
					'label'          => $title,
					'description'    => sprintf(
						/* translators: %s: Classic theme template name. */
						__( 'Override “%s” from the active theme.', 'blockish' ),
						$title
					),
					'icon'           => 'custom',
					'group'          => 'theme',
					'initialContent' => '',
				);
			}
		}

		return $options;
	}

	/**
	 * @param string $slug Template slug.
	 * @return string Block markup from the theme file, if any.
	 */
	private static function get_theme_block_template_html( $slug ) {
		if ( ! function_exists( '_get_block_template_file' ) ) {
			return '';
		}

		$file = _get_block_template_file( 'wp_template', $slug );
		if ( empty( $file['path'] ) || ! is_readable( $file['path'] ) ) {
			return '';
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local theme template file.
		$html = file_get_contents( $file['path'] );
		return is_string( $html ) ? $html : '';
	}

	/**
	 * CPT singles + archives (Site Editor: usePostTypeMenuItems / usePostTypeArchiveMenuItems).
	 * Skips post/page — those use default `single` / `page` slugs.
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string}>
	 */
	private static function dynamic_post_type_template_options() {
		$options = array();

		$post_types = get_post_types( array( 'public' => true ), 'objects' );
		if ( ! is_array( $post_types ) ) {
			return $options;
		}

		foreach ( $post_types as $post_type ) {
			if ( ! $post_type instanceof \WP_Post_Type ) {
				continue;
			}
			if ( ! is_post_type_viewable( $post_type ) ) {
				continue;
			}
			if ( in_array( $post_type->name, array( 'attachment', 'post', 'page' ), true ) ) {
				continue;
			}
			// WooCommerce registers dedicated block templates (single-product, archive-product…).
			if ( class_exists( 'WooCommerce' ) && 'product' === $post_type->name ) {
				continue;
			}

			$singular = $post_type->labels->singular_name
				? (string) $post_type->labels->singular_name
				: $post_type->name;

			$template_name = ! empty( $post_type->labels->template_name )
				? (string) $post_type->labels->template_name
				: sprintf(
					/* translators: %s: Post type singular name. */
					__( 'Single item: %s', 'blockish' ),
					$singular
				);

			$options[] = array(
				'slug'        => 'single-' . $post_type->name,
				'label'       => $template_name,
				'description' => sprintf(
					/* translators: %s: Post type singular name. */
					__( 'Displays a single item: %s.', 'blockish' ),
					$singular
				),
				'icon'        => 'post',
			);

			if ( ! empty( $post_type->has_archive ) ) {
				$options[] = array(
					'slug'        => 'archive-' . $post_type->name,
					'label'       => sprintf(
						/* translators: %s: Post type singular name. */
						__( 'Archive: %s', 'blockish' ),
						$singular
					),
					'description' => sprintf(
						/* translators: %s: Post type singular name. */
						__( 'Displays an archive with the latest posts of type: %s.', 'blockish' ),
						$singular
					),
					'icon'        => 'archive',
				);
			}
		}

		return $options;
	}

	/**
	 * Custom taxonomies (Site Editor: useTaxonomiesMenuItems).
	 * category / post_tag stay on default `category` / `tag` slugs.
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string}>
	 */
	private static function dynamic_taxonomy_template_options() {
		$options = array();

		$taxonomies = get_taxonomies( array( 'public' => true ), 'objects' );
		if ( ! is_array( $taxonomies ) ) {
			return $options;
		}

		foreach ( $taxonomies as $taxonomy ) {
			if ( ! $taxonomy instanceof \WP_Taxonomy ) {
				continue;
			}
			if ( empty( $taxonomy->publicly_queryable ) ) {
				continue;
			}
			if ( in_array( $taxonomy->name, array( 'category', 'post_tag', 'post_format' ), true ) ) {
				continue;
			}

			$singular = $taxonomy->labels->singular_name
				? (string) $taxonomy->labels->singular_name
				: $taxonomy->name;

			$label = ! empty( $taxonomy->labels->template_name )
				? (string) $taxonomy->labels->template_name
				: $singular;

			$row = array(
				'slug'        => 'taxonomy-' . $taxonomy->name,
				'label'       => $label,
				'description' => sprintf(
					/* translators: %s: Taxonomy singular name. */
					__( 'Displays taxonomy: %s.', 'blockish' ),
					$singular
				),
				'icon'        => 'category',
			);

			// Product taxonomies belong in the WooCommerce section, not the general list.
			if ( self::is_woocommerce_taxonomy( $taxonomy ) ) {
				$row['group'] = 'woocommerce';
				$row['icon']  = self::woocommerce_icon_for_slug( $row['slug'] );
			}

			$options[] = $row;
		}

		return $options;
	}

	/**
	 * @param \WP_Taxonomy $taxonomy Taxonomy object.
	 * @return bool
	 */
	private static function is_woocommerce_taxonomy( $taxonomy ) {
		if ( ! class_exists( 'WooCommerce' ) || ! $taxonomy instanceof \WP_Taxonomy ) {
			return false;
		}

		$name = (string) $taxonomy->name;
		if ( 0 === strpos( $name, 'pa_' ) || 0 === strpos( $name, 'product_' ) ) {
			return true;
		}
		if ( in_array( $name, array( 'product_cat', 'product_tag', 'product_brand' ), true ) ) {
			return true;
		}

		$object_types = isset( $taxonomy->object_type ) ? (array) $taxonomy->object_type : array();
		return in_array( 'product', $object_types, true );
	}

	/**
	 * Create options for template parts — same areas as Site Editor
	 * (`get_allowed_block_template_part_areas`).
	 *
	 * @return array<int, array{slug:string,label:string,description:string,icon:string}>
	 */
	public static function part_slug_options() {
		$options = array();

		$core_areas = array( 'header', 'footer' );
		if ( defined( 'WP_TEMPLATE_PART_AREA_HEADER' ) ) {
			$core_areas = array(
				WP_TEMPLATE_PART_AREA_HEADER,
				WP_TEMPLATE_PART_AREA_FOOTER,
			);
		}

		if ( function_exists( 'get_allowed_block_template_part_areas' ) ) {
			foreach ( get_allowed_block_template_part_areas() as $area ) {
				if ( empty( $area['area'] ) ) {
					continue;
				}
				$area_slug = (string) $area['area'];
				// Header + footer only — skip WP "General" / uncategorized.
				if ( ! in_array( $area_slug, $core_areas, true ) ) {
					continue;
				}
				$slug = sanitize_title( $area_slug );
				$options[] = array(
					'slug'        => $slug,
					'label'       => isset( $area['label'] ) ? (string) $area['label'] : $slug,
					'description' => isset( $area['description'] ) ? (string) $area['description'] : '',
					'icon'        => isset( $area['icon'] ) ? (string) $area['icon'] : 'layout',
				);
			}
		} else {
			$options = array(
				array(
					'slug'        => 'header',
					'label'       => __( 'Header', 'blockish' ),
					'description' => __( 'The Header template defines a page area that typically contains a title, logo, and main navigation.', 'blockish' ),
					'icon'        => 'header',
				),
				array(
					'slug'        => 'footer',
					'label'       => __( 'Footer', 'blockish' ),
					'description' => __( 'The Footer template defines a page area that typically contains site credits, social links, or any other combination of blocks.', 'blockish' ),
					'icon'        => 'footer',
				),
			);
		}

		foreach ( self::woocommerce_part_options() as $row ) {
			$options[] = $row;
		}

		$options = self::dedupe_template_options( $options );

		return $options;
	}

	/**
	 * @param string $slug Template slug.
	 * @return string Icon key for the add-template UI.
	 */
	private static function template_icon_for_slug( $slug ) {
		$map = array(
			'index'      => 'layout',
			'home'       => 'home',
			'front-page' => 'home',
			'single'     => 'post',
			'page'       => 'page',
			'archive'    => 'archive',
			'author'     => 'author',
			'category'   => 'category',
			'date'       => 'date',
			'tag'        => 'tag',
			'search'     => 'search',
			'404'        => 'notFound',
		);

		return isset( $map[ $slug ] ) ? $map[ $slug ] : 'layout';
	}
}
