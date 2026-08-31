<?php
/**
 * Template Part placeholder — pushes matching Theme Builder part by area + conditions.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( '\Blockish\ThemeBuilder\PartResolver' ) ) {
	return;
}

if ( ! class_exists( '\Blockish\Extensions\ThemeBuilder' ) || ! \Blockish\Extensions\ThemeBuilder::is_enabled() ) {
	return;
}

$area = isset( $attributes['area'] ) ? sanitize_title( (string) $attributes['area'] ) : '';
$slug = isset( $attributes['slug'] ) ? sanitize_title( (string) $attributes['slug'] ) : '';

// Self-closing blocks may omit attrs in saved markup; block.json default is header.
if ( '' === $area && '' === $slug ) {
	$area = 'header';
}

$html = '';

// Named WooCommerce / catalog part (checkout-header, mini-cart, …).
if ( '' !== $slug && ! in_array( $slug, array( 'header', 'footer' ), true ) ) {
	$part = \Blockish\ThemeBuilder\PartResolver::resolve_by_slug( $slug );
	if ( $part instanceof WP_Post ) {
		$html = \Blockish\ThemeBuilder\PartResolver::render_part( $part );
		if ( '' !== trim( $html ) ) {
			$slot_area = \Blockish\ThemeBuilder\PostType::area_from_slug( $slug );
			if ( '' === $slot_area ) {
				$slot_area = $slug;
			}
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped at block render.
			echo \Blockish\ThemeBuilder\PartResolver::wrap_area_html( $slot_area, $html );
		}
	}
	return;
}

// Area slot (header / footer + conditions).
if ( '' === $area && '' !== $slug ) {
	$area = \Blockish\ThemeBuilder\PostType::area_from_slug( $slug );
}

if ( '' === $area ) {
	return;
}

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped at block render.
echo \Blockish\ThemeBuilder\PartResolver::render_area( $area );
