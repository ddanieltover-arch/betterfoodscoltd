<?php
/**
 * Register required and recommended plugins for Greenmart theme using TGM Plugin Activation.
 *
 * @package Greenmart
 * @since Greenmart 2.1.6
 */

require_once get_template_directory() . '/inc/plugins/class-tgm-plugin-activation.php';

/**
 * Registers required and recommended plugins for the Greenmart theme.
 *
 * @return void
 */
function greenmart_register_required_plugins() {
    // Bail early if TGMPA class is not available
    if (!class_exists('TGM_Plugin_Activation')) {
        return;
    }

    $plugins = array(
        array(
            'name'     => 'WooCommerce',
            'slug'     => 'woocommerce',
            'required' => true,
        ),
        array(
            'name'     => 'MC4WP: Mailchimp for WordPress',
            'slug'     => 'mailchimp-for-wp',
            'required' => true,
        ),
        array(
            'name'     => 'Contact Form 7',
            'slug'     => 'contact-form-7',
            'required' => true,
        ),
        array(
            'name'     => 'WPBakery Page Builder',
            'slug'     => 'js_composer',
            'required' => true,
            'source'   => esc_url('https://plugins.thembay.com/js_composer.zip'),
        ),
        array(
            'name'     => 'Tbay Framework',
            'slug'     => 'tbay-framework',
            'required' => true,
            'source'   => esc_url('https://plugins.thembay.com/tbay-framework.zip'),
        ),
        array(
            'name'     => 'Redux Framework',
            'slug'     => 'redux-framework',
            'required' => true,
        ),
        array(
            'name'     => 'Elementor Website Builder',
            'slug'     => 'elementor',
            'required' => true,
        ),
        array(
            'name'     => 'Variation Swatches for WooCommerce',
            'slug'     => 'woo-variation-swatches',
            'required' => true,
            'source'   => esc_url('https://downloads.wordpress.org/plugin/woo-variation-swatches.zip'),
        ),
        array(
            'name'     => 'YITH WooCommerce Quick View',
            'slug'     => 'yith-woocommerce-quick-view',
            'required' => false,
        ),
        array(
            'name'     => 'YITH WooCommerce Frequently Bought Together',
            'slug'     => 'yith-woocommerce-frequently-bought-together',
            'required' => false,
        ),
        array(
            'name'     => 'YITH WooCommerce Wishlist',
            'slug'     => 'yith-woocommerce-wishlist',
            'required' => false,
        ),
        array(
            'name'     => 'Slider Revolution',
            'slug'     => 'revslider',
            'required' => true,
            'source'   => esc_url('https://plugins.thembay.com/revslider.zip'),
        ),
    );

    // Conditional plugins based on theme
    $current_theme = greenmart_tbay_get_theme();
    if ('fresh-el' !== $current_theme) {
        $plugins[] = array(
            'name'     => 'YITH Woocommerce Compare',
            'slug'     => 'yith-woocommerce-compare',
            'required' => false,
        );
    } else {
        $plugins[] = array(
            'name'     => 'Photo Reviews for WooCommerce',
            'slug'     => 'woo-photo-reviews',
            'required' => false,
        );
    }

    // Allow filtering of plugins list
    $plugins = apply_filters('greenmart_tbay_required_plugins', $plugins);

    // TGM Configuration
    $config = array(
        'id'           => 'greenmart-tgmpa',
        'domain'       => 'greenmart',
        'menu'         => 'tgmpa-install-plugins',
        'has_notices'  => true,
        'dismissable'  => true,
        'is_automatic' => false,
    );

    // Register plugins with TGMPA
    tgmpa($plugins, $config);
}
add_action('tgmpa_register', 'greenmart_register_required_plugins');