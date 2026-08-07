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
    'title'       => '',
    'page_url'    => '',
    'width'       => '268',
    'show_faces'  => 'on',
    'show_header' => 'off',
);
$instance = wp_parse_args( $instance, $instance_defaults );

extract( $args, EXTR_PREFIX_ALL, 'w' );
extract( $instance, EXTR_PREFIX_ALL, 'inst' );

$title = apply_filters( 'widget_title', $inst_title );

if ( $title ) {
    echo wp_kses_post( $w_before_title ) . esc_html( trim( $title ) ) . wp_kses_post( $w_after_title );
}

if( $inst_page_url ): ?>
	<div id="fb-root"></div>
	<script>
		(function(d, s, id) {
		  var js, fjs = d.getElementsByTagName(s)[0];
		  if (d.getElementById(id)) return;
		  js = d.createElement(s); js.id = id;
		  js.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v2.5";
		  fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	</script>


	<div class="fb-page" data-href="<?php echo esc_url( $inst_page_url ); ?>" data-tabs="timeline"
		data-width="<?php echo esc_attr( $inst_width ); ?>" data-height="<?php echo esc_attr( $height ); ?>"
		data-small-header="<?php echo esc_attr( $inst_show_header ); ?>" data-adapt-container-width="true"
		data-hide-cover="true" data-show-facepile="<?php echo esc_attr( $inst_show_faces ); ?>">

	</div>


<?php endif; ?>