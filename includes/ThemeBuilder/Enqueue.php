<?php
namespace Blockish\ThemeBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Theme Builder assets: localize extension script + library/editor screen chrome.
 */
class Enqueue {
	use \Blockish\Traits\SingletonTrait;

	const EDITOR_SCRIPT_HANDLE = 'blockish-extension-theme-builder-editorscript';
	const EDITOR_STYLE_HANDLE  = 'blockish-extension-theme-builder-editorstyle';

	protected function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'localize_dashboard' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'maybe_body_classes' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'localize_editor' ), 20 );
		// Canvas iframe — title hide only on template/part editors.
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_editor_iframe_styles' ) );
	}

	/**
	 * @param string $hook Admin hook.
	 */
	public function localize_dashboard( $hook ) {
		if ( 'toplevel_page_blockish-dashboard' !== $hook ) {
			return;
		}

		if ( ! wp_script_is( 'blockish-dashboard', 'registered' ) && ! wp_script_is( 'blockish-dashboard', 'enqueued' ) ) {
			return;
		}

		wp_localize_script(
			'blockish-dashboard',
			'blockishThemeBuilderAdmin',
			array(
				'listUrl' => DefaultPosts::get_library_edit_url(),
				'newUrl'  => admin_url( 'post-new.php?post_type=' . PostType::POST_TYPE ),
			)
		);
	}

	/**
	 * Body classes before admin header (enqueue_block_editor_assets is too late).
	 *
	 * @param string $hook Admin hook.
	 */
	public function maybe_body_classes( $hook ) {
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || PostType::POST_TYPE !== $screen->post_type ) {
			return;
		}

		if ( $this->is_library_screen() ) {
			add_filter( 'admin_body_class', array( $this, 'library_body_class' ) );
			return;
		}

		add_filter( 'admin_body_class', array( $this, 'editor_body_class' ) );
	}

	/**
	 * Config for the already-registered extension editor script.
	 */
	public function localize_editor() {
		if ( ! wp_script_is( self::EDITOR_SCRIPT_HANDLE, 'registered' ) && ! wp_script_is( self::EDITOR_SCRIPT_HANDLE, 'enqueued' ) ) {
			return;
		}

		$tb_screen = '';
		$screen    = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && PostType::POST_TYPE === $screen->post_type ) {
			$tb_screen = $this->is_library_screen() ? 'library' : 'editor';
		}

		$library = DefaultPosts::get_library_post();
		$data    = array(
			'screen'        => $tb_screen,
			'libraryId'     => $library ? (int) $library->ID : 0,
			'postType'      => PostType::POST_TYPE,
			'editUrlBase'   => admin_url( 'post.php' ),
			'listUrl'       => DefaultPosts::get_library_edit_url(),
			'dashboardUrl'  => admin_url( 'admin.php?page=blockish-dashboard' ),
			'templateSlugs' => array(),
			'partSlugs'     => array(),
		);

		if ( $tb_screen ) {
			$data['templateSlugs'] = TemplateOptions::template_slug_options();
			$data['partSlugs']     = TemplateOptions::part_slug_options();
		}

		wp_localize_script( self::EDITOR_SCRIPT_HANDLE, 'blockishThemeBuilder', $data );

		if ( $tb_screen ) {
			wp_set_script_translations( self::EDITOR_SCRIPT_HANDLE, 'blockish' );
		}
	}

	/**
	 * Title hide + root full-bleed inside the canvas iframe.
	 */
	public function enqueue_editor_iframe_styles() {
		if ( ! is_admin() || ! $this->is_tb_item_editor() ) {
			return;
		}

		$css = $this->get_tb_canvas_critical_css();

		wp_register_style( 'blockish-theme-builder-canvas', false, array(), BLOCKISH_VERSION );
		wp_enqueue_style( 'blockish-theme-builder-canvas' );
		wp_add_inline_style( 'blockish-theme-builder-canvas', $css );
	}

	/**
	 * Critical editor-canvas CSS (must load in the iframe, not only the admin chrome).
	 *
	 * @return string
	 */
	private function get_tb_canvas_critical_css() {
		return '.editor-post-title,.editor-post-title__input,.edit-post-visual-editor__post-title-wrapper,.editor-visual-editor__post-title-wrapper{display:none!important}'
			. '.editor-styles-wrapper .is-root-container.is-layout-constrained>.block-editor-block-list__block,'
			. '.editor-styles-wrapper .is-layout-constrained.is-root-container>.block-editor-block-list__block{max-width:none!important;margin-left:0!important;margin-right:0!important;width:100%}'
			. '.editor-styles-wrapper .block-editor-block-list__block[data-type="blockish/template-part"]{max-width:none!important;margin-left:0!important;margin-right:0!important;width:100%}';
	}

	/**
	 * Theme Builder template/part editor (not the library shell).
	 *
	 * @return bool
	 */
	private function is_tb_item_editor() {
		if ( $this->is_library_screen() ) {
			return false;
		}

		$post = $this->get_editing_post();
		return $post instanceof \WP_Post && PostType::POST_TYPE === $post->post_type;
	}

	/**
	 * Post being edited — works in the canvas iframe where get_current_screen() is null.
	 *
	 * @return \WP_Post|null
	 */
	private function get_editing_post() {
		if ( ! empty( $GLOBALS['post'] ) && $GLOBALS['post'] instanceof \WP_Post ) {
			return $GLOBALS['post'];
		}

		if ( ! empty( $_GET['post'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$post = get_post( absint( wp_unslash( $_GET['post'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( $post instanceof \WP_Post ) {
				return $post;
			}
		}

		return null;
	}

	/**
	 * @param string $classes Body classes.
	 * @return string
	 */
	public function editor_body_class( $classes ) {
		return $classes . ' blockish-tb-editor-screen';
	}

	/**
	 * @param string $classes Body classes.
	 * @return string
	 */
	public function library_body_class( $classes ) {
		return $classes . ' blockish-tb-library-screen';
	}

	/**
	 * @return bool
	 */
	private function is_library_screen() {
		$post_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! $post_id ) {
			return false;
		}
		$library = DefaultPosts::get_library_post();
		return $library && (int) $library->ID === $post_id;
	}

}
