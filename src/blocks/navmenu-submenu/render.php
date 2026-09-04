<?php
defined( 'ABSPATH' ) || exit;

$wrapper_attrs = get_block_wrapper_attributes(
	array( 'class' => 'blockish-navmenu-submenu' )
);

$content = sprintf(
	'<ul %1$s>%2$s</ul>',
	$wrapper_attrs,
	$content ?? ''
);

echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Wrapper + inner blocks.
