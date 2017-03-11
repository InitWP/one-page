<?php
/**
 * Template part for displaying pages content in page.php.
 *
 * Usage: Replace the homepage and content page ids for your own
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package TEXTDOMAIN
 */

// ID of the homepage page
$homepage_id = 3
// The following page will be loaded together with the homepage.
// Usefull when the homepage has no content, e.g. only an image or slider. The content will make the homepage better SEO wise.
// Also is will provide more content to fill the space above the fold, which prevents the visible loading of the other pages below the fold.
$post_id_extra_content_on_homepage = 6;


$is_front_page = is_front_page();
$post_id = get_the_ID();

// Get slider on homepage
if ($post_id === $homepage_id) { // Homepage
	//error_log('get slider on home'); ?>
	<article id="post-<?php echo $post_id; ?>" class="entry entry-full" data-title="<?php echo get_the_title($post_id); ?>"  data-url="<?php echo get_permalink($post_id); ?>">
		<?php
		// load homepage content
		echo 'This is my homepage content';
		?>
	</article>
	<?php
	if (isset($is_ajax)) {
		return;
	}
}

if ($is_front_page) {
 	// On homepage check for background on About page (both are loaded on the homepage first load)
	$post_id = $post_id_extra_content_on_homepage;
}

/*
// Check if page has a background color
$colored_bg = get_field('colored_bg', $post_id);
// Set backgroundcolor class variable to be used on article element
$color_class = '';
if ($colored_bg) {
	$color_class = ' coloredBackground';
}*/

$the_title = get_the_title($post_id);
?>
<article id="post-<?php echo $post_id; ?>" class="entry<?php //echo $color_class; ?>" data-title="<?php echo $the_title ?>" data-url="<?php echo get_permalink($post_id); ?>">
	<header class="entry--header">
		<?php
			echo '<h1 class="entry--title">' . $the_title . '</h1>';
		?>
	</header><!-- .entry--header -->

	<div class="entry--content">
		<?php
			$post_content = get_post($post_id);
			$content = $post_content->post_content;
			echo apply_filters('the_content',$content);
		?>
	</div><!-- .entry-content -->

	<?php if ( get_edit_post_link() ) : ?>
		<footer class="entry--footer">
			<?php
				edit_post_link(
					sprintf(
						/* translators: %s: Name of current post */
						esc_html__( 'Edit %s', 'TEXTDOMAIN' ),
						the_title( '<span class="screenReaderText">"', '"</span>', false )
					),
					'<span class="editLink">',
					'</span>'
				);
			?>
		</footer><!-- .entry--footer -->
	<?php endif; ?>
</article><!-- #post-## -->
