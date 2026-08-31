/**
 * WooCommerce Theme Builder slugs — catalog parity with TemplateOptions.php.
 * Templates/parts start empty; user builds with WooCommerce blocks in the editor.
 */

/** @type {readonly string[]} */
export const WOOCOMMERCE_TEMPLATE_SLUGS = [
	'archive-product',
	'single-product',
	'product-search-results',
	'taxonomy-product_attribute',
	'page-cart',
	'page-checkout',
	'order-confirmation',
	'coming-soon',
	'page-my-account',
];

/** @type {readonly string[]} */
export const WOOCOMMERCE_PART_SLUGS = [
	'mini-cart',
	'checkout-header',
	'coming-soon-social-links',
	'simple-product-add-to-cart-with-options',
	'external-product-add-to-cart-with-options',
	'variable-product-add-to-cart-with-options',
	'grouped-product-add-to-cart-with-options',
];

const TEMPLATE_SLUG_SET = new Set( WOOCOMMERCE_TEMPLATE_SLUGS );
const PART_SLUG_SET = new Set( WOOCOMMERCE_PART_SLUGS );

/**
 * Product taxonomy templates (taxonomy-product_cat, taxonomy-pa_color, …).
 *
 * @param {string} slug
 * @return {boolean}
 */
export function isWooCommerceProductTaxonomyTemplateSlug( slug ) {
	return (
		slug.startsWith( 'taxonomy-product_' ) ||
		slug.startsWith( 'taxonomy-pa_' )
	);
}

/**
 * @param {string} slug
 * @return {boolean}
 */
export function isWooCommerceTemplateSlug( slug ) {
	const key = ( slug || '' ).toString();
	if ( ! key ) {
		return false;
	}
	return (
		TEMPLATE_SLUG_SET.has( key ) ||
		isWooCommerceProductTaxonomyTemplateSlug( key )
	);
}

/**
 * @param {'template'|'part'} kind
 * @param {string} slug
 * @return {boolean}
 */
export function isWooCommerceSchemaSlug( kind, slug ) {
	const key = ( slug || '' ).toString();
	if ( ! key ) {
		return false;
	}
	if ( kind === 'part' ) {
		return PART_SLUG_SET.has( key );
	}
	return isWooCommerceTemplateSlug( key );
}
