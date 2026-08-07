<?php
if (!defined('ABSPATH') ) {
    return; // Exit if accessed directly or class already exists.
}

use Elementor\Widget_Image;


abstract class Greenmart_Elementor_Widget_Image extends Widget_Image {
	public function get_name_template() {
        return str_replace('greenmart-', '', $this->get_name());
    }

    public function get_categories() {
        return [ 'greenmart-elements' ];
    }

    public function get_name() {
        return 'tbay-base';
    }

    /**
	 * Get view template
	 *
	 * @param string $tpl_name
	 */
	protected function get_view_template($tpl_slug, $tpl_name, $settings = []) {
        if (empty($tpl_slug)) {
            return;
        }

        $settings = empty($settings) ? $this->get_settings_for_display() : $settings;
        $template_base = 'elementor_templates/';
        $cache_key = 'greenmart_template_' . md5($tpl_slug . '-' . $tpl_name);
        $located = wp_cache_get($cache_key);

        if (false === $located) {
            $templates = [];

            // Sanitize template name to prevent directory traversal
            $tpl_name = $tpl_name ? preg_replace('/[^a-zA-Z0-9_-]/', '', trim($tpl_name, DIRECTORY_SEPARATOR)) : '';

            if (!empty($tpl_name)) {
                $templates[] = "{$template_base}{$tpl_slug}-{$tpl_name}.php";
                $templates[] = "{$template_base}{$tpl_slug}/{$tpl_name}.php";
            }
            $templates[] = "{$template_base}{$tpl_slug}.php";

            $located = false;
            foreach ($templates as $template) {
                $template_path = GREENMART_THEMEROOT . '/' . $template;
                if (file_exists($template_path)) {
                    $located = locate_template($template);
                    break;
                }
            }

            wp_cache_set($cache_key, $located ?: 'not_found', '', HOUR_IN_SECONDS);
        }

        if ($located && 'not_found' !== $located) {
            include $located;
        } else {
            printf(
                /* translators: %1$s is template slug, %2$s is template name */
                esc_html__('Failed to load template with slug "%1$s" and name "%2$s".', 'greenmart'),
                esc_html($tpl_slug),
                esc_html($tpl_name)
            );
        }
    }

	protected function render() {
        $settings = $this->get_settings_for_display();
        $this->add_render_attribute('wrapper', 'class', 'tbay-element tbay-element-'. $this->get_name_template() );

        $this->get_view_template($this->get_name_template(), '', $settings);
    }
}