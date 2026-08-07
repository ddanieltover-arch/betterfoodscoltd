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
    'title'         => '',
    'user'          => 'envato',
    'twitter_id'    => '681414676190605312',
    'limit'         => 2,
    'width'         => 180,
    'height'        => 200,
    'border_color'  => '#000',
    'link_color'    => '#000',
    'text_color'    => '#000',
    'name_color'    => '#000',
    'show_header'   => 0,
    'show_footer'   => 0,
    'show_border'   => 0,
    'show_scrollbar' => 0,
    'transparent'   => 0,
    'show_replies'  => 0,
);
$instance = wp_parse_args( $instance, $instance_defaults );

extract( $args, EXTR_PREFIX_ALL, 'w' );
extract( $instance, EXTR_PREFIX_ALL, 'inst' );

$title = apply_filters( 'widget_title', $inst_title );

$chrome = '';

if ( isset( $inst_show_header ) && $inst_show_header == 0 ) {
    $chrome .= 'noheader ';
}
if ( isset( $inst_show_footer ) && $inst_show_footer == 0 ) {
   $chrome .= 'nofooter ';
}
if ( isset( $inst_show_border ) && $inst_show_border == 0 ) {
   $chrome .= 'noborders ';
}

if ( isset( $inst_transparent ) && $inst_transparent == 0 ) {
    $chrome .= 'transparent';
}
$js = '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?\'http\':\'https\';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
?>
<div class="widget-twitter block">
	<div class="block_content">
		<div id="tbay-twitter<?php echo esc_attr( $inst_user ); ?>" class="tbay-twitter">
			<a class="twitter-timeline" data-dnt="true" <?php echo ! empty( $inst_width ) ? 'width="' . esc_attr( $inst_width ) . 'px"' : ''; ?> <?php echo ! empty( $inst_height ) ? 'height="' . esc_attr( $inst_height ) . 'px"' : ''; ?> data-chrome="<?php echo esc_attr( $chrome ); ?>" data-border-color="<?php echo esc_attr( $inst_border_color ); ?>"  data-tweet-limit="<?php echo esc_attr( $inst_limit ); ?>" data-link-color="<?php echo esc_attr( $inst_link_color ); ?>"  data-show-replies="<?php echo esc_attr( $inst_show_replies ); ?>" href="https://twitter.com/<?php echo esc_attr( $inst_user ); ?>"  data-widget-id="<?php echo esc_attr( $inst_twitter_id ); ?>">Tweets by @<?php echo esc_html( $inst_user ); ?></a>
			<?php echo trim( $js ); ?>
		</div>
	</div>
</div>
<script type="text/javascript">
	(function($) {
		// Customize twitter feed
		var hideTwitterAttempts = 0;
		function hideTwitterBoxElements() {
		 setTimeout( function() {
		  if ( $('[id*=tbay-twitter<?php echo esc_js( $inst_user ); ?>]').length ) {
		   $('#tbay-twitter<?php echo esc_js( $inst_user ); ?> iframe').each( function(){

		    var ibody = $(this).contents().find( 'body' );
			var show_scroll = <?php echo isset( $inst_show_scrollbar ) ? esc_js( $inst_show_scrollbar ) : 0; ?>;
			var height =  <?php echo isset( $inst_height ) ? esc_js( $inst_height ) : 200; ?>+'px';
		    if ( ibody.find( '.timeline-Body .timeline-TweetList li.timeline-TweetList-tweet' ).length ) {
				ibody.find( '.timeline-Tweet-text' ).css( 'color', '<?php echo isset( $inst_text_color ) ? esc_js( $inst_text_color ) : '#000'; ?>' );
				ibody.find( '.SummaryCard-content' ).css( 'color', '<?php echo isset( $inst_text_color ) ? esc_js( $inst_text_color ) : '#000'; ?>' );
				ibody.find( '.timeline-Tweet-author' ).css( 'color', '<?php echo isset( $inst_name_color ) ? esc_js( $inst_name_color ) : '#000'; ?>' );
				if(show_scroll == 1){
					ibody.find( '.timeline .stream' ).css( 'max-height', height );
					ibody.find( '.timeline .stream' ).css( 'overflow-y', 'auto' );
				}
		    } else {
		     $(this).hide();
		    }
		   });
		  }
		  hideTwitterAttempts++;
		  if ( hideTwitterAttempts < 3 ) {
		   hideTwitterBoxElements();
		  }
		 }, 1500);
		}
		// somewhere in your code after html page load
		hideTwitterBoxElements();
	})(jQuery);
</script>