<?php
/**
 * Minimal document footer when replacing theme footer.php (DefaultCompat).
 *
 * @package Blockish
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>

<?php do_action( 'blockish_tb_footer' ); ?>
</div><!-- #page -->
<?php wp_footer(); ?>
</body>
</html>
