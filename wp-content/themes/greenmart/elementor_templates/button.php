<?php 
/**
 * Templates Name: Elementor
 * Widget: Button
 */
if( empty($settings['text_button']) ) return;

$this->add_render_attribute('content', 'class', 'banner-content');
?>
<div <?php $this->print_render_attribute_string('wrapper'); ?>>
    <?php $this->render_item(); ?>
</div>