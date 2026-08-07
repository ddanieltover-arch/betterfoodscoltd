<?php
/**
 * widget base for tbay framework
 *
 * @package    tbay-framework
 * @author     Team Thembays <tbaythemes@gmail.com >
 * @license    GNU General Public License, version 3
 * @copyright  2015-2016 Tbay Framework
 */

abstract class Tbay_Widget extends WP_Widget {
	
	public $template;
	abstract function getTemplate();

	public function display( $args, $instance ) {
		$this->getTemplate();

		// Set defaults to prevent undefined variable warnings
		$defaults = array(
			'before_widget' => '<div class="widget">',
			'after_widget'  => '</div>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		);
		$args = wp_parse_args( $args, $defaults );

		// Set instance defaults
		$instance_defaults = array(
			'title' => '',
		);
		$instance = wp_parse_args( $instance, $instance_defaults );

		// Extract with prefixes to avoid conflicts
		extract( $args, EXTR_PREFIX_ALL, 'w' );
		extract( $instance, EXTR_PREFIX_ALL, 'inst' );

		echo wp_kses_post( $w_before_widget );
			require tbay_framework_get_widget_locate( $this->template );
		echo wp_kses_post( $w_after_widget );
	}
}