<?php
/*
 * Get all the pages to load on frontpage through ajax
 *
 */
function NAMESPACE_get_all_pages() {
	global $post;
	$is_ajax = 1;

	$post_array = [];
	$posts = NAMESPACE_get_posts('page');

	foreach ( $posts as $post ) : setup_postdata( $post );
		ob_start();
			include( locate_template( 'template-parts/content-page.php'));
		$buffer = ob_get_clean();

		$post_array['post-' . get_the_ID()] = $buffer;
	endforeach;

	echo json_encode($post_array);

	die();
}
add_action( 'wp_ajax_nopriv_NAMESPACE_get_all_pages', 'NAMESPACE_get_all_pages' );
add_action( 'wp_ajax_NAMESPACE_get_all_pages', 'NAMESPACE_get_all_pages' );

/**
 * Get all posts of post_type ordered by menu_order
 *
 */
function NAMESPACE_get_posts($post_type, $orderby = 'menu_order') {
	$args = array(
		'posts_per_page'	=> -1,
		'post_type'			=> $post_type,
		'orderby'			=> $orderby,
		'order'				=> 'ASC'
	);
	$posts = get_posts($args);
	return $posts;
}
