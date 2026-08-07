<?php
if ( ! function_exists( 'greenmart_clear_available_pages_transient' ) ) {
    function greenmart_clear_available_pages_transient($post_id) {
        delete_transient('greenmart_available_pages');
    }
    add_action('save_post_page', 'greenmart_clear_available_pages_transient');
    add_action('delete_post_page', 'greenmart_clear_available_pages_transient');
}

if (!function_exists('greenmart_clear_on_sale_products_transient')) {
    /**
     * Clear on-sale products transient when product stock, post, or sale price changes.
     *
     * @param int|WC_Product $product Product ID or object (depending on hook)
     */
    function greenmart_clear_on_sale_products_transient() {
        delete_transient('greenmart_on_sale_products');
    }

    // Hook into product post save
    add_action('save_post_product', 'greenmart_clear_on_sale_products_transient');
    add_action('delete_post_product', 'greenmart_clear_on_sale_products_transient');
    add_action('edit_post_product', 'greenmart_clear_on_sale_products_transient');
}

if (! function_exists('greenmart_clear_available_menus_transient')) {
    function greenmart_clear_available_menus_transient() {
        delete_transient('greenmart_available_menus');
        global $sitepress;
        $current_lang = apply_filters('wpml_current_language', null);
        delete_transient('greenmart_menus_wpml_' . $current_lang);
    }
    // Hook into menu creation
    add_action('wp_create_nav_menu', 'greenmart_clear_available_menus_transient');
    // Hook into menu deletion
    add_action('wp_delete_nav_menu', 'greenmart_clear_available_menus_transient');
    add_action('wp_update_nav_menu', 'greenmart_clear_available_menus_transient');
}

if (! function_exists('greenmart_clear_product_categories_transient')) {
    // Function to delete transients for product categories
    function greenmart_clear_product_categories_transient($term_id, $tt_id, $taxonomy) {
        delete_transient('greenmart_product_categories_all');
    }
    add_action('created_product_cat', 'greenmart_clear_product_categories_transient', 10, 3);
    add_action('edited_product_cat', 'greenmart_clear_product_categories_transient', 10, 3);
    add_action('delete_product_cat', 'greenmart_clear_product_categories_transient', 10, 2);
}

if (! function_exists('greenmart_clear_woocommerce_tags_transient')) {
    function greenmart_clear_woocommerce_tags_transient($term_id, $tt_id = '', $taxonomy = '') {
        delete_transient('greenmart_woocommerce_tags');
    }
    add_action('created_product_tag', 'greenmart_clear_woocommerce_tags_transient', 10, 3);
    add_action('edited_product_tag', 'greenmart_clear_woocommerce_tags_transient', 10, 3);
    add_action('delete_product_tag', 'greenmart_clear_woocommerce_tags_transient', 10, 2);
}


if (! function_exists('greenmart_clear_header_layouts_transient')) {
    function greenmart_clear_header_layouts_transient($post_id) {
        delete_transient('greenmart_header_layouts_elementor');
    }

    add_action('save_post_tbay_header', 'greenmart_clear_header_layouts_transient');
    add_action('delete_post_tbay_header', 'greenmart_clear_header_layouts_transient');
    add_action('edit_post_tbay_header', 'greenmart_clear_header_layouts_transient');
}


if (! function_exists('greenmart_clear_footer_layouts_transient')) {
    function greenmart_clear_footer_layouts_transient($post_id) {
        delete_transient('greenmart_footer_layouts');
    }
    add_action('save_post_tbay_footer', 'greenmart_clear_footer_layouts_transient');
    add_action('delete_post_tbay_footer', 'greenmart_clear_footer_layouts_transient');
    add_action('edit_post_tbay_footer', 'greenmart_clear_footer_layouts_transient');
}

if (! function_exists('greenmart_clear_megamenu_cache')) {
    function greenmart_clear_megamenu_cache($post_id) {
        set_transient('greenmart_megamenu_cache_clear', true, 60);
    }
    add_action('save_post_tbay_megamenu', 'greenmart_clear_megamenu_cache');
    add_action('delete_post_tbay_megamenu', 'greenmart_clear_megamenu_cache');
    add_action('wp_trash_post_tbay_megamenu', 'greenmart_clear_megamenu_cache');
}

if (! function_exists('greenmart_clear_menu_account_transients')) {
    function greenmart_clear_menu_account_transients($menu_id) {
        $menus = wp_get_nav_menus();
        foreach ($menus as $menu) {
            if ($menu->term_id == $menu_id) {
                $transient_key = 'greenmart_menu_account_' . md5($menu->slug); // Cần widget ID cụ thể
                delete_transient($transient_key);
            }
        }
    }
    add_action('wp_update_nav_menu', 'greenmart_clear_menu_account_transients');
}


if (!function_exists('greenmart_clear_all_product_transients')) {
    add_action('woocommerce_product_set_stock', 'greenmart_clear_all_product_transients');
    add_action('woocommerce_update_product_sale_price', 'greenmart_clear_all_product_transients');
    add_action('save_post_product', 'greenmart_clear_all_product_transients');
    add_action('delete_post_product', 'greenmart_clear_all_product_transients');
    add_action('edit_post_product', 'greenmart_clear_all_product_transients');
    function greenmart_clear_all_product_transients( $post_id ) {
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( get_post_type( $post_id ) !== 'product' ) {
            return;
        }

        global $wpdb;
        
        $prefixes = array(
            'greenmart_product_category_loop_',
            'greenmart_products_width_banner_loop_',
            'greenmart_products_loop_',
            'greenmart_product_flash_sales_loop_',
            'greenmart_product_categories_tab_loop_',
            'greenmart_product_count_down_loop_',
            'greenmart_product_tabs_loop_',
        );
        
        foreach ( $prefixes as $prefix ) {
            $wpdb->query( 
                $wpdb->prepare( 
                    "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", 
                    '_transient_' . $prefix . '%' 
                ) 
            );
            $wpdb->query( 
                $wpdb->prepare( 
                    "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", 
                    '_transient_timeout_' . $prefix . '%' 
                ) 
            );
        }

        delete_transient( 'greenmart_product_categories_all' );
        delete_transient( 'greenmart_woocommerce_tags' );
        delete_transient('greenmart_on_sale_products');
        delete_transient('greenmart_products_countdown');
    }
}