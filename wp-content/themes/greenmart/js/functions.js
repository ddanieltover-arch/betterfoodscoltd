'use strict';

class StickyHeader {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    let _this = this;

    if (greenmart_settings.skin_elementor) {
      this.$tbayHeader = jQuery('.tbay_header-template');
      this.$tbayHeaderMain = jQuery('.tbay_header-template .header-main');

      if (this.$tbayHeader.hasClass('main-sticky-header') && this.$tbayHeaderMain.length > 0) {
        _this._initStickyHeader();
      }

      let sticky_header = jQuery('.element-sticky-header');

      if (sticky_header.length > 0) {
        _this._initELementStickyheader(sticky_header);
      }
    } else {
      _this._initStickyHeaderWPBakery();
    }
  }

  _initStickyHeaderWPBakery() {
    var tbay_header = jQuery('#tbay-header');

    if (tbay_header.hasClass('main-sticky-header')) {
      var tbay_width = jQuery(window).width();
      var header_height = tbay_header.height();
      jQuery('#tbay-header.sticky-header1').height();

      if (greenmart_settings.active_theme == 'restaurant') {
        header_height = 0;
      }

      jQuery(window).scroll(function () {
        if (tbay_width >= 1024) {
          var NextScroll = jQuery(this).scrollTop();

          if (NextScroll > header_height) {
            if (tbay_header.hasClass('sticky-header1')) return;
            tbay_header.addClass('sticky-header1');
            tbay_header.parent().css('margin-top', header_height);
            tbay_header.addClass('sticky-header1').css("top", jQuery('#wpadminbar').outerHeight());
          } else {
            tbay_header.removeClass('sticky-header1');
            tbay_header.parent().css('margin-top', 0);
          }
        }
      });
    }
  }

  _initStickyHeader() {
    var _this = this;

    var tbay_width = jQuery(window).width();

    var header_height = _this.$tbayHeader.outerHeight();

    var headerMain_height = _this.$tbayHeaderMain.outerHeight();

    var admin_height = jQuery('#wpadminbar').length > 0 ? jQuery('#wpadminbar').outerHeight() : 0;

    var sticky = _this.$tbayHeaderMain.offset().top;

    if (tbay_width >= 1024) {
      if (sticky == 0 || sticky == admin_height) {
        if (_this.$tbayHeader.hasClass('sticky-header')) return;

        _this._stickyHeaderOnDesktop(headerMain_height, sticky, admin_height);

        _this.$tbayHeaderMain.addClass('sticky-1');

        jQuery(window).scroll(function () {
          if (jQuery(this).scrollTop() > header_height) {
            _this.$tbayHeaderMain.addClass('sticky-box');
          } else {
            _this.$tbayHeaderMain.removeClass('sticky-box');
          }
        });
      } else {
        jQuery(window).scroll(function () {
          if (!_this.$tbayHeader.hasClass('main-sticky-header')) return;

          if (jQuery(this).scrollTop() > sticky - admin_height) {
            if (_this.$tbayHeader.hasClass('sticky-header')) return;

            _this._stickyHeaderOnDesktop(headerMain_height, sticky, admin_height);
          } else {
            _this.$tbayHeaderMain.css("top", 0).css("position", "relative").removeClass('sticky-header').parent().css('padding-top', 0);

            _this.$tbayHeaderMain.prev().css('margin-bottom', 0);
          }
        });
      }
    }
  }

  _stickyHeaderOnDesktop(headerMain_height, sticky, admin_height) {
    this.$tbayHeaderMain.addClass('sticky-header').css("top", admin_height).css("position", "fixed");

    if (sticky == 0 || sticky == admin_height) {
      this.$tbayHeaderMain.parent().css('padding-top', headerMain_height);
    } else {
      this.$tbayHeaderMain.prev().css('margin-bottom', headerMain_height);
    }
  }

  _initELementStickyheader(elements) {
    var el = elements.first();

    let _this = this;

    var scroll = false,
        sum = 0,
        prev_sum = 0;
    if (el.parents('.tbay_header-template').length === 0) return;
    var adminbar = jQuery('#wpadminbar').length > 0 ? jQuery('#wpadminbar').outerHeight() : 0,
        sticky_load = el.offset().top - jQuery(window).scrollTop() - adminbar,
        sticky = sticky_load;
    el.prevAll().each(function () {
      prev_sum += jQuery(this).outerHeight();
    });
    elements.each(function () {
      if (jQuery(this).parents('.element-sticky-header').length > 0) return;
      sum += jQuery(this).outerHeight();
    });

    _this._initELementStickyheaderContent(sticky_load, sticky, sum, prev_sum, elements, el, adminbar, scroll);

    jQuery(window).scroll(function () {
      scroll = true;
      if (jQuery(window).scrollTop() === 0) sticky = 0;

      _this._initELementStickyheaderContent(sticky_load, sticky, sum, prev_sum, elements, el, adminbar, scroll);
    });
  }

  _initELementStickyheaderContent(sticky_load, sticky, sum, prev_sum, elements, el, adminbar, scroll) {
    let sum_has = el.prev().length > 0 ? prev_sum : 1;

    if (jQuery(window).scrollTop() >= sum_has) {
      el.parent().addClass('has-header-sticky');
    } else {
      el.parent().removeClass('has-header-sticky');
    }

    if (jQuery(window).scrollTop() < prev_sum && scroll || jQuery(window).scrollTop() === 0 && scroll) {
      if (el.parent().children().first().hasClass('element-sticky-header')) return;
      el.css('top', '');

      if (sticky === sticky_load || sticky === 0) {
        elements.last().next().css('padding-top', '');
      } else {
        el.prev().css('margin-bottom', '');
      }

      el.parent().css('padding-top', '');
      elements.last().removeClass('last-sticky');
      elements.each(function () {
        jQuery(this).removeClass("sticky");

        if (jQuery(this).prev('.element-sticky-header').length > 0) {
          jQuery(this).css('top', '');
        }
      });
    } else {
      if (jQuery(window).scrollTop() < prev_sum && !scroll) return;
      elements.last().addClass('last-sticky');
      elements.each(function () {
        if (jQuery(this).parents('.element-sticky-header').length > 0) return;
        jQuery(this).addClass("sticky");

        if (jQuery(this).prevAll('.element-sticky-header').length > 0) {
          let total = 0;
          jQuery(this).prevAll('.element-sticky-header').each(function () {
            total += jQuery(this).outerHeight();
          });
          jQuery(this).css('top', total + adminbar);
        }
      });
      el.css('top', adminbar);

      if (sticky === sticky_load || sticky === 0) {
        el.addClass("sticky");
        el.parent().css('padding-top', sum);
      } else {
        el.prev().css('margin-bottom', sum);
      }
    }
  }

}

const DEVICE = {
  ANDROID: /Android/i,
  BLACK_BERRY: /BlackBerry/i,
  IOS: /iPhone|iPad|iPod/i,
  OPERA: /Opera Mini/i,
  WINDOW: /IEMobile/i,
  ANY: /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i
};

let isDevice = device => {
  navigator.userAgent.match(device);
};

class Mobile {
  constructor() {
    this._removeActiveMobileMenu();

    this._topBarDevice();

    this._fixVCAnimation();

    this._categoryMenu();

    this._mobileMenu();

    this._searchMobileShow();

    jQuery(window).scroll(() => {
      this._topBarDevice();

      this._fixVCAnimation();
    });
  }

  _removeActiveMobileMenu() {
    let $win = jQuery(window);
    let $box = jQuery('#tbay-mobile-menu,.topbar-device-mobile .active-mobile,#tbay-header.header-v4 .header-main .tbay-mainmenu .btn-offcanvas,#tbay-header.header-v5 .header-main .tbay-mainmenu .btn-offcanvas,.topbar-mobile .btn.btn-offcanvas,.wrapper-container .tbay-offcanvas');
    $win.on("click.Bst,click touchstart tap", function (event) {
      if ($box.has(event.target).length == 0 && !$box.is(event.target)) {
        jQuery('.wrapper-container').removeClass('active');
        jQuery('#tbay-mobile-menu').removeClass('active');
      }
    });
  }

  _topBarDevice() {
    if (!greenmart_settings.mobile) return;
    var scroll = jQuery(window).scrollTop();
    var objectSelect = jQuery(".topbar-device-mobile").height();
    var scrollmobile = jQuery(window).scrollTop();
    jQuery(".topbar-device-mobile").toggleClass("active", scroll <= objectSelect);
    jQuery("#tbay-mobile-menu, #tbay-mobile-menu-navbar").toggleClass("offsetop", scrollmobile == 0);
    var objectSelect_adminbar = jQuery("#wpadminbar");

    if (objectSelect_adminbar.length > 0) {
      jQuery("body").toggleClass("active-admin-bar", scrollmobile == 0);
    }
  }

  _fixVCAnimation() {
    if (jQuery(".wpb_animate_when_almost_visible").length > 0 && !jQuery(".wpb_animate_when_almost_visible").hasClass('wpb_start_animation')) {
      let animate_height = jQuery(window).height();
      let wpb_not_animation_element = jQuery(".wpb_animate_when_almost_visible:not(.wpb_start_animation)");
      var next_scroll = wpb_not_animation_element.offset().top - jQuery(window).scrollTop();

      if (isDevice(DEVICE.ANY)) {
        wpb_not_animation_element.removeClass('wpb_animate_when_almost_visible');
      } else if (next_scroll < animate_height - 50) {
        wpb_not_animation_element.addClass("wpb_start_animation animated");
      }
    }
  }

  _categoryMenu() {
    jQuery(".category-inside .category-inside-title").on("click", function () {
      jQuery(this).parents('.category-inside').find(".category-inside-content").slideToggle("fast");
      jQuery(this).parents('.category-inside').toggleClass("open");
    });
  }

  _mobileMenu() {
    jQuery('[data-toggle="offcanvas"], .btn-offcanvas').on('click', function () {
      jQuery('#wrapper-container').toggleClass('active');
      jQuery('#tbay-mobile-menu').toggleClass('active');
    });
    jQuery("#main-mobile-menu .caret").on('click', function (event) {
      jQuery("#main-mobile-menu .dropdown").removeClass('open');
      jQuery(event.target).parent().addClass('open');
    });
  }

  _searchMobileShow() {
    jQuery(document).off('click', '.topbar-device-mobile .search-device .show-search').on('click', '.topbar-device-mobile .search-device .show-search', function (e) {
      e.preventDefault();
      jQuery(e.target).parents('.search-device').find('.tbay-search-form').slideToggle(0, function () {});
      jQuery(e.target).parents('.search-device').find(".tbay-search").focus();
    });
    jQuery(document).off('click', '.topbar-mobile-right .search-device .show-search').on('click', '.topbar-mobile-right .search-device .show-search', function (e) {
      e.preventDefault();
      jQuery(e.target).parents('.search-device').find('.tbay-search-form').slideToggle(0, function () {});
      jQuery(e.target).parents('.search-device').find(".tbay-search").focus();
    });
  }

}

class AccountMenu {
  constructor() {
    this._slideToggleAccountMenu(".tbay-login");

    this._slideToggleAccountMenu(".topbar-mobile");

    this._clickNotMyAccountMenu();

    this._accountButton();
  }

  _clickNotMyAccountMenu() {
    var $win_my_account = jQuery(window);
    var $box_my_account = jQuery('.tbay-login .dropdown .account-menu,.topbar-mobile .dropdown .account-menu,.tbay-login .dropdown .account-button,.topbar-mobile .dropdown .account-button');
    $win_my_account.on("click.Bst", function (event) {
      if ($box_my_account.has(event.target).length == 0 && !$box_my_account.is(event.target)) {
        jQuery(".tbay-login .dropdown .account-menu").slideUp(500);
        jQuery(".topbar-mobile .dropdown .account-menu").slideUp(500);
      }
    });
  }

  _slideToggleAccountMenu(parentSelector) {
    jQuery(parentSelector).find(".dropdown .account-button").on('click', function () {
      jQuery(parentSelector).find(".dropdown .account-menu").slideToggle(500);
    });
  }

  _accountButton() {
    jQuery(".tbay-login .dropdown .account-button").on("click", function () {
      jQuery(".tbay-login .dropdown .account-menu").slideToggle(500, function () {});
    });
    jQuery(".topbar-mobile .dropdown .account-button").on("click", function () {
      jQuery(".topbar-mobile .dropdown .account-menu").slideToggle(500, function () {});
    });
  }

}

class BackToTop {
  constructor() {
    this._init();
  }

  _init() {
    jQuery(window).scroll(function () {
      var isActive = jQuery(this).scrollTop() > 400;
      jQuery('.tbay-to-top').toggleClass('active', isActive);
      jQuery('.tbay-category-fixed').toggleClass('active', isActive);
    });
    jQuery('#back-to-top').on('click', this._onClickBackToTop);
  }

  _onClickBackToTop() {
    jQuery('html, body').animate({
      scrollTop: '0px'
    }, 800);
  }

}

class CanvasMenu {
  constructor() {
    this._initCanvasMenu();
  }

  _initCanvasMenu() {
    let menu_canvas = jQuery(".element-menu-canvas");
    if (menu_canvas.length === 0) return;
    menu_canvas.each(function () {
      jQuery(this).find('.canvas-menu-btn-wrapper > a').on('click', function (event) {
        jQuery(this).parent().parent().addClass('open');
        event.stopPropagation();
      });
    });
    jQuery(document).on('click', '.canvas-overlay-wrapper', function (event) {
      jQuery(this).parent().removeClass('open');
      event.stopPropagation();
    });
    jQuery(document).on('click', '.toggle-canvas-close', function (event) {
      jQuery(this).parents('.element-menu-canvas').removeClass('open');
      event.stopPropagation();
    });
  }

}

(function ($) {
  $.extend($.fn, {
    swapClass: function (c1, c2) {
      var c1Elements = this.filter('.' + c1);
      this.filter('.' + c2).removeClass(c2).addClass(c1);
      c1Elements.removeClass(c1).addClass(c2);
      return this;
    },
    replaceClass: function (c1, c2) {
      return this.filter('.' + c1).removeClass(c1).addClass(c2).end();
    },
    hoverClass: function (className) {
      className = className || "hover";
      return this.on("hover", function () {
        $(this).addClass(className);
      }, function () {
        $(this).removeClass(className);
      });
    },
    heightToggle: function (animated, callback) {
      animated ? this.animate({
        height: "toggle"
      }, animated, callback) : this.each(function () {
        jQuery(this)[jQuery(this).is(":hidden") ? "show" : "hide"]();
        if (callback) callback.apply(this, arguments);
      });
    },
    heightHide: function (animated, callback) {
      if (animated) {
        this.animate({
          height: "hide"
        }, animated, callback);
      } else {
        this.hide();
        if (callback) this.each(callback);
      }
    },
    prepareBranches: function (settings) {
      if (!settings.prerendered) {
        this.filter(":last-child:not(ul)").addClass(CLASSES.last);
      }

      return this.filter(":has(>ul),:has(>.dropdown-menu)");
    },
    applyClasses: function (settings, toggler) {
      this.filter(":has(>ul):not(:has(>a))").find(">span").on("click", function (event) {
        toggler.apply($(this).next());
      }).add($("a", this)).hoverClass();

      if (!settings.prerendered) {
        this.filter(":has(>ul:hidden),:has(>.dropdown-menu:hidden)").addClass(CLASSES.expandable).replaceClass(CLASSES.last, CLASSES.lastExpandable);
        this.not(":has(>ul:hidden),:has(>.dropdown-menu:hidden)").addClass(CLASSES.collapsable).replaceClass(CLASSES.last, CLASSES.lastCollapsable);
        this.prepend("<div class=\"" + CLASSES.hitarea + "\"/>").find("div." + CLASSES.hitarea).each(function () {
          var classes = "";
          $.each($(this).parent().attr("class").split(" "), function () {
            classes += this + "-hitarea ";
          });
          $(this).addClass(classes);
        });
      }

      this.find("div." + CLASSES.hitarea).on("click", toggler);
    },
    treeview: function (settings) {
      settings = $.extend({
        cookieId: "treeview"
      }, settings);

      if (settings.add) {
        return this.trigger("add", [settings.add]);
      }

      if (settings.toggle) {
        var callback = settings.toggle;

        settings.toggle = function () {
          return callback.apply($(this).parent()[0], arguments);
        };
      }

      function treeController(tree, control) {
        function handler(filter) {
          return function () {
            toggler.apply($("div." + CLASSES.hitarea, tree).filter(function () {
              return filter ? $(this).parent("." + filter).length : true;
            }));
            return false;
          };
        }

        $("a:eq(0)", control).on("click", handler(CLASSES.collapsable));
        $("a:eq(1)", control).on("click", handler(CLASSES.expandable));
        $("a:eq(2)", control).on("click", handler());
      }

      function toggler() {
        $(this).parent().find(">.hitarea").swapClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea).swapClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea).end().swapClass(CLASSES.collapsable, CLASSES.expandable).swapClass(CLASSES.lastCollapsable, CLASSES.lastExpandable).find(">ul,>.dropdown-menu").heightToggle(settings.animated, settings.toggle);

        if (settings.unique) {
          $(this).parent().siblings().find(">.hitarea").replaceClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea).replaceClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea).end().replaceClass(CLASSES.collapsable, CLASSES.expandable).replaceClass(CLASSES.lastCollapsable, CLASSES.lastExpandable).find(">ul,>.dropdown-menu").heightHide(settings.animated, settings.toggle);
        }
      }

      function serialize() {

        var data = [];
        branches.each(function (i, e) {
          data[i] = $(e).is(":has(>ul:visible)") ? 1 : 0;
        });
        $.cookie(settings.cookieId, data.join(""));
      }

      function deserialize() {
        var stored = $.cookie(settings.cookieId);

        if (stored) {
          var data = stored.split("");
          branches.each(function (i, e) {
            $(e).find(">ul")[parseInt(data[i]) ? "show" : "hide"]();
          });
        }
      }

      this.addClass("treeview");
      var branches = this.find("li").prepareBranches(settings);

      switch (settings.persist) {
        case "cookie":
          var toggleCallback = settings.toggle;

          settings.toggle = function () {
            serialize();

            if (toggleCallback) {
              toggleCallback.apply(this, arguments);
            }
          };

          deserialize();
          break;

        case "location":
          var current = this.find("a").filter(function () {
            return this.href.toLowerCase() == location.href.toLowerCase();
          });

          if (current.length) {
            current.addClass("selected").parents("ul, li").add(current.next()).show();
          }

          break;
      }

      branches.applyClasses(settings, toggler);

      if (settings.control) {
        treeController(this, settings.control);
        $(settings.control).show();
      }

      return this.bind("add", function (event, branches) {
        $(branches).prev().removeClass(CLASSES.last).removeClass(CLASSES.lastCollapsable).removeClass(CLASSES.lastExpandable).find(">.hitarea").removeClass(CLASSES.lastCollapsableHitarea).removeClass(CLASSES.lastExpandableHitarea);
        $(branches).find("li").andSelf().prepareBranches(settings).applyClasses(settings, toggler);
      });
    }
  });
  var CLASSES = $.fn.treeview.classes = {
    open: "open1",
    closed: "closed",
    expandable: "expandable",
    expandableHitarea: "expandable-hitarea",
    lastExpandableHitarea: "lastExpandable-hitarea",
    collapsable: "collapsable",
    collapsableHitarea: "collapsable-hitarea",
    lastCollapsableHitarea: "lastCollapsable-hitarea",
    lastCollapsable: "lastCollapsable",
    lastExpandable: "lastExpandable",
    last: "last",
    hitarea: "hitarea"
  };
  $.fn.Treeview = $.fn.treeview;
})(jQuery);

class FuncCommon {
  constructor() {
    var _this = this;

    _this._limitedClose();

    _this._fancyboxVideo();

    _this._progressAnimation();

    _this._createWrapStart();

    jQuery('.mod-heading .widget-title > span').wrapStart();

    _this._greenmartResizeMegamenu();

    jQuery(window).on("resize", () => {
      _this._greenmartResizeMegamenu();

      _this._fixFull();
    });
    setTimeout(function () {
      jQuery(document.body).on('tbay_load_html_click', () => {
        _this._greenmartResizeMegamenu();
      });
    }, 2000);

    _this._fixFull();

    _this._intTooltip();

    _this._categoryV6Inside();

    _this._fixSliderHome3();

    _this._toCategoryFixed();

    _this._homeBanner();

    _this._toggleDropdown();

    if (greenmart_settings.skin_elementor_fresh) {
      _this._initHeaderCoverbgFresh();
    }
  }

  _limitedClose() {
    if (jQuery("#tb-limited-notification").length > 0) {
      jQuery('.tb-limited-cover').on("click", function () {
        jQuery("#tb-limited-notification").toast("hide");
      });
    }
  }

  _fancyboxVideo() {
    if (typeof jQuery.fn.fancybox === "undefined") return;
    jQuery(".fancybox-video").fancybox({
      maxWidth: 800,
      maxHeight: 600,
      fitToView: false,
      width: '70%',
      height: '70%',
      autoSize: false,
      closeClick: false,
      openEffect: 'none',
      closeEffect: 'none'
    });
    jQuery(".fancybox").fancybox();
  }

  _createWrapStart() {
    jQuery.fn.wrapStart = function () {
      return this.each(function () {
        var $this = jQuery(this);
        var node = $this.contents().filter(function () {
          return this.nodeType == 3;
        }).first(),
            text = node.text().trim(),
            first = text.split(' ', 1).join(" ");
        if (!node.length) return;
        node[0].nodeValue = text.slice(first.length);
        node.before('<b>' + first + '</b>');
      });
    };
  }

  _initHeaderCoverbgFresh() {
    let menu = jQuery('.tbay-horizontal .navbar-nav > li,.tbay-horizontal-default .navbar-nav > li, .tbay_header-template .product-recently-viewed-header'),
        search = jQuery('.tbay-search-form .tbay-search'),
        btn_category = jQuery('.category-inside .category-inside-title'),
        cart_click = jQuery('.cart-popup');
    menu.mouseenter(function () {
      if (jQuery(this).parents('#tbay-header').length === 0) return;
      if (jQuery(this).children('.dropdown-menu, ul, .content-view').length == 0) return;
      jQuery('.tbay_header-template').addClass('nav-cover-active-1');
    }).mouseleave(function () {
      if (jQuery(this).closest('.dropdown-menu').length) return;
      jQuery('.tbay_header-template').removeClass('nav-cover-active-1');
    });
    search.focusin(function () {
      if (jQuery(this).closest('.dropdown-menu').length) return;
      if (search.parents('.sidebar-canvas-search').length > 0 || jQuery(this).closest('.tbay_header-template').length === 0) return;
      jQuery('.tbay_header-template').addClass('nav-cover-active-2');
    }).focusout(function () {
      jQuery('.tbay_header-template').removeClass('nav-cover-active-2');
    });
    cart_click.on('shown.bs.dropdown', function (event) {
      jQuery(event.target).closest('.tbay_header-template').addClass('nav-cover-active-3');
    }).on('hidden.bs.dropdown', function (event) {
      jQuery(event.target).closest('.tbay_header-template').removeClass('nav-cover-active-3');
    });

    if (btn_category.parents('.tbay_header-template')) {
      jQuery(document.body).on('tbay_category_inside_open', () => {
        jQuery('.tbay_header-template').addClass('nav-cover-active-4');
      });
      jQuery(document.body).on('tbay_category_inside_close', () => {
        jQuery('.tbay_header-template').removeClass('nav-cover-active-4');
      });
    }
  }

  _progressAnimation() {
    jQuery("[data-progress-animation]").each(function () {
      var $this = jQuery(this);
      $this.appear(function () {
        var delay = $this.attr("data-appear-animation-delay") ? $this.attr("data-appear-animation-delay") : 1;
        if (delay > 1) $this.css("animation-delay", delay + "ms");
        setTimeout(function () {
          $this.animate({
            width: $this.attr("data-progress-animation")
          }, 800);
        }, delay);
      }, {
        accX: 0,
        accY: -50
      });
    });
  }

  _greenmartResizeMegamenu() {
    var window_size = jQuery('body').innerWidth();

    if (window_size > 767) {
      if (jQuery('.tbay_custom_menu').length > 0) {
        if (jQuery('.tbay_custom_menu').hasClass('tbay-vertical-menu')) {
          var full_width = parseInt(jQuery('#main-container.container').innerWidth());
          var menu_width = parseInt(jQuery('.tbay-vertical-menu').innerWidth());
          var w = full_width - menu_width;
          jQuery('.tbay-vertical-menu').find('.active-mega-menu').each(function () {
            jQuery(this).children('.dropdown-menu').css('max-width', w + 'px');
            jQuery(this).children('.dropdown-menu').css('width', full_width - 30 + 'px');
          });
        }
      }
    } else {
      if (jQuery('.tbay_custom_menu').length > 0) {
        if (jQuery('.tbay_custom_menu').hasClass('tbay-vertical-menu')) {
          jQuery(".tbay-vertical-menu").each(function () {
            if (jQuery(this).hasClass('treeview')) return;
            jQuery(this).treeview({
              animated: 300,
              collapsed: true,
              unique: true,
              persist: "location"
            });
          });
        }
      }
    }
  }

  _fixFull() {
    var mainwidth = jQuery('#tbay-main-content').width();
    var marginleft = (jQuery('#tbay-main-content').width() - jQuery('#tbay-main-content >.container').width()) / 2;
    jQuery('.tb-full').css('width', mainwidth);
    jQuery('.tb-full').css('max-width', mainwidth);

    if (jQuery('body').hasClass("rtl")) {
      jQuery('.tb-full').css('margin-right', -marginleft);
    } else {
      jQuery('.tb-full').css('margin-left', -marginleft);
    }

    jQuery('.tb-full >.vc_fluid').css('padding', 0);
  }

  _categoryV6Inside() {
    jQuery(".category-v6 .category-inside-title").off().on("click", function () {
      jQuery(this).parents('.category-v6').find(".menu-category-menu-container").slideToggle("fast");
      jQuery(this).parents('.category-v6').toggleClass("open");
    });
  }

  _removeAnimateVisible() {
    let $with = jQuery(window).width();

    if ($with < 1024) {
      jQuery(".wpb_animate_when_almost_visible:not(.wpb_start_animation)").each(function () {
        jQuery(this).removeClass("wpb_animate_when_almost_visible");
      });
    }
  }

  _fixSliderHome3() {
    let $with = jQuery(window).width();
    let $main_container = jQuery(".container").width();
    let $main_container_full = jQuery(".container-full").width();
    var $width_sum_full = ($with - $main_container) / 2 - ($with - $main_container_full) / 2 - 30;

    if ($with > 1520) {
      let $width_sum2 = -$width_sum_full;
      jQuery('.rev_slider .fix-laptop').css('margin-left', $width_sum2);
    } else {
      jQuery('.rev_slider .fix-laptop').removeAttr('style');
    }
  }

  _intTooltip() {
    if (typeof jQuery.fn.tooltip === "undefined") return;
    jQuery('[data-toggle="tooltip"]').tooltip();
  }

  _toCategoryFixed() {
    let $with = jQuery(window).width();
    let $main_container = jQuery(".container").width();
    var $width_sum = ($with - $main_container) / 2;

    if ($width_sum >= 80) {
      var $width_sum2 = $width_sum - 80;

      if ($width_sum < 110) {
        if (jQuery('body').hasClass("rtl")) {
          jQuery('.tbay-to-top').css({
            "left": $width_sum2,
            "right": "auto"
          });
          jQuery('.tbay-category-fixed').css({
            "right": $width_sum2,
            "left": "auto"
          });
        } else {
          jQuery('.tbay-to-top').css({
            "right": $width_sum2,
            "left": "auto"
          });
          jQuery('.tbay-category-fixed').css({
            "left": $width_sum2,
            "right": "auto"
          });
        }
      } else {
        jQuery('.tbay-to-top').removeAttr("style");
        jQuery('.tbay-category-fixed').removeAttr("style");
      }

      jQuery('.tbay-category-fixed').css('display', 'block');
      jQuery('.tbay-to-top').css('display', 'block');
    } else {
      jQuery('.tbay-category-fixed').css('display', 'none');
      jQuery('.tbay-to-top').css('display', 'none');
    }
  }

  _intLoader() {
    jQuery('#loader').delay(100).fadeOut(400, function () {
      jQuery('body').removeClass('tbay-body-loading');
      jQuery(this).remove();
    });
  }

  _homeBanner() {
    if (jQuery('.tbay-home-banner').length > 0) {
      jQuery('.tbay-home-banner').parents('.vc_row-fluid').addClass('position-img');
    }
  }

  _toggleDropdown() {
    jQuery(document.body).on('click', '.nav [data-toggle="dropdown"]', function () {
      if (this.href && this.href != '#') {
        window.location.href = this.href;
      }
    });
    jQuery(document.body).on('click', '.treeview [data-toggle="dropdown"]', function () {
      if (this.href && this.href != '#') {
        window.location.href = this.href;
      }
    });
  }

}

class TreeView {
  constructor() {
    this._treeViewMenu();

    this._mobileTreeView();

    this._categoryTreeView();

    this._tbayTreeViewMenu();
  }

  _treeViewMenu() {
    jQuery(".treeview-menu .menu").each(function () {
      if (jQuery(this).hasClass('treeview')) return;
      jQuery(this).treeview({
        animated: 300,
        collapsed: true,
        unique: true,
        persist: "location"
      });
    });
  }

  _mobileTreeView() {
    jQuery(".navbar-offcanvas #main-mobile-menu .treeview .hitarea").remove();
    jQuery(".navbar-offcanvas #main-mobile-menu .treeview .sub-menu").css('display', 'none');
    jQuery(".navbar-offcanvas #main-mobile-menu .treeview").removeClass('treeview');
    jQuery(".navbar-offcanvas #main-mobile-menu").each(function () {
      jQuery(this).treeview({
        animated: 300,
        collapsed: true,
        unique: true,
        persist: "location"
      });
    });
  }

  _categoryTreeView() {
    jQuery(".category-inside-content #category-menu").addClass('treeview');
    jQuery(".category-inside-content #category-menu").treeview({
      animated: 300,
      collapsed: true,
      unique: true,
      persist: "location"
    });
  }

  _tbayTreeViewMenu() {
    if (typeof jQuery.fn.treeview === "undefined" || typeof jQuery('.tbay-treeview') === "undefined") return;
    jQuery(".tbay-treeview").each(function () {
      if (jQuery(this).hasClass('treeview')) return;
      jQuery(this).find('> ul').treeview({
        animated: 400,
        collapsed: true,
        unique: true,
        persist: "location"
      });
    });
  }

}

class NewsLetter {
  constructor() {
    this._init();
  }

  _init() {
    if (typeof jQuery.fn.modal === "undefined") return;
    jQuery('#popupNewsletterModal').on('hidden.bs.modal', function () {
      Cookies.set('hiddenmodal', 1, {
        expires: 0.1,
        path: '/'
      });
    });
    setTimeout(function () {
      if (typeof Cookies.get('hiddenmodal') === "undefined" || Cookies.get('hiddenmodal') == "") {
        jQuery('#popupNewsletterModal').modal('show');
      }
    }, 3000);
  }

}

class Search {
  constructor() {
    this._init();
  }

  _init() {
    this._greenmartSearchMobile();

    this._buttonClickSearch();

    this._searchToTop();

    this._searchHeaderv2();

    this._searchPopup();

    jQuery('.button-show-search').on('click', () => jQuery('.tbay-search-form').addClass('active'));
    jQuery('.button-hidden-search').on('click', () => jQuery('.tbay-search-form').removeClass('active'));
  }

  _greenmartSearchMobile() {
    jQuery(".search-device").each(function () {
      jQuery(this).find(".show-search").on('click', event => {
        event.preventDefault();
        var target = jQuery(event.currentTarget);
        target.parent().toggleClass('open');
        target.parent().find(".tbay-search").focus();
        jQuery(document.body).trigger('search_device_mobile');
      });
    });
    jQuery(".search-mobile-close").each(function (index) {
      jQuery(this).off().on("click", function () {
        jQuery(this).prev().removeClass('open');
        jQuery(this).parent().slideUp(500, function () {});
        jQuery(this).parents('.search-device').removeClass('open');
      });
    });
    jQuery('.topbar-mobile .dropdown-menu').on('click', function (e) {
      e.stopPropagation();
    });
  }

  _searchToTop() {
    jQuery('.search-totop-wrapper .btn-search-totop').on('click', function () {
      jQuery('.search-totop-content').toggleClass('active');
      jQuery(this).toggleClass('active');
    });
    var $box_totop = jQuery('.search-totop-wrapper .btn-search-totop, .search-totop-content');
    jQuery(window).on("click.Bst", function (event) {
      if ($box_totop.has(event.target).length == 0 && !$box_totop.is(event.target)) {
        jQuery('.search-totop-wrapper .btn-search-totop').removeClass('active');
        jQuery('.search-totop-content').removeClass('active');
      }
    });
  }

  _buttonClickSearch() {
    jQuery('.button-show-search').on("click", function () {
      jQuery('.tbay-search-form').addClass('active');
      return false;
    });
    jQuery('.button-hidden-search').on("click", function () {
      jQuery('.tbay-search-form').removeClass('active');
      return false;
    });
  }

  _searchHeaderv2() {
    jQuery("#tbay-header.header-v2 .header-search-v2 .btn-search-totop").on("click", function () {
      jQuery("#tbay-header.header-v2 .header-search-v2 .tbay-search-form").slideToggle(500, function () {});
      jQuery(this).toggleClass('active');
    });
  }

  _searchPopup() {
    jQuery(".toogle-btn-search").on("click", function () {
      jQuery(".tbay-element-search-popup .tbay-search-form").slideToggle(500, function () {});
      jQuery(this).toggleClass('active');
    });
  }

}

class Preload {
  constructor() {
    this._init();
  }

  _init() {
    if (jQuery.fn.jpreLoader) {
      var $preloader = jQuery('.js-preloader');
      $preloader.jpreLoader({}, function () {
        $preloader.addClass('preloader-done');
        jQuery('body').trigger('preloader-done');
        jQuery(window).trigger('resize');
      });
    }

    jQuery('.tbay-page-loader').delay(100).fadeOut(400, function () {
      jQuery('body').removeClass('tbay-body-loading');
      jQuery(this).remove();
    });

    if (jQuery(document.body).hasClass('tbay-body-loader')) {
      setTimeout(function () {
        jQuery(document.body).removeClass('tbay-body-loader');
        jQuery('.tbay-page-loader').fadeOut(250);
      }, 300);
    }
  }

}

class Section {
  constructor() {
    this._tbayMegaMenu();

    this._tbayRecentlyView();
  }

  _tbayMegaMenu() {
    let menu = jQuery('.elementor-widget-tbay-nav-menu');
    if (menu.length === 0) return;
    menu.find('.tbay-element-nav-menu').each(function () {
      if (jQuery(this).data('wrapper').layout !== "horizontal") return;

      if (!jQuery(this).closest('.elementor-top-column').hasClass('tbay-column-static')) {
        jQuery(this).closest('.elementor-top-column').addClass('tbay-column-static');
      }

      if (!jQuery(this).closest('section').hasClass('tbay-section-static')) {
        jQuery(this).closest('section').addClass('tbay-section-static');
      }
    });
  }

  _tbayRecentlyView() {
    let recently = jQuery('.tbay-element-product-recently-viewed');
    if (recently.length === 0) return;
    recently.each(function () {
      if (jQuery(this).data('wrapper').layout !== "header") return;

      if (!jQuery(this).closest('.elementor-top-column').hasClass('tbay-column-static')) {
        jQuery(this).closest('.elementor-top-column').addClass('tbay-column-static');
      }

      if (!jQuery(this).closest('.elementor-top-column').hasClass('tbay-column-recentlyviewed')) {
        jQuery(this).closest('.elementor-top-column').addClass('tbay-column-recentlyviewed');
      }

      if (!jQuery(this).closest('section').hasClass('tbay-section-recentlyviewed')) {
        jQuery(this).closest('section').addClass('tbay-section-recentlyviewed');
      }

      if (!jQuery(this).closest('section').hasClass('tbay-section-static')) {
        jQuery(this).closest('section').addClass('tbay-section-static');
      }
    });
  }

}

class Tabs {
  constructor() {
    jQuery('ul.nav-tabs li a').on('shown.bs.tab', event => {
      jQuery(document.body).trigger('greenmart_tabs_carousel');
    });
  }

}

class Accordion {
  constructor() {
    this._init();
  }

  _init() {
    if (jQuery('.single-product').length === 0) return;
    jQuery('#accordion').on('shown.bs.collapse', function (e) {
      if (typeof greenmart_settings !== "undefined" && greenmart_settings.skin_elementor) {
        var offset = jQuery(this).find('.collapse.show').prev('.tabs-title');
      } else {
        var offset = jQuery(this).find('.collapse.in').prev('.tabs-title');
      }

      if (offset) {
        jQuery('html,body').animate({
          scrollTop: jQuery(offset).offset().top - 150
        }, 500);
      }
    });
  }

}

class MenuDropdownsAJAX {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    this._initmenuDropdownsAJAX();
  }

  _initmenuDropdownsAJAX() {
    var _this = this;

    jQuery('body').on('mousemove', function () {
      jQuery('.menu').has('.dropdown-load-ajax').each(function () {
        var $menu = jQuery(this);

        if ($menu.hasClass('dropdowns-loading') || $menu.hasClass('dropdowns-loaded')) {
          return;
        }

        if (!_this.isNear($menu, 50, event)) {
          return;
        }

        _this.loadDropdowns($menu);
      });
    });
  }

  loadDropdowns($menu) {
    var _this = this;

    $menu.addClass('dropdowns-loading');
    var storageKey = '',
        unparsedData = '',
        menu_mobile_id = '',
        format = '';

    if ($menu.closest('nav').attr('id') === 'tbay-mobile-menu-navbar') {
      if (jQuery('#main-mobile-menu-mmenu-wrapper').length > 0) {
        menu_mobile_id += '_' + jQuery('#main-mobile-menu-mmenu-wrapper').data('id');
      }

      if (jQuery('#main-mobile-second-mmenu-wrapper').length > 0) {
        menu_mobile_id += '_' + jQuery('#main-mobile-second-mmenu-wrapper').data('id');
      }

      storageKey = greenmart_settings.storage_key + '_megamenu_mobile' + menu_mobile_id;
    } else {
      storageKey = greenmart_settings.storage_key + '_megamenu_' + $menu.closest('nav').find('ul').data('id');
      format = typeof $menu.closest('nav').find('ul').data('format') !== "undefined" ? $menu.closest('nav').find('ul').data('format') : '';
    }

    unparsedData = localStorage.getItem(storageKey);

    if (typeof greenmart_settings !== 'undefined' && greenmart_settings.clear_megamenu_cache) {
      localStorage.removeItem(storageKey);
      unparsedData = null;
    }

    var storedData = false;
    var $items = $menu.find('.dropdown-load-ajax'),
        ids = [];
    $items.each(function () {
      ids.push(jQuery(this).find('.dropdown-html-placeholder').data('id'));
    });

    try {
      storedData = JSON.parse(unparsedData);
    } catch (e) {
      console.log('cant parse Json', e);
    }

    if (storedData) {
      _this.renderResults(storedData, $menu, format);

      if ($menu.attr('id') !== 'tbay-mobile-menu-navbar') {
        $menu.removeClass('dropdowns-loading').addClass('dropdowns-loaded');
      }
    } else {
      jQuery.ajax({
        url: greenmart_settings.ajaxurl,
        data: {
          action: 'greenmart_load_html_dropdowns',
          ids: ids,
          format: format
        },
        dataType: 'json',
        method: 'POST',
        success: function (response) {
          if (response.status === 'success') {
            _this.renderResults(response.data, $menu, format);

            localStorage.setItem(storageKey, JSON.stringify(response.data));
          } else {
            console.log('loading html dropdowns returns wrong data - ', response.message);
          }
        },
        error: function () {
          console.log('loading html dropdowns ajax error');
        }
      });
    }
  }

  renderResults(data, $menu, format) {
    var _this = this;

    Object.keys(data).forEach(function (id) {
      _this.removeDuplicatedStylesFromHTML(data[id], function (html) {
        let html2 = html;

        if (format !== 'no-builder') {
          const regex1 = '<li[^>]*><a[^>]*href=["]' + window.location.href + '["]>.*?<\/a><\/li>';
          let content = html.match(regex1);

          if (content !== null) {
            let $url = content[0];
            let $class = $url.match(/(?:class)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/g)[0].split('"')[1];
            let $class_new = $class + ' active';
            let $url_new = $url.replace($class, $class_new);
            html2 = html2.replace($url, $url_new);
          }
        }

        $menu.find('[data-id="' + id + '"]').replaceWith(html2);

        if ($menu.attr('id') !== 'tbay-mobile-menu-navbar') {
          $menu.addClass('dropdowns-loaded');
          setTimeout(function () {
            $menu.removeClass('dropdowns-loading');
          }, 1000);
        }
      });
    });
  }

  isNear($element, distance, event) {
    var left = $element.offset().left - distance,
        top = $element.offset().top - distance,
        right = left + $element.width() + 2 * distance,
        bottom = top + $element.height() + 2 * distance,
        x = event.pageX,
        y = event.pageY;
    return x > left && x < right && y > top && y < bottom;
  }

  removeDuplicatedStylesFromHTML(html, callback) {
    if (greenmart_settings.combined_css) {
      callback(html);
      return;
    } else {
      const regex = /<style>.*?<\/style>/mg;
      let output = html.replace(regex, "");
      callback(output);
      return;
    }
  }

}

class MenuClickAJAX {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    this._initmenuClickAJAX();
  }

  _initmenuClickAJAX() {
    jQuery('.element-menu-ajax.ajax-active').each(function () {
      var $menu = jQuery(this);
      $menu.find('.menu-click').off('click').on('click', function (e) {
        e.preventDefault();
        var $this = jQuery(this);
        if (!$this.closest('.element-menu-ajax').hasClass('ajax-active')) return;
        var element = $this.closest('.tbay-element'),
            type_menu = element.data('wrapper')['type_menu'],
            layout = element.data('wrapper')['layout'],
            header_type = element.data('wrapper')['header_type'];

        if (type_menu === 'toggle') {
          var nav = element.find('.category-inside-content > nav');
        } else {
          var nav = element.find('.menu-canvas-content > nav');
        }

        var slug = nav.data('id');
        var storageKey = greenmart_settings.storage_key + '_' + slug + '_' + layout;
        var storedData = false;
        var unparsedData = localStorage.getItem(storageKey);

        if (typeof greenmart_settings !== 'undefined' && greenmart_settings.clear_megamenu_cache) {
          localStorage.removeItem(storageKey);
          unparsedData = null;
        }

        try {
          storedData = JSON.parse(unparsedData);
        } catch (e) {
          console.log('cant parse Json', e);
        }

        if (storedData) {
          nav.html(storedData);
          element.removeClass('load-ajax');
          $this.closest('.element-menu-ajax').removeClass('ajax-active');

          if (layout === 'treeview') {
            jQuery(document.body).trigger('tbay_load_html_click_treeview');
          } else {
            jQuery(document.body).trigger('tbay_load_html_click');
          }
        } else {
          jQuery.ajax({
            url: greenmart_settings.ajaxurl,
            data: {
              action: 'greenmart_load_html_click',
              slug: slug,
              type_menu: type_menu,
              layout: layout,
              header_type: header_type
            },
            dataType: 'json',
            method: 'POST',
            beforeSend: function (xhr) {
              element.addClass('load-ajax');
            },
            success: function (response) {
              if (response.status === 'success') {
                nav.html(response.data);
                localStorage.setItem(storageKey, JSON.stringify(response.data));

                if (layout === 'treeview') {
                  jQuery(document.body).trigger('tbay_load_html_click_treeview');
                } else {
                  jQuery(document.body).trigger('tbay_load_html_click');
                }
              } else {
                console.log('loading html dropdowns returns wrong data - ', response.message);
              }

              element.removeClass('load-ajax');
              $this.closest('.element-menu-ajax').removeClass('ajax-active');
            },
            error: function () {
              console.log('loading html dropdowns ajax error');
            }
          });
        }
      });
    });
  }

}

class MenuCanvasDefaultClickAJAX {
  constructor() {
    if (typeof greenmart_settings === "undefined") return;

    this._initmenuCanvasDefaultClickAJAX();
  }

  _initmenuCanvasDefaultClickAJAX() {
    jQuery('.menu-canvas-click').off('click').on('click', function (e) {
      e.preventDefault();
      var $this = jQuery(this);
      if (!$this.hasClass('ajax-active')) return;
      var element = jQuery('#' + $this.data('id')),
          layout = element.data('wrapper')['layout'],
          menu_id = element.data('wrapper')['menu_id'],
          nav = element.find('.tbay-offcanvas-body > nav'),
          slug = nav.data('id'),
          storageKey = greenmart_settings.storage_key + '_' + slug + '_' + layout,
          storedData = false,
          unparsedData = localStorage.getItem(storageKey);

      if (typeof greenmart_settings !== 'undefined' && greenmart_settings.clear_megamenu_cache) {
        localStorage.removeItem(storageKey);
        unparsedData = null;
      }

      try {
        storedData = JSON.parse(unparsedData);
      } catch (e) {
        console.log('cant parse Json', e);
      }

      if (storedData) {
        nav.html(storedData);
        element.removeClass('load-ajax');
        $this.removeClass('ajax-active');

        if (layout === 'treeview') {
          jQuery(document.body).trigger('tbay_load_html_click_treeview');
        } else {
          jQuery(document.body).trigger('tbay_load_html_click');
        }
      } else {
        jQuery.ajax({
          url: greenmart_settings.ajaxurl,
          data: {
            action: 'greenmart_load_html_canvas_click',
            slug: slug,
            layout: layout,
            menu_id: menu_id
          },
          dataType: 'json',
          method: 'POST',
          beforeSend: function (xhr) {
            element.addClass('load-ajax');
          },
          success: function (response) {
            if (response.status === 'success') {
              nav.html(response.data);
              localStorage.setItem(storageKey, JSON.stringify(response.data));

              if (layout === 'treeview') {
                jQuery(document.body).trigger('tbay_load_html_click_treeview');
              } else {
                jQuery(document.body).trigger('tbay_load_html_click');
              }
            } else {
              console.log('loading html dropdowns returns wrong data - ', response.message);
            }

            element.removeClass('load-ajax');
            $this.removeClass('ajax-active');
          },
          error: function () {
            console.log('loading html dropdowns ajax error');
          }
        });
      }
    });
  }

}

class CountDownTimer {
  constructor() {
    if (typeof jQuery.fn.tbayCountDown === "undefined") return;
    if (typeof greenmart_settings === "undefined") return;
    jQuery('[data-time="timmer"]').each(function (index, el) {
      var $this = jQuery(this);
      var $date = $this.data('date').split("-");
      var days = $this.data('days');
      var hours = $this.data('hours');
      var mins = $this.data('mins');
      var secs = $this.data('secs');
      $this.tbayCountDown({
        TargetDate: $date[0] + "/" + $date[1] + "/" + $date[2] + " " + $date[3] + ":" + $date[4] + ":" + $date[5],
        DisplayFormat: "<div class=\"times\"><div class=\"day\">%%D%% " + days + " </div><div class=\"hours\">%%H%% " + hours + " </div><div class=\"minutes\">%%M%% " + mins + " </div><div class=\"seconds\">%%S%% " + secs + " </div></div>",
        FinishMessage: ""
      });
    });
    jQuery('[data-countdown="countdown"]').each(function (index, el) {
      var $this = jQuery(this);
      var $date = $this.data('date').split("-");
      $this.tbayCountDown({
        TargetDate: $date[0] + "/" + $date[1] + "/" + $date[2] + " " + $date[3] + ":" + $date[4] + ":" + $date[5],
        regexpMatchFormat: "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})",
        regexpReplaceWith: "<div class=\"countdown-wrapper\"><div class=\"day\"><span>$1</span> DAYS </div><div class=\"hours\"><span>$2</span> HRS </div><div class=\"minutes\"><span>$3</span> MINS </div><div class=\"seconds\"><span>$4</span> SECS </div></div>"
      });
    });
  }

}

class CounterUp {
  constructor() {
    if (typeof jQuery.fn.counterUp === "undefined") return;
    if (typeof greenmart_settings === "undefined") return;

    this._initCounterUp();
  }

  _initCounterUp() {
    if (jQuery('.counterUp').length > 0) {
      jQuery('.counterUp').counterUp({
        delay: 10,
        time: 800
      });
    }
  }

}

class MMenu {
  constructor() {
    if (typeof jQuery.fn.mmenu === "undefined") return;
    if (typeof greenmart_settings === "undefined") return;

    this._initMmenu();
  }

  _initMmenu() {
    if (jQuery('body').hasClass('admin-bar')) {
      jQuery('html').addClass('html-mmenu');
    }

    var _PLUGIN_ = 'mmenu';

    jQuery[_PLUGIN_].i18n({
      'cancel': greenmart_settings.cancel
    });

    var mmenu = jQuery("#tbay-mobile-smartmenu");
    var themes = mmenu.data('themes');
    var enablesearch = Boolean(mmenu.data("enablesearch"));
    var textsearch = '';
    var searchnoresults = '';
    var searchsplash = '';

    if (enablesearch) {
      textsearch = mmenu.data('textsearch');
      searchnoresults = mmenu.data('searchnoresults');
      searchsplash = mmenu.data('searchsplash');
    }

    var menu_title = mmenu.data('title');
    var searchcounters = Boolean(mmenu.data('counters'));
    var enabletabs = Boolean(mmenu.data("enabletabs"));
    var tabone = '';
    var taboneicon = '';
    var tabsecond = '';
    var tabsecondicon = '';

    if (enabletabs) {
      tabone = mmenu.data('tabone');
      taboneicon = mmenu.data('taboneicon');
      tabsecond = mmenu.data('tabsecond');
      tabsecondicon = mmenu.data('tabsecondicon');
    }

    var enablesocial = Boolean(mmenu.data("enablesocial"));
    var socialjsons = '';
    var enableeffects = Boolean(mmenu.data("enableeffects"));
    var effectspanels = '';
    var effectslistitems = '';

    if (enableeffects) {
      effectspanels = mmenu.data('effectspanels');
      effectslistitems = mmenu.data('effectslistitems');
    }

    var menu_obj = {
      offCanvas: true,
      navbar: {
        title: menu_title
      },
      counters: searchcounters,
      extensions: [themes, effectspanels, effectslistitems]
    };
    var menu_obj_dummy = {
      navbars: [],
      searchfield: {}
    };

    if (enablesearch) {
      menu_obj_dummy.navbars.push({
        position: ['top'],
        content: ['searchfield']
      });
      menu_obj_dummy.searchfield = {
        placeholder: textsearch,
        noResults: searchnoresults,
        panel: {
          add: true,
          splash: searchsplash,
          title: greenmart_settings.search
        },
        showTextItems: true,
        clear: true
      };
    }

    if (enabletabs) {
      menu_obj_dummy.navbars.push({
        type: 'tabs',
        content: ['<a href="#main-mobile-menu-mmenu"><i class="' + taboneicon + '"></i> <span>' + tabone + '</span></a>', '<a href="#mobile-menu-second-mmenu"><i class="' + tabsecondicon + '"></i> <span>' + tabsecond + '</span></a>']
      });
    }

    if (enablesocial) {
      socialjsons = JSON.parse(mmenu.data("socialjsons").replace(/'/g, '"'));
      var content = jQuery.map(socialjsons, function (value, index) {
        return `<a class="mmenu-icon" href="${value.url}" target="_blank"><i class="${value.icon}"></i></a>`;
      });
      menu_obj_dummy.navbars.push({
        position: 'bottom',
        content: content
      });
    }

    menu_obj = Object.assign(menu_obj_dummy, menu_obj);
    jQuery("#tbay-mobile-menu-navbar").mmenu(menu_obj, {
      offCanvas: {
        pageSelector: "#wrapper-container"
      },
      searchfield: {
        clear: true
      }
    });
    var mmenu_api = jQuery("#tbay-mobile-menu-navbar").data("mmenu");
    jQuery(".mmenu-open").each(function () {
      jQuery(this).on("click", function () {
        mmenu_api.open();
      });
    });
    const mmenu_before_navbar = jQuery(".before-mm-navbar");

    if (mmenu_before_navbar.length > 0) {
      mmenu_before_navbar.prependTo(jQuery(".mm-navbars_bottom"));
    }
  }

}

class SumoSelect {
  constructor() {
    if (typeof jQuery.fn.SumoSelect === "undefined") return;
    if (typeof greenmart_settings === "undefined") return;

    this._initSumoSelect();
  }

  _initSumoSelect() {
    jQuery('.dropdown_product_cat').SumoSelect({
      csvDispCount: 3,
      captionFormatAllSelected: "Yeah, OK, so everything."
    });
    jQuery('.woocommerce-currency-switcher,.woocommerce-fillter >.select, .woocommerce-ordering > .orderby').SumoSelect({
      csvDispCount: 3,
      captionFormatAllSelected: "Yeah, OK, so everything."
    });
  }

}

jQuery(document).ready(() => {
  new MenuDropdownsAJAX(), new MenuClickAJAX(), new MenuCanvasDefaultClickAJAX(), new StickyHeader(), new Tabs(), new Accordion(), new Mobile(), new AccountMenu(), new BackToTop(), new CanvasMenu(), new FuncCommon(), new TreeView(), new NewsLetter(), new Preload(), new Search(), new CountDownTimer(), new CounterUp(), new Section(), new SumoSelect();
});
jQuery(window).on('load', function () {
  new MMenu();
});
setTimeout(function () {
  jQuery(document.body).on('tbay_load_html_click_treeview', () => {
    new TreeView();
  });
}, 2000);
jQuery(window).on('load', function () {
  var common = new FuncCommon();

  common._removeAnimateVisible();
});
jQuery(window).resize(() => {
  var common = new FuncCommon();

  common._fixSliderHome3();

  common._toCategoryFixed();

  common._intLoader();
});

var CountDownTimerHandler = function ($scope, $) {
  new CountDownTimer();
};

jQuery(window).on('elementor/frontend/init', function () {
  if (typeof greenmart_settings !== "undefined" && greenmart_settings.skin_elementor && Array.isArray(greenmart_settings.elements_ready.countdowntimer)) {
    jQuery.each(greenmart_settings.elements_ready.countdowntimer, function (index, value) {
      elementorFrontend.hooks.addAction('frontend/element_ready/tbay-' + value + '.default', CountDownTimerHandler);
    });
  }
});
