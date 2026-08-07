<?php

/**
 * WooCommerce
 *
 */
if (! function_exists('greenmart_woocommerce_setup_support')) {
    add_action('after_setup_theme', 'greenmart_woocommerce_setup_support');
    function greenmart_woocommerce_setup_support()
    {
        add_theme_support('wc-product-gallery-zoom');
        add_theme_support('wc-product-gallery-lightbox');
        add_theme_support('wc-product-gallery-slider');

        if (class_exists('YITH_Woocompare')) {
            update_option('yith_woocompare_compare_button_in_products_list', 'no');
            update_option('yith_woocompare_compare_button_in_product_page', 'no');
            update_option('yith_woocompare_show_compare_button_in', 'product');
            update_option('yith_woocompare_is_button', 'link');
        }

        if (class_exists('YITH_WCWL')) {
            update_option('yith_wcwl_button_position', 'shortcode');
        }

        if (defined('YITH_WFBT') && YITH_WFBT) {
            update_option('yith-wfbt-form-position', '4');
        }

        add_filter('woocommerce_get_image_size_gallery_thumbnail', function ($size) {

            $tbay_thumbnail_width       = get_option('tbay_woocommerce_thumbnail_image_width', 130);
            $tbay_thumbnail_height      = get_option('tbay_woocommerce_thumbnail_image_height', 130);
            $tbay_thumbnail_cropping    = get_option('tbay_woocommerce_thumbnail_cropping', 'yes');
            $tbay_thumbnail_cropping    = ($tbay_thumbnail_cropping == 'yes') ? true : false;

            return array(
                'width'  => $tbay_thumbnail_width,
                'height' => $tbay_thumbnail_height,
                'crop'   => $tbay_thumbnail_cropping,
            );
        });

    }
}

if (!function_exists('greenmart_woocommerce_setup_size_image')) {
    function greenmart_woocommerce_setup_size_image() {
        if (greenmart_tbay_get_global_config('config_media', false)) {
            return;
        }

        $thumbnail_width = 405;
        $main_image_width = 570;
        $cropping_custom_width = 1;
        $cropping_custom_height = 1;

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

if (! function_exists('greenmart_woocommerce_product_buttons')) {
    // Change Product Buttons
    function greenmart_woocommerce_product_buttons()
    {
        global $product;
        ?>
        <?php if (class_exists('YITH_WCWL') || class_exists('YITH_Woocompare')) { ?>
            <?php if (class_exists('YITH_WCWL')) { ?> 
                <div class="tbay-wishlist">
                   <?php echo do_shortcode('[yith_wcwl_add_to_wishlist]'); ?>
                </div>  
            <?php } ?>
            <?php if (class_exists('YITH_Woocompare')) { ?>
                <div class="tbay-compare">
                    <?php echo do_shortcode('[yith_compare_button]') ?>
                </div>
            <?php } ?>
        <?php } ?>
        <?php
    }
    add_action('woocommerce_after_add_to_cart_button', 'greenmart_woocommerce_product_buttons', 20);
}

if (!function_exists('greenmart_tbay_woocommerce_breadcrumb_health')) {
    function greenmart_tbay_woocommerce_breadcrumb_health($args)
    {
        $breadcrumb_img = greenmart_tbay_get_config('woo_breadcrumb_image');
        $breadcrumb_color = greenmart_tbay_get_config('woo_breadcrumb_color');
        $style = array();
        $img = $breadcrumb_class = '';
        if ($breadcrumb_color) {
            $style[] = 'background-color:'.$breadcrumb_color;
            $breadcrumb_class .= ' breadcrumb-color';
        }
        if (isset($breadcrumb_img['url']) && !empty($breadcrumb_img['url'])) {
            $img = '<img src="'.esc_url($breadcrumb_img['url']).'">';

            $breadcrumb_class .= ' breadcrumb-img';
        }
        $estyle = !empty($style) ? ' style="'.implode(";", $style).'"' : "";

        $args['wrap_before'] = '<section id="tbay-breadscrumb" class="tbay-breadscrumb '. $breadcrumb_class .' "'.$estyle.'>'.$img.'<div class="container"><div class="breadscrumb-inner"><ol class="tbay-woocommerce-breadcrumb breadcrumb" ' . (is_single() ? 'itemprop="breadcrumb"' : '') . '>';
        $args['wrap_after'] = '</ol></div></div></section>';

        return $args;
    }
}



add_action('init', 'greenmart_woo_remove_wc_breadcrumb2');
function greenmart_woo_remove_wc_breadcrumb2()
{
    if (!greenmart_tbay_get_config('show_product_breadcrumbs', true)) {
        remove_action('greenmart_woo_template_main_before', 'woocommerce_breadcrumb', 30, 0);
    } else {
        add_filter('woocommerce_breadcrumb_defaults', 'greenmart_tbay_woocommerce_breadcrumb_health');
        add_action('greenmart_woo_template_main_before', 'woocommerce_breadcrumb', 30, 0);
        remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
    }
}


/**
 *
 * Code used to change the price order in WooCommerce
 *
 * */
if (!function_exists('greenmart_woocommerce_price_html')) {
    function greenmart_woocommerce_price_html($price, $regular_price, $sale_price)
    {
        // Define the pattern with capturing groups for the old and sale prices
        $pattern = '/(<del[^>]*>.*?<\/del>)(\s*<span class="screen-reader-text">.*?<\/span>\s*)(<ins[^>]*>.*?<\/ins>)(\s*<span class="screen-reader-text">.*?<\/span>)/s';

        // Define the replacement pattern to swap positions
        $replacement = '$3$4$1$2';

        return preg_replace($pattern, $replacement, $price);
    }

    add_filter('woocommerce_format_sale_price', 'greenmart_woocommerce_price_html', 10, 3);
}

add_action('woocommerce_single_product_summary', 'greenmart_tbay_woocommerce_share_box', 15);

remove_action('woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20);
add_action('woocommerce_after_cart_table', 'woocommerce_button_proceed_to_checkout');

remove_action('woocommerce_cart_collaterals', 'woocommerce_cart_totals', 10);
add_action('woocommerce_after_cart_table', 'woocommerce_cart_totals', 0);

remove_action('woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_rating', 5);
add_action('woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_rating', 20);
add_action('woocommerce_after_shop_loop_item_title', 'greenmart_woo_get_subtitle', 15);

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
