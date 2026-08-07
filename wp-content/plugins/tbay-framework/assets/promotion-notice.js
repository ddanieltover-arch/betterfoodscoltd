( function( $ ) {
	'use strict';
	$( document ).on( 'click', '.tbay-framework-promo-notice__dismiss', function() {
		var $notice = $( this ).closest( '.tbay-framework-promo-notice' );
		$notice.fadeTo( 150, 0, function() {
			$notice.slideUp( 150, function() { $notice.remove(); } );
		} );
		$.post( tbayFrameworkPromotionNotice.ajaxUrl, {
			action: 'tbay_framework_dismiss_promotion_notice',
			nonce: tbayFrameworkPromotionNotice.nonce,
			promotion_id: tbayFrameworkPromotionNotice.promotionId
		} );
	} );
}( jQuery ) );