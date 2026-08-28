/**
 * WooCommerce template / part block_schema (final Blockish JSON).
 * Same pattern as templates/home.main.json — no runtime converter.
 */
import archiveProduct from './templates/archive-product.json';
import singleProduct from './templates/single-product.json';
import productSearchResults from './templates/product-search-results.json';
import taxonomyProductAttribute from './templates/taxonomy-product_attribute.json';
import pageCart from './templates/page-cart.json';
import pageCheckout from './templates/page-checkout.json';
import orderConfirmation from './templates/order-confirmation.json';
import comingSoon from './templates/coming-soon.json';

import miniCart from './parts/mini-cart.json';
import checkoutHeader from './parts/checkout-header.json';
import comingSoonSocialLinks from './parts/coming-soon-social-links.json';
import simpleAddToCart from './parts/simple-product-add-to-cart-with-options.json';
import externalAddToCart from './parts/external-product-add-to-cart-with-options.json';
import variableAddToCart from './parts/variable-product-add-to-cart-with-options.json';
import groupedAddToCart from './parts/grouped-product-add-to-cart-with-options.json';

/** @type {Record<string, Array>} */
const TEMPLATE_SCHEMAS = {
	'archive-product': archiveProduct,
	'single-product': singleProduct,
	'product-search-results': productSearchResults,
	'taxonomy-product_attribute': taxonomyProductAttribute,
	'page-cart': pageCart,
	'page-checkout': pageCheckout,
	'order-confirmation': orderConfirmation,
	'coming-soon': comingSoon,
};

/** Same layout as product attribute taxonomy archives. */
const TAXONOMY_TEMPLATE_ALIASES = [
	'taxonomy-product_cat',
	'taxonomy-product_tag',
	'taxonomy-product_brand',
];

/** @type {Record<string, Array>} */
const PART_SCHEMAS = {
	'mini-cart': miniCart,
	'checkout-header': checkoutHeader,
	'coming-soon-social-links': comingSoonSocialLinks,
	'simple-product-add-to-cart-with-options': simpleAddToCart,
	'external-product-add-to-cart-with-options': externalAddToCart,
	'variable-product-add-to-cart-with-options': variableAddToCart,
	'grouped-product-add-to-cart-with-options': groupedAddToCart,
};

const ALL_TEMPLATE_SLUGS = [
	...Object.keys( TEMPLATE_SCHEMAS ),
	...TAXONOMY_TEMPLATE_ALIASES,
	'page-my-account',
];

const ALL_PART_SLUGS = Object.keys( PART_SCHEMAS );

/**
 * @param {'template'|'part'} kind
 * @param {string} slug
 * @return {boolean}
 */
export function isWooCommerceSchemaSlug( kind, slug ) {
	const key = ( slug || '' ).toString();
	if ( kind === 'part' ) {
		return ALL_PART_SLUGS.includes( key );
	}
	return ALL_TEMPLATE_SLUGS.includes( key );
}

/**
 * @param {'template'|'part'} kind
 * @param {string} slug
 * @return {Array|null}
 */
export function getWooCommerceSchema( kind, slug ) {
	const key = ( slug || '' ).toString();

	if ( kind === 'part' ) {
		return PART_SCHEMAS[ key ] || null;
	}

	if ( TEMPLATE_SCHEMAS[ key ] ) {
		return TEMPLATE_SCHEMAS[ key ];
	}

	if ( TAXONOMY_TEMPLATE_ALIASES.includes( key ) ) {
		return TEMPLATE_SCHEMAS[ 'taxonomy-product_attribute' ];
	}

	return null;
}
