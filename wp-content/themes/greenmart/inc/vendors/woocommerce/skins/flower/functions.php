<?php

/**
 * WooCommerce
 *
 */
if ( ! function_exists( 'greenmart_woocommerce_setup_support' ) ) {
    add_action( 'after_setup_theme', 'greenmart_woocommerce_setup_support' );
    function greenmart_woocommerce_setup_support() {
        add_theme_support( 'wc-product-gallery-zoom' );
        add_theme_support( 'wc-product-gallery-lightbox' );
        add_theme_support( 'wc-product-gallery-slider' );

        if( class_exists( 'YITH_Woocompare' ) ) {
            update_option( 'yith_woocompare_compare_button_in_products_list', 'no' ); 
            update_option( 'yith_woocompare_compare_button_in_product_page', 'no' ); 
            update_option('yith_woocompare_show_compare_button_in', 'product');
            update_option('yith_woocompare_is_button', 'link');
        }        

        if( class_exists( 'YITH_WCWL' ) ) {
            update_option( 'yith_wcwl_button_position', 'shortcode' ); 
        }    

        if( defined('YITH_WFBT') && YITH_WFBT ) {
            update_option( 'yith-wfbt-form-position', '4'); 
        }

        add_filter( 'woocommerce_get_image_size_gallery_thumbnail', function( $size ) {

            $tbay_thumbnail_width       = get_option( 'tbay_woocommerce_thumbnail_image_width', 130);
            $tbay_thumbnail_height      = get_option( 'tbay_woocommerce_thumbnail_image_height', 130);
            $tbay_thumbnail_cropping    = get_option( 'tbay_woocommerce_thumbnail_cropping', 'yes');
            $tbay_thumbnail_cropping    = ($tbay_thumbnail_cropping == 'yes') ? true : false;

            return array(
                'width'  => $tbay_thumbnail_width,
                'height' => $tbay_thumbnail_height,
                'crop'   => $tbay_thumbnail_cropping,
            );
        } );

    }
}

if (!function_exists('greenmart_woocommerce_setup_size_image')) {
    add_action('after_setup_theme', 'greenmart_woocommerce_setup_size_image');
    function greenmart_woocommerce_setup_size_image() {
        if (greenmart_tbay_get_global_config('config_media', false)) {
            return;
        }

        $image_sizes = [
            'thumbnail_width' => 405,
            'main_image_width' => 570,
            'cropping_custom_width' => 1,
            'cropping_custom_height' => 1,
        ];

        $options = [
            'woocommerce_thumbnail_image_width' => $image_sizes['thumbnail_width'],
            'woocommerce_single_image_width' => $image_sizes['main_image_width'],
            'woocommerce_thumbnail_cropping' => 'custom',
            'woocommerce_thumbnail_cropping_custom_width' => $image_sizes['cropping_custom_width'],
            'woocommerce_thumbnail_cropping_custom_height' => $image_sizes['cropping_custom_height'],
        ];

        foreach ($options as $option => $value) {
            if ( intval(get_option($option))  !== $value) {
                update_option($option, $value);
            }
        }
    }
}

if (!function_exists('greenmart_woocommerce_product_buttons')) {
    function greenmart_woocommerce_product_buttons() {
        static $checked = false;
        $output = '';

        if (!$checked) {
            $has_wishlist = class_exists('YITH_WCWL');
            $has_compare = class_exists('YITH_Woocompare');
            $checked = true;
        }

        if ($has_wishlist || $has_compare) {
            if ($has_wishlist) {
                $output .= '<div class="tbay-wishlist">' . do_shortcode('[yith_wcwl_add_to_wishlist]') . '</div>';
            }
            if ($has_compare) {
                $output .= '<div class="tbay-compare">' . do_shortcode('[yith_compare_button]') . '</div>';
            }
            echo $output;
        }
    }
    add_action('woocommerce_after_add_to_cart_button', 'greenmart_woocommerce_product_buttons', 20);
}


/**
 *
 * Code used to change the price order in WooCommerce
 *
 * */
if (!function_exists('greenmart_woocommerce_price_html')) {
    function greenmart_woocommerce_price_html($price, $regular_price, $sale_price) {
        if ($sale_price && $regular_price !== $sale_price) {
            $pattern = '/(<del[^>]*>.*?<\/del>)(\s*<span class="screen-reader-text">.*?<\/span>\s*)(<ins[^>]*>.*?<\/ins>)(\s*<span class="screen-reader-text">.*?<\/span>)/s';
            $price = preg_replace($pattern, '$3$4$1$2', $price, 1); 
        }
        return $price;
    }
    add_filter('woocommerce_format_sale_price', 'greenmart_woocommerce_price_html', 10, 3);
}

add_action( 'woocommerce_single_product_summary', 'greenmart_tbay_woocommerce_share_box', 15 );

remove_action( 'greenmart_after_title_tbay_subtitle', 'greenmart_woo_get_subtitle', 0);
remove_action( 'yith_wcqv_product_summary', 'greenmart_woo_get_subtitle', 5);
remove_action( 'woocommerce_single_product_summary', 'greenmart_woo_get_subtitle', 5);
remove_action( 'woocommerce_product_options_general_product_data', 'greenmart_woo_subtitle_field' );

remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
add_action( 'woocommerce_after_cart_table', 'woocommerce_button_proceed_to_checkout' );

remove_action('woocommerce_cart_collaterals', 'woocommerce_cart_totals', 10);
add_action('woocommerce_after_cart_table', 'woocommerce_cart_totals', 0);

add_filter('yith_wcwl_remove_from_wishlist_label', 'greenmart_remove_wishlist_text', 10, 1);


if (!function_exists('greenmart_update_yith_wishlist_40')) {
    function greenmart_update_yith_wishlist_40()
    {
        update_option('yith_wcwl_add_to_wishlist_icon_type', 'default');
        update_option('yith_wcwl_added_to_wishlist_icon_type', 'same');
    }
}

if (!function_exists('greenmart_update_fix_new_plugin')) {
    add_action('after_setup_theme', 'greenmart_update_fix_new_plugin', 10);
    function greenmart_update_fix_new_plugin()
    {
        $current_theme_version = wp_get_theme()->get('Version');

        $stored_theme_version = get_option('greenmart_theme_version_fix_wishlist');

        if ($current_theme_version !== $stored_theme_version) {
            greenmart_update_yith_wishlist_40();

            update_option('greenmart_theme_version_fix_wishlist', $current_theme_version);
        }
    }
}