<?php 
/**
 * Templates Name: Elementor
 * Widget: Home Banner
 */
extract($settings);

if( empty($image_left) && empty($image_right) ) return;

$this->settings_layout();

?>

<div <?php $this->print_render_attribute_string('wrapper'); ?>>
    <?php $this->render_item($settings); ?>
</div>