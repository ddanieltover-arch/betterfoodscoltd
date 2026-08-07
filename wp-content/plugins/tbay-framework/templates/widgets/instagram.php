<?php
// Extract with defaults to prevent undefined variable warnings
$defaults = array(
    'before_widget' => '<div class="widget">',
    'after_widget'  => '</div>',
    'before_title'  => '<h3 class="widget-title">',
    'after_title'   => '</h3>',
);
$args = wp_parse_args( $args, $defaults );

$instance_defaults = array(
    'title'    => '',
    'username' => '',
    'number'   => 6,
    'size'     => 'thumbnail',
    'target'   => '_blank',
    'columns'  => 4,
    'style'    => 'style1',
);
$instance = wp_parse_args( $instance, $instance_defaults );

extract( $args, EXTR_PREFIX_ALL, 'w' );
extract( $instance, EXTR_PREFIX_ALL, 'inst' );

$title = apply_filters( 'widget_title', $inst_title );
?>
<div class="instagram-widget <?php echo isset( $inst_style ) ? esc_attr( $inst_style ) : ''; ?>">
<?php
if ( $title ) {
    echo wp_kses_post( $w_before_title ) . esc_html( trim( $title ) );
?>
    <a href="<?php echo esc_url( trailingslashit( 'https://instagram.com/' . esc_attr( trim( $inst_username ) ) ) ); ?>" rel="me" target="<?php echo esc_attr( $inst_target ); ?>">@<?php echo esc_html( $inst_username ); ?></a>
<?php
    echo wp_kses_post( $w_after_title );
}
$bcol = 12 / (int) $inst_columns;
if ( $inst_columns == 5 ) {
    $bcol = 'cus-5';
}

    if ( $inst_username != '' ) {
        $media_array = tbay_framework_scrape_instagram( $inst_username );

        if ( is_wp_error( $media_array ) ) {

            echo wp_kses_post( $media_array->get_error_message() );

        } else {

            // filter for images only?
            if ( $images_only = apply_filters( 'tbay_framework_instagram_widget_images_only', false ) ) {
                $media_array = array_filter( $media_array, 'tbay_framework_images_only' );
            }

            // slice list down to required number
            $media_array = array_slice( $media_array, 0, $inst_number );
            ?>
            <div class="row instagram-pics">
                <?php
                foreach ( $media_array as $item ) {
                    $image_key = 'thumbnail' === $inst_size ? 'thumbnail' : ( 'small' === $inst_size ? 'small' : ( 'large' === $inst_size ? 'large' : 'original' ) );
                    echo '<div class="col-md-' . esc_attr( $bcol ) . '">';
                    echo '<a href="' . esc_url( $item['link'] ) . '" target="' . esc_attr( $inst_target ) . '"><img src="' . esc_url( $item[ $image_key ] ) . '" alt="' . esc_attr( $item['description'] ) . '" title="' . esc_attr( $item['description'] ) . '"/></a>';
                    echo '</div>';
                }
                ?>
            </div>
            <?php
        }
    }
?>
</div>