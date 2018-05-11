;
(function(name, context, factory) {
    // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("heatmapInfo", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;

    var __privateParams__ = { countdown: false, scale: false };

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        __self__.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };
    var factory = {
        _init: function() {
            var initFlg = true;
            var activedInfo = runtimeCollection._get('activedInfo');
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>').addClass('heatmap-info');
            if (activedInfo.config.features.indexOf('W001') >= 0) {
                if (typeof countDownAgent !== 'undefined' &&
                    typeof countDownAgent._init === 'function') {
                    initFlg = initFlg && countDownAgent._init();
                }
            }
            return initFlg;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            var activedInfo = runtimeCollection._get('activedInfo');
            if (activedInfo.config.features.indexOf('W001') >= 0) {
                if (typeof countDownAgent !== 'undefined' &&
                    typeof countDownAgent._link === 'function') {
                    countDownAgent._link(__self__);
                }
            }
            if (activedInfo.config.features.indexOf('M002') >= 0) {
                if (typeof scaleAgent !== 'undefined' &&
                    typeof scaleAgent._linkShowFrame === 'function') {
                    scaleAgent._linkShowFrame(__self__);
                }
            }
            __anchor__.append(__self__);
        },
        _putNote: function(message) {
            var messageContainer = $('.main-content>.main-body .heatmap-info>span.message');
            if (messageContainer.length <= 0) {
                messageContainer = $('<span></span>').addClass('message');
                __self__.append(messageContainer);
            }
            messageContainer.html(message);
            if (!message) {
                messageContainer.removeClass('text-info').removeClass('text-danger');
                return;
            }
            if (messageContainer.hasClass('text-info'))
                messageContainer.removeClass('text-info').addClass('text-danger');
            else if (messageContainer.hasClass('text-danger'))
                messageContainer.removeClass('text-danger').addClass('text-info');
            else messageContainer.addClass('text-danger');
        }
    };

    return factory;
});