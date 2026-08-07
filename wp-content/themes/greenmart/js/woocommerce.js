'use strict';

class MiniCart {
  miniCartAll() {
    var $win = jQuery(window);
    var $box = jQuery('.tbay-dropdown-cart .dropdown-content,.tbay-bottom-cart .content,.topbar-mobile .btn,#tbay-mobile-menu, .active-mobile button,#tbay-offcanvas-main,.topbar-mobile .btn-toggle-canvas,#tbay-offcanvas-main .btn-toggle-canvas');
    $win.on("click.Bst,click touchstart tap", function (event) {
      if ($box.has(event.target).length == 0 && !$box.is(event.target)) {
        jQuery('#wrapper-container').removeClass('active active-cart');
        jQuery('#wrapper-container').removeClass('offcanvas-right');
        jQuery('#wrapper-container').removeClass('offcanvas-left');
        jQuery('.tbay-dropdown-cart').removeClass('active');
        jQuery('#tbay-offcanvas-main,.tbay-offcanvas').removeClass('active');
        jQuery("#tbay-dropdown-cart").hide(500);
        jQuery('.tbay-bottom-cart').removeClass('active');
      }
    });
    jQuery(".tbay-dropdown-cart.v2 .offcanvas-close").on('click', function () {
      jQuery('#wrapper-container').removeClass('active');
      jQuery('#wrapper-container').removeClass('offcanvas-right');
      jQuery('#wrapper-container').removeClass('offcanvas-left');
      jQuery('.tbay-dropdown-cart').removeClass('active');
    });
  }

}

const ADDED_TO_CART_EVENT = "added_to_cart";
const LIST_POST_AJAX_SHOP_PAGE = "greenmart_list_post_ajax";
const GRID_POST_AJAX_SHOP_PAGE = "greenmart_grid_post_ajax";

class AjaxCart {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;
    MiniCart.prototype.miniCartAll();

    this._initEventRemoveProduct();

    if (greenmart_settings.skin_elementor_fresh) {
      this._initAjaxPopupFresh();
    } else {
      this._intAjaxCart();
    }

    this._initEventMiniCartAjaxQuantity();
  }

  _intAjaxCart() {
    if (!jQuery('body').hasClass('tbay-disable-ajax-popup-cart')) {
      var product_info = null;
      jQuery('body').on('adding_to_cart', function (button, data, data2) {
        product_info = data2;
      });
      jQuery('body').on('added_to_cart', function (fragments, cart_hash) {
        if (typeof product_info['page'] === "undefined") {
          jQuery('#tbay-cart-modal').modal();
          var url = greenmart_settings.ajaxurl + '?action=greenmart_add_to_cart_product&product_id=' + product_info.product_id;
          jQuery.get(url, function (data, status) {
            jQuery('#tbay-cart-modal .modal-body .modal-body-content').html(data);
          });
          jQuery('#tbay-cart-modal').on('hidden.bs.modal', function () {
            jQuery(this).find('.modal-body .modal-body-content').empty();
          });
        }
      });
    }
  }

  _initEventRemoveProduct() {
    if (!greenmart_settings.enable_ajax_add_to_cart) return;
    jQuery(document).on('click', '.mini_cart_content a.remove', event => {
      this._onclickRemoveProduct(event);
    });
  }

  _onclickRemoveProduct(event) {
    event.preventDefault();
    var product_id = jQuery(event.currentTarget).attr("data-product_id"),
        cart_item_key = jQuery(event.currentTarget).attr("data-cart_item_key"),
        product_container = jQuery(event.currentTarget).parents('.mini_cart_item'),
        thisItem = jQuery(event.currentTarget).closest('.widget_shopping_cart_content');
    product_container.block({
      message: null,
      overlayCSS: {
        cursor: 'none'
      }
    });

    this._callRemoveProductAjax(product_id, cart_item_key, thisItem, event);
  }

  _callRemoveProductAjax(product_id, cart_item_key, thisItem, event) {
    jQuery.ajax({
      type: 'POST',
      dataType: 'json',
      url: wc_add_to_cart_params.ajax_url,
      data: {
        action: "product_remove",
        product_id: product_id,
        cart_item_key: cart_item_key
      },
      beforeSend: function () {
        thisItem.find('.mini_cart_content').append('<div class="ajax-loader-wapper"><div class="ajax-loader"></div></div>').fadeTo("slow", 0.3);
        event.stopPropagation();
      },
      success: response => {
        this._onRemoveSuccess(response, product_id);
      }
    });
  }

  _onRemoveSuccess(response, product_id) {
    if (!response || response.error) return;
    var fragments = response.fragments;

    if (fragments) {
      jQuery.each(fragments, function (key, value) {
        jQuery(key).replaceWith(value);
      });
    }

    jQuery('.add_to_cart_button.added[data-product_id="' + product_id + '"]').removeClass("added").next('.wc-forward').remove();
  }

  _initEventMiniCartAjaxQuantity() {
    var timeout;
    jQuery('body').on('change', '.mini_cart_content .qty', function (event) {
      event.preventDefault();
      var urlAjax = greenmart_settings.wc_ajax_url.toString().replace('%%endpoint%%', 'greenmart_quantity_mini_cart'),
          input = jQuery(this),
          wrap = jQuery(input).parents('.mini_cart_content'),
          hash = jQuery(input).attr('name').replace(/cart\[([\w]+)\]\[qty\]/g, "$1"),
          max = parseFloat(jQuery(input).attr('max'));

      if (!max) {
        max = false;
      }

      clearTimeout(timeout);
      var quantity = parseFloat(jQuery(input).val());

      if (max > 0 && quantity > max) {
        jQuery(input).val(max);
        quantity = max;
      }

      timeout = setTimeout(function () {
        jQuery.ajax({
          url: urlAjax,
          type: 'POST',
          dataType: 'json',
          cache: false,
          data: {
            hash: hash,
            quantity: quantity
          },
          beforeSend: function () {
            wrap.append('<div class="ajax-loader-wapper"><div class="ajax-loader"></div></div>').fadeTo("slow", 0.3);
            event.stopPropagation();
          },
          success: function (data) {
            if (data && data.fragments) {
              jQuery.each(data.fragments, function (key, value) {
                if (jQuery(key).length) {
                  jQuery(key).replaceWith(value);
                }
              });

              if (typeof $supports_html5_storage !== 'undefined' && $supports_html5_storage) {
                sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(data.fragments));
                set_cart_hash(data.cart_hash);

                if (data.cart_hash) {
                  set_cart_creation_timestamp();
                }
              }

              jQuery(document.body).trigger('wc_fragments_refreshed');
            }
          }
        });
      }, 300);
    });
  }

  _initAjaxPopupFresh() {
    var _this = this;

    if (typeof wc_add_to_cart_params === 'undefined' || jQuery('body').hasClass('tbay-disable-ajax-popup-cart')) {
      return false;
    }

    if (greenmart_settings.ajax_popup_quick) {
      jQuery(`body`).on('click', '.ajax_add_to_cart', function (e) {
        let button = jQuery(this);

        _this._initAjaxPopupContent(button);
      });
    } else {
      jQuery(`body`).on(ADDED_TO_CART_EVENT, function (ev, fragmentsJSON, cart_hash, button) {
        if (typeof fragmentsJSON == 'undefined') fragmentsJSON = jQuery.parseJSON(sessionStorage.getItem(wc_cart_fragments_params.fragment_name));

        _this._initAjaxPopupContent(button);
      });
    }
  }

  _initAjaxPopupContent(button) {
    jQuery('#tbay-cart-modal');
        let cart_modal_content = jQuery('#tbay-cart-modal').find('.modal-body-content'),
        cart_success = greenmart_settings.popup_cart_success,
        cart_icon = greenmart_settings.popup_cart_icon,
        cart_notification = greenmart_settings.popup_cart_noti,
        string = '';
    let title = button.closest('.product').find('.name  a').html();
    if (typeof title === "undefined") return;
    string += `<div class="popup-cart">`;
    string += `<div class="main-content">`;
    string += `<i class="${cart_icon}"></i>`;
    string += `<p class="success"> ${cart_success}</p>`;
    string += `<p class="notices">"${title}" ${cart_notification}</p>`;

    if (!greenmart_settings.is_checkout) {
      string += `<a class="button checkout" href="${greenmart_settings.checkout_url}" title="${greenmart_settings.i18n_checkout}">${greenmart_settings.i18n_checkout}</a>`;
    }

    if (!wc_add_to_cart_params.is_cart) {
      string += `<a class="button view-cart" href="${wc_add_to_cart_params.cart_url}" title="${wc_add_to_cart_params.i18n_view_cart}">${wc_add_to_cart_params.i18n_view_cart}</a>`;
    }

    string += `</div>`;
    string += `</div>`;

    if (typeof string !== "undefined") {
      cart_modal_content.append(string);
      jQuery('#tbay-cart-modal').modal();
    }

    jQuery('#tbay-cart-modal').on('hidden.bs.modal', function () {
      jQuery(this).find('.modal-body .modal-body-content').empty();
    });
  }

}

class WishList {
  constructor() {
    this._onChangeWishListItem();
  }

  _onChangeWishListItem() {
    jQuery(document).on('yith_wcwl_reload_fragments', () => {
      var counter = jQuery('.count_wishlist');
      jQuery.ajax({
        url: yith_wcwl_l10n.ajax_url,
        data: {
          action: 'yith_wcwl_update_wishlist_count'
        },
        dataType: 'json',
        success: function (data) {
          counter.html(data.count);
        },
        beforeSend: function () {
          counter.block();
        },
        complete: function () {
          counter.unblock();
        }
      });
    });
  }

}

class ProductItem {
  initOnChangeQuantity(callback) {
    var _this = this;

    if (typeof greenmart_settings === "undefined") return;
    jQuery(document).off('click', '.plus, .minus').on('click', '.plus, .minus', function () {
      var $qty = jQuery(this).closest('.quantity').find('.qty'),
          currentVal = parseFloat($qty.val()),
          max = parseFloat($qty.attr('max')),
          min = parseFloat($qty.attr('min')),
          step = parseFloat($qty.attr('step')),
          number_digits = _this.numberAfterDecimal(step);

      if (!currentVal || currentVal === '' || currentVal === 'NaN') currentVal = 0;
      if (max === '' || max === 'NaN') max = '';
      if (min === '' || min === 'NaN') min = 0;
      if (step === 'any' || step === '' || step === undefined || parseFloat(step) === 'NaN') step = 1;
      $qty.attr('old', currentVal);

      if (jQuery(this).is('.plus')) {
        if (max && (max == currentVal || currentVal > max || parseFloat((currentVal + parseFloat(step)).toFixed(number_digits)) > max)) {
          $qty.val(max);

          if (jQuery("#tb-limited-notification").length > 0) {
            jQuery("#tb-limited-notification").toast("show");
          }
        } else {
          $qty.val((currentVal + parseFloat(step)).toFixed(number_digits));
        }
      } else {
        if (min && (min == currentVal || currentVal < min) || parseFloat((currentVal - parseFloat(step)).toFixed(number_digits)) < min) {
          if (greenmart_settings.active_theme === 'fresh-el' && (jQuery(this).parents('.quantity-group-btn').length > 0 || jQuery(this).parents('.cart_list').length > 0)) {
            $qty.val(0);
          } else {
            $qty.val(min).trigger('change');
          }
        } else if (currentVal > 0) {
          $qty.val((currentVal - parseFloat(step)).toFixed(number_digits));
        }
      }

      if (callback && typeof callback == "function") {
        jQuery(this).parent().find('input').trigger("change");
        callback();

        if (jQuery(event.target).parents('.mini_cart_content').length > 0) {
          return false;
        }
      }
    });
  }

  numberAfterDecimal(value) {
    let output = 0;

    if (value.toString().split(".").length > 1) {
      output = value.toString().split(".")[1].length;
    } else {
      return output;
    }

    if (output < 0) return output;
    return output;
  }

  _initQuantityMode() {
    if (typeof greenmart_settings === "undefined" || !greenmart_settings.quantity_mode) return;

    if (greenmart_settings.active_theme === 'fresh-el' && !greenmart_settings.swatches_pro) {
      this._initQuantityModeFresh();
    } else {
      this._initQuantityModeNotFresh();
    }
  }

  _initQuantityModeNotFresh() {
    jQuery(".woocommerce .products").on("click", ".quantity .qty", function () {
      return false;
    });
    jQuery(document).on('change', ".quantity .qty", function () {
      var add_to_cart_button = jQuery(this).parents(".product-block").find(".add_to_cart_button");
      add_to_cart_button.attr("data-quantity", jQuery(this).val());
    });
    jQuery(document).on("keypress", ".quantity .qty", function (e) {
      if ((e.which || e.keyCode) === 13) {
        jQuery(this).parents(".product-block").find(".add_to_cart_button").trigger("click");
      }
    });
  }

  _initQuantityModeFresh() {
    var _this = this;

    jQuery(document).on('click', '.quantity-group-btn.active a.button', function () {
      jQuery(this).parents('.quantity-group-btn').addClass('ajax-quantity');
    });

    _this._initQuantityModeAjaxFresh();
  }

  _initQuantityModeAjaxFresh() {
    jQuery('body').on('change', '.quantity-group-btn .qty', function (event) {
      event.preventDefault();
      var urlAjax = greenmart_settings.wc_ajax_url.toString().replace('%%endpoint%%', 'greenmart_quantity_button'),
          input = jQuery(this),
          wrap = jQuery(input).parents('.quantity-group-btn'),
          old = parseFloat(jQuery(input).attr('old'));
          parseFloat(jQuery(input).attr('max'));
          var min = parseFloat(jQuery(input).attr('min'));

      var quantity = parseFloat(jQuery(input).val());
      if (quantity === old) return;
      jQuery.ajax({
        url: urlAjax,
        type: 'POST',
        dataType: 'json',
        cache: false,
        data: {
          product_id: wrap.find('a.button').attr('data-product_id'),
          quantity: quantity
        },
        beforeSend: function () {
          wrap.append('<div class="ajax-loader-wapper"><div class="ajax-loader"></div></div>').fadeTo("slow", 0.6).addClass('loading');
          event.stopPropagation();
        },
        success: function (data) {
          if (data && data.fragments) {
            jQuery.each(data.fragments, function (key, value) {
              if (jQuery(key).length) {
                jQuery(key).replaceWith(value);
              }
            });

            if (typeof $supports_html5_storage !== 'undefined' && $supports_html5_storage) {
              sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(data.fragments));
              set_cart_hash(data.cart_hash);

              if (data.cart_hash) {
                set_cart_creation_timestamp();
              }
            }

            wrap.fadeTo("slow", 1).removeClass('loading');
            wrap.find('.ajax-loader-wapper').remove();
            jQuery(document.body).trigger('wc_fragments_refreshed');

            if (quantity === 0) {
              wrap.removeClass('ajax-quantity');
              wrap.find('a.button').removeClass('added');
              wrap.find('a.added_to_cart').remove();
              input.val(min);

              if (min === 0) {
                input.val(1);
              } else {
                input.val(min);
              }
            }
          }
        },
        error: function () {
          wrap.fadeTo("slow", 1).removeClass('loading');
          wrap.find('.ajax-loader-wapper').remove();
          console.log('ajax error');
        }
      });
    });
  }

}

class Cart {
  constructor() {
    var _this = this;

    if (typeof greenmart_settings === "undefined") return;

    _this._initEventChangeQuantity();

    _this._initEventChangeQuantityInput();

    jQuery(document.body).on('wc_fragment_refresh updated_wc_div', () => {
      _this._initEventChangeQuantity();

      jQuery(document.body).trigger('greenmart_load_more');

      if (typeof wc_add_to_cart_variation_params !== 'undefined') {
        jQuery('.variations_form').each(function () {
          jQuery(this).wc_variation_form();
        });
      }
    });
    jQuery(document.body).on('cart_page_refreshed', () => {
      _this._initEventChangeQuantity();
    });
    jQuery(document.body).on('tbay_display_mode', () => {
      _this._initEventChangeQuantity();
    });
  }

  _initEventChangeQuantity() {
    let _this = this;

    if (jQuery("body.woocommerce-cart [name='update_cart']").length === 0) {
      new ProductItem().initOnChangeQuantity(() => {});
    } else {
      new ProductItem().initOnChangeQuantity(() => {
        if (greenmart_settings.ajax_update_quantity) {
          _this._initEventChangeQuantityClick();
        }
      });
    }
  }

  _initEventChangeQuantityInput() {
    if (!greenmart_settings.ajax_update_quantity) return;

    let _this = this;

    jQuery(document).on('change input', '.woocommerce-cart-form .cart_item :input', function (event) {
      _this._initEventChangeQuantityClick();
    });
  }

  _initEventChangeQuantityClick() {
    jQuery('.woocommerce-cart-form :input[name="update_cart"]').prop('disabled', false);
    jQuery('.woocommerce-cart-form :input[name="update_cart"]').trigger('click');
  }

}

class SideBar {
  constructor() {
    this._layoutShopCanvasSidebar();

    this._layoutShopFullWidth();

    this._layoutSidebarMobile();
  }

  _layoutShopCanvasSidebar() {
    jQuery(".button-canvas-sidebar, .product-canvas-sidebar .product-canvas-close").on("click", function (e) {
      jQuery('.product-canvas-sidebar').toggleClass('active');
      jQuery("body").toggleClass('product-canvas-active');
    });
    var win_canvas = jQuery(window);
    var box_canvas = jQuery('.product-canvas-sidebar .content,.button-canvas-sidebar');
    win_canvas.on("click.Bst", event => {
      event.target;

      if (box_canvas.has(event.target).length == 0 && !box_canvas.is(event.target)) {
        jQuery('.product-canvas-sidebar').removeClass('active');
        jQuery("body").removeClass('product-canvas-active');
      }
    });
  }

  _layoutSidebarMobile() {
    jQuery(document).on('click', '.tbay-sidebar-mobile-btn', function () {
      jQuery('body').toggleClass('show-sidebar');
    });
    jQuery(document).on('click', '.close-side-widget, .tbay-close-side', function () {
      jQuery('body').removeClass('show-sidebar');
    });
  }

  _layoutShopFullWidth() {
    jQuery(".button-product-top").on("click", function (e) {
      jQuery('.product-top-sidebar').toggleClass('active');
      jQuery('.product-top-sidebar > .container .content').slideToggle(500, function () {});
    });
  }

}

class ModalVideo {
  constructor($el, options = {
    classBtn: '.tbay-modalButton',
    defaultW: 640,
    defaultH: 360
  }) {
    this.$el = $el;
    this.options = options;

    this._initVideoIframe();
  }

  _initVideoIframe() {
    jQuery(`${this.options.classBtn}[data-target='${this.$el}']`).on('click', this._onClickModalBtn);
    jQuery(this.$el).on('hidden.bs.modal', () => {
      jQuery(this.$el).find('iframe').html("").attr("src", "");
    });
  }

  _onClickModalBtn(event) {
    let html = jQuery(event.currentTarget).data('target');
    var allowFullscreen = jQuery(event.currentTarget).attr('data-tbayVideoFullscreen') || false;
    var dataVideo = {
      'src': jQuery(event.currentTarget).attr('data-tbaySrc'),
      'height': jQuery(event.currentTarget).attr('data-tbayHeight') || this.options.defaultH,
      'width': jQuery(event.currentTarget).attr('data-tbayWidth') || this.options.defaultW
    };
    if (allowFullscreen) dataVideo.allowfullscreen = "";
    jQuery(html).find("iframe").attr(dataVideo);
  }

}

class WooCommon {
  constructor() {
    this._greenmartFixRemove();

    this._greenmartVideoModal();
  }

  _greenmartFixRemove() {
    jQuery('.tbay-gallery-varible .woocommerce-product-gallery__trigger').remove();
  }

  _greenmartVideoModal() {
    jQuery('.tbay-video-modal').each((index, element) => {
      new ModalVideo(`#video-modal-${jQuery(element).attr("data-id")}`);
    });
  }

}

class singleProduct {
  constructor() {
    var _this = this;

    _this._initOnClickReview();

    _this._initBuyNow();

    _this._intReviewPopup();

    _this._initChangeImageVarible();

    _this._initOpenAttributeMobile();

    _this._initCloseAttributeMobile();

    _this._initCloseAttributeMobileWrapper();

    _this._initAddToCartClickMobile();

    _this._initBuyNowwClickMobile();
  }

  _initOnClickReview() {
    jQuery('body').on('click', 'a.woocommerce-review-link', function () {
      if (!jQuery('#reviews').closest('.panel').find('.tabs-title a').hasClass('collapsed')) return;
      jQuery('#reviews').closest('.panel').find('.tabs-title a.collapsed').on('click');
    });
  }

  _initBuyNow() {
    jQuery('body').on('click', '.tbay-buy-now', function (e) {
      e.preventDefault();
      let productform = jQuery(this).closest('form.cart'),
          submit_btn = productform.find('[type="submit"]'),
          buy_now = productform.find('input[name="greenmart_buy_now"]'),
          is_disabled = submit_btn.is('.disabled');
      if (!is_disabled) buy_now.val('1');
      submit_btn.trigger('click');
    });
    jQuery(document.body).on('show_variation', (event, variation, purchasable) => {
      if (purchasable) {
        jQuery(event.target).parents('form.variations_form').find('.tbay-buy-now').removeClass('disabled');
      } else {
        jQuery(event.target).parents('form.variations_form').find('.tbay-buy-now').addClass('disabled');
      }
    });
    jQuery(document.body).on('hide_variation', (event, variation, purchasable) => {
      jQuery(event.target).parents('form.variations_form').find('.tbay-buy-now').addClass('disabled');
    });
  }

  _intReviewPopup() {
    if (jQuery('#list-review-images').length === 0) return;
    var container = [];
    jQuery('#list-review-images').find('.review-item').each(function () {
      var $link = jQuery(this).find('a'),
          item = {
        src: $link.attr('href'),
        w: $link.data('width'),
        h: $link.data('height'),
        title: $link.data('caption')
      };
      container.push(item);
    });
    jQuery('#list-review-images .review-item a').off('click').on('click', function (event) {
      event.preventDefault();
      var $pswp = jQuery('.pswp')[0],
          options = {
        index: jQuery(this).parents('.review-item').index(),
        showHideOpacity: true,
        closeOnVerticalDrag: false,
        mainClass: 'pswp-review-images'
      };
      var gallery = new PhotoSwipe($pswp, PhotoSwipeUI_Default, container, options);
      gallery.init();
      event.stopPropagation();
    });
  }

  _initChangeImageVarible() {
    let form = jQuery(".information form.variations_form");
    if (form.length === 0) return;
    form.on('change', function () {
      var _this = jQuery(this);

      var attribute_label = [];

      _this.find('.variations tr').each(function () {
        if (typeof jQuery(this).find('select').val() !== "undefined") {
          attribute_label.push(jQuery(this).find('select option:selected').text());
        }
      });

      _this.parent().find('.mobile-attribute-list .value').empty().append(attribute_label.join('/ '));

      jQuery(document.body).on('show_variation', () => {
        form.find('.mobile-infor-wrapper .infor-body').empty().append(form.find('.single_variation_wrap .single_variation').html());
      });
    });
    setTimeout(function () {
      jQuery(document.body).on('reset_data', () => {
        form.find('.mobile-infor-wrapper .infor-body .woocommerce-variation-availability').empty();
        form.find('.mobile-infor-wrapper .infor-body').empty().append(form.parent().children('.price').html()).wrapInner('<p class="price"></p>');
        return;
      });
      jQuery(document.body).on('woocommerce_gallery_init_zoom', () => {
        let src_image = jQuery(".flex-control-thumbs").find('.flex-active').attr('src');
        jQuery('.mobile-infor-wrapper img').attr('src', src_image);
      });
      jQuery(document.body).on('mobile_attribute_open', () => {
        if (form.find('.single_variation_wrap .single_variation').is(':empty')) {
          form.find('.mobile-infor-wrapper .infor-body').empty().append(form.parent().children('.price').html());
        } else if (!form.find('.single_variation_wrap .single_variation .woocommerce-variation-price').is(':empty')) {
          form.find('.mobile-infor-wrapper .infor-body').empty().append(form.find('.single_variation_wrap .single_variation').html());
        } else {
          form.find('.mobile-infor-wrapper .infor-body').empty().append(form.find('.single_variation_wrap .single_variation').html());
          form.find('.mobile-infor-wrapper .infor-body .woocommerce-variation-price').empty().append(form.parent().children('.price').html()).wrapInner('<p class="price"></p>');
        }
      });
    }, 1000);
  }

  _initOpenAttributeMobile() {
    let attribute = jQuery("#attribute-open");
    if (attribute.length === 0) return;
    attribute.on('click', function () {
      jQuery(this).parent().parent().find('form.cart').addClass('open open-btn-all');
      jQuery(this).parents('#tbay-main-content').addClass('open-main-content');
    });
  }

  _initAddToCartClickMobile() {
    let addtocart = jQuery("#tbay-click-addtocart");
    if (addtocart.length === 0) return;
    addtocart.on('click', function () {
      jQuery(this).parent().parent().find('form.cart').addClass('open open-btn-addtocart');
      jQuery(this).parents('#tbay-main-content').addClass('open-main-content');
    });
  }

  _initBuyNowwClickMobile() {
    let buy_now = jQuery("#tbay-click-buy-now");
    if (buy_now.length === 0) return;
    buy_now.on('click', function () {
      jQuery(this).parent().parent().find('form.cart').addClass('open open-btn-buynow');
      jQuery(this).parents('#tbay-main-content').addClass('open-main-content');
    });
  }

  _initCloseAttributeMobile() {
    let close = jQuery("#mobile-close-infor");
    if (close.length === 0) return;
    close.on('click', function () {
      jQuery(this).parents('form.cart').removeClass('open');

      if (jQuery(this).parents('form.cart').hasClass('open-btn-all')) {
        jQuery(this).parents('form.cart').removeClass('open-btn-all');
        jQuery(this).parents('#tbay-main-content').removeClass('open-main-content');
      }

      if (jQuery(this).parents('form.cart').hasClass('open-btn-buynow')) {
        jQuery(this).parents('form.cart').removeClass('open-btn-buynow');
        jQuery(this).parents('#tbay-main-content').removeClass('open-main-content');
      }

      if (jQuery(this).parents('form.cart').hasClass('open-btn-addtocart')) {
        jQuery(this).parents('form.cart').removeClass('open-btn-addtocart');
        jQuery(this).parents('#tbay-main-content').removeClass('open-main-content');
      }
    });
  }

  _initCloseAttributeMobileWrapper() {
    let close = jQuery("#mobile-close-infor-wrapper");
    if (close.length === 0) return;
    close.on('click', function () {
      jQuery(this).parent().find('form.cart').removeClass('open');

      if (jQuery(this).parent().find('form.cart').hasClass('open-btn-all')) {
        jQuery(this).parent().find('form.cart').removeClass('open-btn-all');
        jQuery(this).parents('#tbay-main-content').removeClass('open-main-content');
      }

      if (jQuery(this).parent().find('form.cart').hasClass('open-btn-buynow')) {
        jQuery(this).parent().find('form.cart').removeClass('open-btn-buynow');
        jQuery(this).parents('#tbay-main-content').removeClass('open-main-content');
      }

      if (jQuery(this).parent().find('form.cart').hasClass('open-btn-addtocart')) {
        jQuery(this).parent().find('form.cart').removeClass('open-btn-addtocart');
        jQuery(this).parents('#tbay-main-content').removeClass('open-main-content');
      }
    });
  }

}

class DisplayMode {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    this._initModeListShopPage();

    this._initModeGridShopPage();

    jQuery(document.body).on('displayMode', () => {
      this._initModeListShopPage();

      this._initModeGridShopPage();
    });
  }

  _initModeListShopPage() {

    if (greenmart_settings.skin_elementor_fresh) {
      jQuery('#display-mode-list').each(function (index) {
        jQuery(this).click(function () {
          if (jQuery(this).hasClass('active')) return;
          var event = jQuery(this),
              data = {
            'action': LIST_POST_AJAX_SHOP_PAGE,
            'quantity_mode': greenmart_settings.quantity_mode,
            'query': greenmart_settings.posts
          };
          jQuery.ajax({
            url: greenmart_settings.ajaxurl,
            data: data,
            type: 'POST',
            beforeSend: function (xhr) {
              event.closest('#tbay-main-content').find('div.products').addClass('load-ajax');
            },
            success: function (data) {
              if (data) {
                event.parent().children().removeClass('active');
                event.addClass('active');
                event.closest('#tbay-main-content').find('div.products > div').html(data);
                event.closest('#tbay-main-content').find('div.products').fadeOut(0, function () {
                  jQuery(this).addClass('products-list').removeClass('products-grid').fadeIn(300);
                });

                if (typeof wc_add_to_cart_variation_params !== 'undefined') {
                  jQuery('.variations_form').each(function () {
                    jQuery(this).wc_variation_form().find('.variations select:eq(0)').trigger('change');
                  });
                }

                jQuery(document.body).trigger('tbay_display_mode');
                event.closest('#tbay-main-content').find('div.products').removeClass('load-ajax');
                Cookies.set('greenmart_display_mode', 'list', {
                  expires: 0.1,
                  path: '/'
                });
              }
            }
          });
          return false;
        });
      });
    } else {
      jQuery('#display-mode-list').each(function (index) {
        jQuery(this).on('click', function () {
          event.preventDefault();
          jQuery(event.currentTarget).addClass('active').prev().removeClass('active');
          Cookies.set('display_mode', 'list', {
            expires: 0.1,
            path: '/'
          });

          if (!jQuery(event.currentTarget).parents('.tbay-filter').parent().find('div.products').hasClass('products-list')) {
            jQuery(event.currentTarget).parents('.tbay-filter').parent().find('div.products').fadeOut(0, function () {
              jQuery(this).addClass('products-list').removeClass('products-grid').fadeIn(300);
            });
            jQuery(event.currentTarget).parents('.tbay-filter').parent().find('div.products').find('.product-block').removeClass('grid').fadeIn(300).addClass('list');
          }

          return false;
        });
      });
    }
  }

  _initModeGridShopPage() {

    if (greenmart_settings.skin_elementor_fresh) {
      jQuery('#display-mode-grid').each(function (index) {
        jQuery(this).click(function () {
          if (jQuery(this).hasClass('active')) return;
          var event = jQuery(this),
              data = {
            'action': GRID_POST_AJAX_SHOP_PAGE,
            'quantity_mode': greenmart_settings.quantity_mode,
            'query': greenmart_settings.posts
          };
          event.closest('#tbay-main-content').find('div.products');
          jQuery.ajax({
            url: greenmart_settings.ajaxurl,
            data: data,
            type: 'POST',
            beforeSend: function (xhr) {
              event.closest('#tbay-main-content').find('div.products').addClass('load-ajax');
            },
            success: function (data) {
              if (data) {
                event.parent().children().removeClass('active');
                event.addClass('active');
                event.closest('#tbay-main-content').find('div.products > div').html(data);
                let products = event.closest('#tbay-main-content').find('div.products');
                products.fadeOut(0, function () {
                  jQuery(this).addClass('products-grid').removeClass('products-list').fadeIn(300);
                });

                if (typeof wc_add_to_cart_variation_params !== 'undefined') {
                  jQuery('.variations_form').each(function () {
                    jQuery(this).wc_variation_form().find('.variations select:eq(0)').trigger('change');
                  });
                }

                jQuery(document.body).trigger('tbay_display_mode');
                event.closest('#tbay-main-content').find('div.products').removeClass('load-ajax');
                Cookies.set('greenmart_display_mode', 'grid', {
                  expires: 0.1,
                  path: '/'
                });
              }
            }
          });
          return false;
        });
      });
    } else {
      jQuery('#display-mode-grid').each(function (index) {
        jQuery(this).on('click', function () {
          event.preventDefault();
          jQuery(event.currentTarget).addClass('active').next().removeClass('active');
          Cookies.set('display_mode', 'grid', {
            expires: 0.1,
            path: '/'
          });

          if (!jQuery(event.currentTarget).parents('.tbay-filter').parent().find('div.products').hasClass('products-grid')) {
            jQuery(event.currentTarget).parents('.tbay-filter').parent().find('div.products').fadeOut(0, function () {
              jQuery(this).addClass('products-grid').removeClass('products-list').fadeIn(300);
            });
            jQuery(event.currentTarget).parents('.tbay-filter').parent().find('div.products').find('.product-block').removeClass('list').fadeIn(300).addClass('grid');
          }

          return false;
        });
      });
    }
  }

  _getDisplayMode() {
    if (greenmart_settings.display_mode == 'list') {
      Cookies.set('display_mode', 'list', {
        expires: 0.1,
        path: '/'
      });
    } else if (greenmart_settings.display_mode == 'grid') {
      Cookies.set('display_mode', 'grid', {
        expires: 0.1,
        path: '/'
      });
    }

    if (Cookies.get('display_mode') != undefined && Cookies.get('display_mode') !== "") {
      if (Cookies.get('display_mode') == 'grid') {
        let mode = jQuery('.display-mode').find("button.grid");
        mode.parent().children().removeClass('active');
        mode.addClass('active');
        jQuery('.tbay-filter').parent().find('.products').addClass('products-' + Cookies.get('display_mode'));
      }

      if (Cookies.get('display_mode') == 'list') {
        let mode = jQuery('.display-mode').find("button.list");
        mode.parent().children().removeClass('active');
        mode.addClass('active');
        jQuery('.tbay-filter').parent().find('.products').addClass('products-' + Cookies.get('display_mode'));
      }
    }
  }

}

class TbCheckout {
  constructor() {
    this._initEventCheckoutAjaxQuantity();
  }

  _initEventCheckoutAjaxQuantity() {
    var timeout;
    jQuery("body").on("change input", ".woocommerce-checkout-review-order-table .quantity .qty", function () {
      var urlAjax = greenmart_settings.wc_ajax_url.toString().replace("%%endpoint%%", "greenmart_quantity_mini_cart"),
          input = jQuery(this),
          hash = jQuery(input).attr("name").replace(/cart\[([\w]+)\]\[qty\]/g, "$1"),
          max = parseFloat(jQuery(input).attr("max"));

      if (!max) {
        max = false;
      }

      clearTimeout(timeout);
      var quantity = parseFloat(jQuery(input).val());

      if (max > 0 && quantity > max) {
        jQuery(input).val(max);
        quantity = max;
      }

      timeout = setTimeout(function () {
        jQuery.ajax({
          url: urlAjax,
          type: "POST",
          dataType: "json",
          cache: false,
          data: {
            hash: hash,
            quantity: quantity,
            security: greenmart_settings.wp_minicartquantitynonce
          },
          beforeSend: function () {
            jQuery('form.checkout').trigger('update');
          },
          success: function (data) {
            if (data && data.fragments) {
              jQuery.each(data.fragments, function (key, value) {
                if (jQuery(key).length) {
                  jQuery(key).replaceWith(value);
                }
              });

              if (typeof $supports_html5_storage !== "undefined" && $supports_html5_storage) {
                sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(data.fragments));
                set_cart_hash(data.cart_hash);

                if (data.cart_hash) {
                  set_cart_creation_timestamp();
                }
              }

              jQuery('form.checkout').trigger('update');
            }
          }
        });
      }, 300);
    });
  }

}

class ProductTabs {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    this._initProductTabsAjax();

    this._initProductTabs();
  }

  _initProductTabs() {
    jQuery(".tbay-product-tabs-ajax").each(function (index, element) {
      var $this = jQuery(element);
      if ($this.hasClass("ajax-active") || $this.data("isInitialized")) return;
      $this.data("isInitialized", true);
      $this.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        jQuery(document.body).trigger("tbay_carousel_slick");
      });
    });
  }

  _initProductTabsAjax() {
    var process = false;
    jQuery('.tbay-product-tabs-ajax.ajax-active').each(function (index, element) {
      var $this = jQuery(element);
      $this.find('.product-tabs-title li a').off('click').on('click', function (e) {
        e.preventDefault();
        var $this = jQuery(this),
            atts = $this.parent().parent().data('atts'),
            value = $this.data('value'),
            id = $this.attr('href');

        if (process || jQuery(id).hasClass('active-content')) {
          return;
        }

        process = true;
        jQuery.ajax({
          url: greenmart_settings.ajaxurl,
          data: {
            atts: atts,
            value: value,
            action: 'greenmart_get_products_tab_shortcode'
          },
          dataType: 'json',
          method: 'POST',
          beforeSend: function (xhr) {
            jQuery(id).parent().addClass('load-ajax');
          },
          success: function (data) {
            jQuery(id).html(data.html);
            jQuery(id).parent().find('.current').removeClass('current');
            jQuery(id).parent().removeClass('load-ajax');
            jQuery(id).addClass('active-content');
            jQuery(id).addClass('current');
            jQuery(document.body).trigger('tbay_carousel_slick');
            jQuery(document.body).trigger('tbay_ajax_tabs_products');
          },
          error: function () {
            console.log('ajax error');
          },
          complete: function () {
            process = false;
          }
        });
      });
    });
  }

}

class ProductCategoriesTabs {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    this._initProductCategoriesTabsAjax();

    this._initProductCategoriesTabs();
  }

  _initProductCategoriesTabs() {
    jQuery(".tbay-product-categories-tabs-ajax").each(function (index, element) {
      var $this = jQuery(element);
      if ($this.hasClass("ajax-active") || $this.data("isInitialized")) return;
      $this.data("isInitialized", true);
      $this.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        jQuery(document.body).trigger("tbay_carousel_slick");
      });
    });
  }

  _initProductCategoriesTabsAjax() {
    var process = false;
    jQuery('.tbay-product-categories-tabs-ajax.ajax-active').each(function (index, element) {
      var $this = jQuery(element);
      $this.find('.product-categories-tabs-title li a').off('click').on('click', function (e) {
        e.preventDefault();
        var $this = jQuery(this),
            atts = $this.parent().parent().data('atts'),
            value = $this.data('value'),
            id = $this.attr('href');

        if (process || jQuery(id).hasClass('active-content')) {
          return;
        }

        process = true;
        jQuery.ajax({
          url: greenmart_settings.ajaxurl,
          data: {
            atts: atts,
            value: value,
            action: 'greenmart_get_products_categories_tab_shortcode'
          },
          dataType: 'json',
          method: 'POST',
          beforeSend: function (xhr) {
            jQuery(id).parent().addClass('load-ajax');
          },
          success: function (data) {
            if (jQuery(id).find('.tab-banner').length > 0) {
              jQuery(id).append(data.html);
            } else {
              jQuery(id).prepend(data.html);
            }

            jQuery(id).parent().find('.current').removeClass('current');
            jQuery(id).parent().removeClass('load-ajax');
            jQuery(id).addClass('active-content');
            jQuery(id).addClass('current');
            jQuery(document.body).trigger('tbay_carousel_slick');
            jQuery(document.body).trigger('tbay_ajax_tabs_products');
          },
          error: function () {
            console.log('ajax error');
          },
          complete: function () {
            process = false;
          }
        });
      });
    });
  }

}

jQuery(document).ready(() => {
  jQuery(document.body).trigger('tawcvs_initialized');
  var product_item = new ProductItem();
  product_item.initOnChangeQuantity();

  product_item._initQuantityMode();

  new AjaxCart(), new singleProduct(), new SideBar(), new WishList(), new Cart(), new WooCommon(), new ModalVideo("#productvideo"), new DisplayMode(), new TbCheckout(), new ProductTabs(), new ProductCategoriesTabs();
});
setTimeout(function () {
  jQuery(document.body).on('wc_fragments_refreshed wc_fragments_loaded removed_from_cart updated_checkout', function () {
    new ProductItem().initOnChangeQuantity(() => {});
  });
}, 30);

var AjaxProductTabs = function ($scope, $) {
  new ProductTabs(), new ProductCategoriesTabs();
};

jQuery(window).on('elementor/frontend/init', function () {
  if (typeof greenmart_settings !== "undefined" && elementorFrontend.isEditMode() && Array.isArray(greenmart_settings.elements_ready.ajax_tabs)) {
    jQuery.each(greenmart_settings.elements_ready.ajax_tabs, function (index, value) {
      elementorFrontend.hooks.addAction('frontend/element_ready/tbay-' + value + '.default', AjaxProductTabs);
    });
  }
});
