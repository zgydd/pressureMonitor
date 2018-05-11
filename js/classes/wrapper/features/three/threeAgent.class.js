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
})("threeAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        __self__.off('mousedown');
        __self__.off('mousemove');
        __self__.off('mouseup');
        __self__.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };
    var render = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        var radius = runtimeInfo.radius || 20;
        threeWrapper._render(matrixKeeper._getData(), matrixKeeper._getCalibrationData(), radius);
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>').addClass('three-container');
            return true;
        },
        _link: function() {
            __anchor__ = $('body');
            __self__.append(threeWrapper._getRender($('.main-body').innerWidth(), $('.main-body').innerHeight()));
            __self__.on('mousedown', function(event) {
                threeWrapper._startMove(event);
            });
            __self__.on('mousemove', function(event) {
                threeWrapper._moveCamera(event);
            });
            __self__.on('mouseup', function(event) {
                threeWrapper._endMove(event);
            });
            __anchor__.append(__self__);
        },
        _subscribeListener: function() {
            matrixKeeper._registerListener('Modify', render)
            contentBody._registerListener('beforeClear', clearSelf);
        }
    };

    return factory;
});