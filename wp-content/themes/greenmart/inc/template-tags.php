<?php
/**
 * Custom template tags for greenmart
 *
 * Eventually, some of the functionality here could be replaced by core features.
 *
 * @package WordPress
 * @subpackage greenmart
 * @since greenmart 2.1.6
 */

 if (!function_exists('greenmart_tbay_comment_nav')) {
    function greenmart_tbay_comment_nav() {
        if (!get_option('page_comments') || get_comment_pages_count() <= 1) {
            return;
        }

        $post_id = get_the_ID();
        if (!$post_id) {
            return;
        }

        $cache_key = 'greenmart_comment_nav_' . $post_id;
        $cached = wp_cache_get($cache_key);
        if (false !== $cached) {
            echo $cached; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            return;
        }

        ob_start();
        ?>
        <nav class="navigation comment-navigation" role="navigation">
            <h2 class="screen-reader-text"><?php esc_html_e('Comment navigation', 'greenmart'); ?></h2>
            <div class="nav-links">
                <?php
                $prev_link = get_previous_comments_link(esc_html__('Older Comments', 'greenmart'));
                if ($prev_link) {
                    printf('<div class="nav-previous">%s</div>', $prev_link); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                }

                $next_link = get_next_comments_link(esc_html__('Newer Comments', 'greenmart'));
                if ($next_link) {
                    printf('<div class="nav-next">%s</div>', $next_link); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                }
                ?>
            </div>
        </nav>
        <?php
        $output = ob_get_clean();
        wp_cache_set($cache_key, $output, '', 24 * HOUR_IN_SECONDS);
        echo apply_filters('greenmart_tbay_comment_nav_output', $output, $post_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
}

if (!function_exists('greenmart_tbay_entry_meta')) {
    function greenmart_tbay_entry_meta() {
        $cache_key = 'greenmart_entry_meta_' . get_the_ID();
        $cached = wp_cache_get($cache_key);
        if ($cached !== false) {
            echo $cached;
            return;
        }

        ob_start();
        if (is_sticky() && is_home() && !is_paged()) {
            printf('<span class="sticky-post">%s</span>', esc_html__('Featured', 'greenmart'));
        }

        $format = get_post_format();
        if (current_theme_supports('post-formats', $format)) {
            printf('<span class="entry-format">%1$s<a href="%2$s">%3$s</a></span>',
                sprintf('<span class="screen-reader-text">%s </span>', _x('Format', 'Used before post format.', 'greenmart')),
                esc_url(get_post_format_link($format)),
                get_post_format_string($format)
            );
        }

        $post_type = get_post_type();
        if (in_array($post_type, ['post', 'attachment'])) {
            $time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
            if (get_the_time('U') !== get_the_modified_time('U')) {
                $time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
            }
            $time_string = sprintf($time_string,
                esc_attr(get_the_date('c')),
                get_the_date(),
                esc_attr(get_the_modified_date('c')),
                get_the_modified_date()
            );
            printf('<span class="posted-on"><span class="screen-reader-text">%1$s </span><a href="%2$s" rel="bookmark">%3$s</a></span>',
                _x('Posted on', 'Used before publish date.', 'greenmart'),
                esc_url(get_permalink()),
                $time_string
            );
        }

        if ($post_type === 'post') {
            if (is_singular() || is_multi_author()) {
                printf('<span class="byline"><span class="author vcard"><span class="screen-reader-text">%1$s </span><a class="url fn n" href="%2$s">%3$s</a></span></span>',
                    _x('Author', 'Used before post author name.', 'greenmart'),
                    esc_url(get_author_posts_url(get_the_author_meta('ID'))),
                    get_the_author()
                );
            }

            $categories_list = get_the_category_list(_x(', ', 'Used between list items, there is a space after the comma.', 'greenmart'));
            if ($categories_list && greenmart_tbay_categorized_blog()) {
                printf('<span class="cat-links"><span class="screen-reader-text">%1$s </span>%2$s</span>',
                    _x('Categories', 'Used before category names.', 'greenmart'),
                    $categories_list
                );
            }

            $tags_list = get_the_tag_list('', _x(', ', 'Used between list items, there is a space after the comma.', 'greenmart'));
            if ($tags_list) {
                printf('<span class="tags-links"><span class="screen-reader-text">%1$s </span>%2$s</span>',
                    _x('Tags', 'Used before tag names.', 'greenmart'),
                    $tags_list
                );
            }
        }

        if (is_attachment() && wp_attachment_is_image()) {
            $metadata = wp_get_attachment_metadata();
            printf('<span class="full-size-link"><span class="screen-reader-text">%1$s </span><a href="%2$s">%3$s &times; %4$s</a></span>',
                _x('Full size', 'Used before full size attachment link.', 'greenmart'),
                esc_url(wp_get_attachment_url()),
                $metadata['width'],
                $metadata['height']
            );
        }

        if (!is_single() && !post_password_required() && (comments_open() || get_comments_number())) {
            echo '<span class="comments-link">';
            comments_popup_link(sprintf(esc_html__('Leave a comment<span class="screen-reader-text"> on %s</span>', 'greenmart'), get_the_title()));
            echo '</span>';
        }

        $output = ob_get_clean();
        wp_cache_set($cache_key, $output, '', 24 * HOUR_IN_SECONDS);
        echo $output;
    }
}

/**
 * Determine whether blog/site has more than one category.
 *
 * @since greenmart 2.1.6
 *
 * @return bool True of there is more than one category, false otherwise.
 */
if (!function_exists('greenmart_tbay_categorized_blog')) {
    function greenmart_tbay_categorized_blog() {
        $transient_key = 'greenmart_tbay_categories';
        $all_the_cool_cats = get_transient($transient_key);
        if ($all_the_cool_cats === false) {
            $all_the_cool_cats = get_categories([
                'fields' => 'ids',
                'hide_empty' => 1,
                'number' => 2, 
                'no_found_rows' => true 
            ]);
            $all_the_cool_cats = count($all_the_cool_cats);
            set_transient($transient_key, $all_the_cool_cats, 24 * HOUR_IN_SECONDS);
        }
        return $all_the_cool_cats > 1;
    }
}

/**
 * Flush out the transients used in {@see greenmart_tbay_categorized_blog()}.
 *
 * @since greenmart 2.1.6
 */
if ( ! function_exists( 'greenmart_tbay_category_transient_flusher' ) ) {
	function greenmart_tbay_category_transient_flusher() {
		// Like, beat it. Dig?
		delete_transient( 'greenmart_tbay_categories' );
	}
	add_action( 'edit_category', 'greenmart_tbay_category_transient_flusher' );
	add_action( 'save_post',     'greenmart_tbay_category_transient_flusher' );
}

if (!function_exists('greenmart_tbay_post_thumbnail')) {
    function greenmart_tbay_post_thumbnail() {
        if (post_password_required() || is_attachment() || !has_post_thumbnail()) return;

        $cache_key = 'greenmart_post_thumbnail_' . get_the_ID();
        $cached = wp_cache_get($cache_key);
        if ($cached !== false) {
            echo $cached;
            return;
        }

        ob_start();
        if (is_singular()) {
            ?>
            <div class="post-thumbnail">
                <?php the_post_thumbnail('full'); ?>
            </div>
            <?php
        } else {
            ?>
            <a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true">
                <?php the_post_thumbnail('full', ['alt' => get_the_title()]); ?>
            </a>
            <?php
        }
        $output = ob_get_clean();
        wp_cache_set($cache_key, $output, '', 24 * HOUR_IN_SECONDS);
        echo $output;
    }
}

if (!function_exists('greenmart_tbay_excerpt_more') && !is_admin()) {
    function greenmart_tbay_excerpt_more($more) {
        $link = sprintf('<a href="%1$s" class="more-link">%2$s</a>',
            esc_url(get_permalink(get_the_ID())),
            sprintf(esc_html__('Continue reading %s', 'greenmart'), '<span class="screen-reader-text">' . get_the_title(get_the_ID()) . '</span>')
        );
        return ' &hellip; ' . $link;
    }
    add_filter('excerpt_more', 'greenmart_tbay_excerpt_more');
}

if ( ! function_exists( 'greenmart_search_only_title' ) ) {
	function greenmart_search_only_title( $search, $wp_query ) {
	    if ( ! empty( $search ) && ! empty( $wp_query->query_vars['search_terms'] ) ) {
	        global $wpdb;

	        $q = $wp_query->query_vars;
	        $n = ! empty( $q['exact'] ) ? '' : '%';

	        $search = array();

	        foreach ( ( array ) $q['search_terms'] as $term )
	            $search[] = $wpdb->prepare( "$wpdb->posts.post_title LIKE %s", $n . $wpdb->esc_like( $term ) . $n );

	        if ( ! is_user_logged_in() )
	            $search[] = "$wpdb->posts.post_password = ''";

	        $search = ' AND ' . implode( ' AND ', $search );
	    }

	    return $search;
	}

	add_filter( 'posts_search', 'greenmart_search_only_title', 10, 2 );
}

if (!function_exists('wp_body_open')) {
    function wp_body_open() {
        do_action('wp_body_open');
    }
}