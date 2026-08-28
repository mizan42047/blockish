<?php
namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;
use Blockish\ThemeBuilder\DefaultPosts;
use Blockish\ThemeBuilder\Enqueue;
use Blockish\ThemeBuilder\PostType;
use Blockish\ThemeBuilder\FrontendBridge;
use Blockish\ThemeBuilder\ClassicThemeBridge;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Theme Builder extension bootstrap.
 *
 * Off by default. When active: CPT + library list + block editor for templates/parts.
 */
class ThemeBuilder {
	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		add_action( 'init', array( $this, 'register_runtime_hooks' ), 5 );
	}

	/**
	 * Bootstrap when the extension is active.
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
		FrontendBridge::register_hooks();
		ClassicThemeBridge::register_hooks();

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
	 * Whether Theme Builder is enabled in the extensions list.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		$active = ExtensionList::get_instance()->get_list( 'active' );
		return ! empty( $active['theme-builder'] );
	}
}
