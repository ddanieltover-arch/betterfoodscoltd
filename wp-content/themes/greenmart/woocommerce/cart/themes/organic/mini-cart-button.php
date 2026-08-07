<?php   
    global $woocommerce; 

    $data_dropdown = ( is_checkout() || is_cart() ) ? '' : 'data-toggle="dropdown" aria-expanded="true" role="button" aria-haspopup="true" data-delay="0"';
?>
<div class="tbay-topcart">
 <div id="cart" class="dropdown version-1">
        <span class="text-skin cart-icon">
			<i class="<?php echo greenmart_get_icon('icon_cart'); ?>"></i>
			<span class="mini-cart-items">
			   <?php echo sprintf( '%d', $woocommerce->cart->cart_contents_count );?>
			</span>
		</span>
        <a class="dropdown-toggle mini-cart" <?php echo $data_dropdown; ?> href="<?php echo ( is_checkout() ) ? wc_get_cart_url() : 'javascript:void(0);'; ?>" title="<?php esc_attr_e('View your shopping cart', 'greenmart'); ?>">
            
			<span class="sub-title"><?php echo esc_html__('My Shopping Cart ', 'greenmart'); ?> <i class="<?php echo greenmart_get_icon('icon_rounded'); ?>"></i> </span>
			<span class="mini-cart-subtotal"><?php wc_cart_totals_subtotal_html();?></span>
            
        </a>   
        <?php if( !is_checkout() && !is_cart() ) : ?>         
            <div class="dropdown-menu"><div class="widget_shopping_cart_content">
                <?php woocommerce_mini_cart(); ?>
            </div></div>
        <?php endif; ?>
    </div>
</div>    