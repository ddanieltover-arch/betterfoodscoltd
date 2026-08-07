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
            update_option('yith_woocompare_show_compare_button_in', 'product');
            update_option('yith_woocompare_is_button', 'link');
        }        

        if( class_exists( 'YITH_WCWL' ) ) {
            update_option( 'yith_wcwl_button_position', 'add-to-cart' ); 
        }

        if( defined('YITH_WFBT') && YITH_WFBT ) {
            update_option( 'yith-wfbt-form-position', '4'); 
        }

        add_filter( 'woocommerce_get_image_size_gallery_thumbnail', function( $size ) {

            $tbay_thumbnail_width       = get_option( 'tbay_woocommerce_thumbnail_image_width', 160);
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
    function greenmart_woocommerce_setup_size_image() {
        if (greenmart_tbay_get_global_config('config_media', false)) {
            return;
        }

        $thumbnail_width = 405;
        $main_image_width = 570;
        $cropping_custom_width = 81;
        $cropping_custom_height = 66;

        if (intval(get_option('woocommerce_thumbnail_image_width')) !== $thumbnail_width) {
            update_option('woocommerce_thumbnail_image_width', $thumbnail_width);
        }
        if (intval(get_option('woocommerce_single_image_width')) !== $main_image_width) {
            update_option('woocommerce_single_image_width', $main_image_width);
        }
        if (get_option('woocommerce_thumbnail_cropping') !== 'custom') {
            update_option('woocommerce_thumbnail_cropping', 'custom');
        }
        if (intval(get_option('woocommerce_thumbnail_cropping_custom_width')) !== $cropping_custom_width) {
            update_option('woocommerce_thumbnail_cropping_custom_width', $cropping_custom_width);
        }
        if (intval(get_option('woocommerce_thumbnail_cropping_custom_height')) !== $cropping_custom_height) {
            update_option('woocommerce_thumbnail_cropping_custom_height', $cropping_custom_height);
        }
    }
    add_action('after_setup_theme', 'greenmart_woocommerce_setup_size_image', 10);
}

add_action( 'woocommerce_single_product_summary', 'greenmart_tbay_woocommerce_share_box', 99 );


if (!function_exists('greenmart_update_yith_wishlist_40')) {
    function greenmart_update_yith_wishlist_40()
    {
        update_option('yith_wcwl_add_to_wishlist_icon_type', 'default');
        update_option('yith_wcwl_added_to_wishlist_icon_type', 'same');
        update_option('yith_wcwl_add_to_wishlist_icon', 'heart');
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