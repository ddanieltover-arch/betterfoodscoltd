<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $woocommerce;
?>

<?php do_action('woocommerce_before_mini_cart'); ?>

<div class="mini_cart_content">
	<div class="mini_cart_inner">
		<div class="mcart-border">
			<?php if ( WC()->cart && ! WC()->cart->is_empty() ) : ?>

				<h3><?php esc_html_e('Shopping cart', 'greenmart'); ?></h3>

				<ul class="cart_list product_list_widget <?php echo esc_attr($args['list_class']); ?>">
					<?php
					foreach(WC()->cart->get_cart() as $cart_item_key => $cart_item) {
						$_product     = apply_filters('woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key);
						$product_id   = apply_filters('woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key);

						if($_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters('woocommerce_widget_cart_item_visible', true, $cart_item, $cart_item_key)) {
							/**
							 * This filter is documented in woocommerce/templates/cart/cart.php.
							 *
							 * @since 2.1.0
							 */
							$product_name      = apply_filters( 'woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key );
							$thumbnail         = apply_filters( 'woocommerce_cart_item_thumbnail', $_product->get_image('woocommerce_gallery_thumbnail'), $cart_item, $cart_item_key );
							$product_price     = apply_filters( 'woocommerce_cart_item_price', WC()->cart->get_product_price( $_product ), $cart_item, $cart_item_key );
							$product_permalink = apply_filters( 'woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
							?>
							<li id="mcitem-<?php echo esc_attr($cart_item_key); ?>">

								<?php if ( empty( $product_permalink ) ) : ?>
									<?php echo trim($thumbnail);  ?>
								<?php else : ?>
									<a href="<?php echo esc_url( $product_permalink ); ?>">
										<?php echo trim($thumbnail);  ?>
									</a>
								<?php endif; ?>

								<div class="product-details">  
									<?php
										echo apply_filters( 'woocommerce_cart_item_remove_link', sprintf(
											'<a role="button" href="%s" class="remove" aria-label="%s" data-product_id="%s" data-cart_item_key="%s" data-product_sku="%s" data-success_message="%s"><i class="icons icon-close"></i></a>',
											esc_url( wc_get_cart_remove_url( $cart_item_key ) ),
											/* translators: %s is the product name */
											esc_attr( sprintf( __( 'Remove %s from cart', 'greenmart' ), wp_strip_all_tags( $product_name ) ) ),
											esc_attr( $product_id ),
											esc_attr( $cart_item_key ),
											esc_attr( $_product->get_sku() ),
											/* translators: %s is the product name */
											esc_attr( sprintf( __( '&ldquo;%s&rdquo; has been removed from your cart', 'greenmart' ), wp_strip_all_tags( $product_name ) ) )
										), $cart_item_key );
									?>

									<?php if ( empty( $product_permalink ) ) : ?>
										<?php echo wp_kses_post( $product_name ) . '&nbsp;'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<?php else : ?>
										<a href="<?php echo esc_url( $product_permalink ); ?>">
											<?php echo wp_kses_post( $product_name ) . '&nbsp;'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
										</a>
									<?php endif; ?>
									
									<div class="group">
										<?php echo wc_get_formatted_cart_item_data( $cart_item ); ?>

										<?php 
											$group_class = ( greenmart_tbay_get_config('show_mini_cart_qty', false) ) ? 'group-qty' : '';
										?>
										<div class="group-content <?php echo esc_attr($group_class); ?>">
										<?php 
                                            if (greenmart_tbay_get_config('show_mini_cart_qty', false)) {
                                                if( $_product->is_sold_individually() ) :
                                                    $product_quantity = sprintf('<input type="hidden" name="cart[%s][qty]" value="1" />', $cart_item_key); else :
                                                    $product_quantity = woocommerce_quantity_input(
                                                        array(
                                                            'input_name'   => 'cart[' . $cart_item_key . '][qty]',
                                                            'input_value'  => $cart_item['quantity'],
                                                            'max_value'    => $_product->get_max_purchase_quantity(),
                                                            'min_value'    => '0',
                                                            'product_name' => $product_name
                                                        ),
                                                        $_product,
                                                        false
                                                    );
                                                endif;

                                                echo '<span class="quantity-wrap">' . apply_filters('woocommerce_cart_item_quantity', $product_quantity, $cart_item_key, $cart_item) . '</span>'; // PHPCS: XSS ok.
                                            } else {
												?>
												<span class="quantity">
													<?php esc_html_e('Qty', 'greenmart'); ?>: <?php echo apply_filters('woocommerce_widget_cart_item_quantity',  sprintf('%s', $cart_item['quantity']) , $cart_item, $cart_item_key); ?>
												</span>
												<?php
											}
											?>
											
											<?php echo apply_filters('woocommerce_widget_cart_item_quantity',  sprintf('%s', $product_price) , $cart_item, $cart_item_key); ?>
										</div>

									</div>
								</div>
							</li>
							<?php
						}
					}

					do_action( 'woocommerce_mini_cart_contents' );
					?>
				</ul><!-- end product list -->
			<?php else: ?>
				<ul class="cart_empty <?php echo esc_attr($args['list_class']); ?>">
					<li><?php esc_html_e('You have no items in your shopping cart', 'greenmart'); ?></li>
					<li class="total"><?php esc_html_e('Subtotal', 'greenmart'); ?>: <?php wc_cart_totals_subtotal_html(); ?></li>
				</ul>
			<?php endif; ?>

			<?php if(sizeof(WC()->cart->get_cart()) > 0) : ?>

				<p class="total"><?php esc_html_e('Cart total', 'greenmart'); ?>: <?php wc_cart_totals_subtotal_html(); ?></p>

				<?php do_action('woocommerce_widget_shopping_cart_before_buttons'); ?>

				<p class="buttons">
					<a href="<?php echo esc_url( wc_get_checkout_url() );?>" class="checkout"><i class="icons icon-handbag"></i><?php esc_html_e('Checkout', 'greenmart'); ?></a>
					<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="view-cart"><i class="icons icon-lock"></i><?php esc_html_e('View Cart', 'greenmart'); ?></a>	
				</p>

			<?php endif; ?>
			<div class="clearfix"></div>
		</div>
	</div>
</div>

<?php do_action('woocommerce_after_mini_cart'); ?>