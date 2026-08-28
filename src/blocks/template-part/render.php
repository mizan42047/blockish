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

$part = null;

// Named WooCommerce / catalog part (checkout-header, mini-cart, …).
if ( '' !== $slug && ! in_array( $slug, array( 'header', 'footer' ), true ) ) {
	$part = \Blockish\ThemeBuilder\PartResolver::resolve_by_slug( $slug );
}

// Area slot (header / footer + conditions).
if ( ! $part instanceof WP_Post ) {
	// Legacy: older markup used slug instead of area for header/footer.
	if ( '' === $area && '' !== $slug ) {
		$area = \Blockish\ThemeBuilder\PostType::area_from_slug( $slug );
	}
	if ( '' === $area ) {
		return;
	}
	$part = \Blockish\ThemeBuilder\PartResolver::resolve( $area );
}

if ( ! $part instanceof WP_Post ) {
	return;
}

$html = \Blockish\ThemeBuilder\PartResolver::render_part( $part );
if ( '' === trim( $html ) ) {
	return;
}

$slot_area = $area;
if ( '' !== $slug && in_array( $slug, array( 'header', 'footer' ), true ) ) {
	$slot_area = $slug;
}

// Header/footer area slots use semantic wrappers like core/template-part (Site Editor).
$wrapper_tag = 'div';
$is_area_slot  = ( '' === $slug || in_array( $slug, array( 'header', 'footer' ), true ) );

if ( $is_area_slot && function_exists( 'get_allowed_block_template_part_areas' ) ) {
	foreach ( get_allowed_block_template_part_areas() as $defined_area ) {
		if ( isset( $defined_area['area'] ) && $defined_area['area'] === $slot_area ) {
			if ( ! empty( $defined_area['area_tag'] ) ) {
				$wrapper_tag = tag_escape( $defined_area['area_tag'] );
			}
			break;
		}
	}
} elseif ( $is_area_slot ) {
	if ( 'header' === $slot_area ) {
		$wrapper_tag = 'header';
	} elseif ( 'footer' === $slot_area ) {
		$wrapper_tag = 'footer';
	}
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'blockish-template-part blockish-template-part--' . sanitize_html_class( $slug ? $slug : $area ),
	)
);

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper_tag is tag_escape()'d or a fixed literal.
printf( '<%1$s %2$s>%3$s</%1$s>', $wrapper_tag, $wrapper_attributes, $html );
