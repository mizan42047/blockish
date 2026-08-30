<?php
namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;
use Blockish\ThemeBuilder\ClassicThemeBridge;
use Blockish\ThemeBuilder\ClassicThemeLocations;
use Blockish\ThemeBuilder\CustomTemplateRegistry;
use Blockish\ThemeBuilder\DefaultPosts;
use Blockish\ThemeBuilder\Enqueue;
use Blockish\ThemeBuilder\PostType;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Theme Builder extension bootstrap.
 *
 * Classic themes only — block themes use the Site Editor.
 */
class ThemeBuilder {
	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		add_action( 'init', array( $this, 'register_runtime_hooks' ), 5 );
	}

	/**
	 * Bootstrap when the extension is active on a classic theme.
	 *
	 * @return void
	 */
	public function register_runtime_hooks() {
		if ( ! self::is_enabled() ) {
			return;
		}

		PostType::get_instance();
		DefaultPosts::get_instance();
		Enqueue::get_instance();
		require_once BLOCKISH_INCLUDES_DIR . 'ThemeBuilder/theme-locations-api.php';
		ClassicThemeBridge::register_hooks();
		ClassicThemeLocations::register_hooks();
		CustomTemplateRegistry::register_hooks();

		add_filter( 'allowed_block_types_all', array( $this, 'restrict_template_part_inserter' ), 10, 2 );
	}

	/**
	 * Part slot block is only insertable in Theme Builder templates — not posts, pages, or parts.
	 *
	 * @param bool|string[]            $allowed_block_types Allowed blocks.
	 * @param \WP_Block_Editor_Context $editor_context      Editor context.
	 * @return bool|string[]
	 */
	public function restrict_template_part_inserter( $allowed_block_types, $editor_context ) {
		$block = 'blockish/template-part';
		$allow = false;

		if (
			isset( $editor_context->post ) &&
			$editor_context->post instanceof \WP_Post &&
			PostType::POST_TYPE === $editor_context->post->post_type
		) {
			$kind = get_post_meta( $editor_context->post->ID, PostType::META_KIND, true );
			$allow = PostType::KIND_TEMPLATE === $kind;
		}

		if ( $allow ) {
			return $allowed_block_types;
		}

		if ( true === $allowed_block_types ) {
			$registered = array_keys( \WP_Block_Type_Registry::get_instance()->get_all_registered() );
			return array_values( array_diff( $registered, array( $block ) ) );
		}

		if ( is_array( $allowed_block_types ) ) {
			return array_values( array_diff( $allowed_block_types, array( $block ) ) );
		}

		return $allowed_block_types;
	}

	/**
	 * Theme Builder targets classic (PHP) themes only.
	 *
	 * @return bool
	 */
	public static function is_available_for_site() {
		return function_exists( 'wp_is_block_theme' ) && ! wp_is_block_theme();
	}

	/**
	 * Whether Theme Builder is enabled and allowed on this site.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		if ( ! self::is_available_for_site() ) {
			return false;
		}

		$active = ExtensionList::get_instance()->get_list( 'active' );
		return ! empty( $active['theme-builder'] );
	}
}
