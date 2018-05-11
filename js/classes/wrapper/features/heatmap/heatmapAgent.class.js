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
})("heatmapAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __activedPage__ = null;

    var __agentParams__ = {};
    var __listener__ = { mapRepaintListener: [] };

    var registerRepaintListener = function(func) {
        commonFunc._registerListener(__listener__.mapRepaintListener, func);
    };
    var unRegisterRepaintListener = function(func) {
        commonFunc._unRegisterListener(__listener__.mapRepaintListener, func);
    };

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

    var flipHeatmap = function() {
        var target = __self__.children('.heatmap').children('.heatmap-canvas');
        var frame = __self__.children('.heatmap').children('.little-frame');
        if (!target.length) return;
        if (target.hasClass('h-flip')) {
            target.removeClass('h-flip');
            frame.removeClass('h-flip');
            __self__.children('.mini-picture').removeClass('info').addClass('success');
        } else {
            target.addClass('h-flip');
            frame.addClass('h-flip');
            __self__.children('.mini-picture').removeClass('success').addClass('info');
        }
    };
    var createGrid = function() {
        var cavGrid = document.createElement('canvas');
        cavGrid.width = __self__.width();
        cavGrid.height = __self__.outerHeight();
        __self__.append(cavGrid);
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        if (!runtimeInfo.radius) return;
        var content = cavGrid.getContext('2d');
        content.fillStyle = "rgba(255,255,255,0.8)";
        content.font = "16px Arial";
        content.strokeStyle = "rgba(23,209,255,0.3)";
        var offset = ~~((__self__.outerHeight() - __self__.height()) / 2);

        var ctxIdx = -1;
        var cursor = offset + 1;
        for (cursor; cursor < cavGrid.height - offset; cursor += runtimeInfo.radius) {
            content.moveTo(0, cursor + 1);
            content.lineTo(cavGrid.width, cursor + 1);
            if (ctxIdx >= 0 && ctxIdx % 5 === 0) {
                var mark = '';
                if (ctxIdx < 10) mark = ' ';
                content.fillText(mark + ctxIdx, 0, cursor + 8);
            }
            ctxIdx++;
        }
        for (cursor; cursor < cavGrid.height; cursor += runtimeInfo.radius) {
            content.moveTo(0, cursor + 1);
            content.lineTo(cavGrid.width, cursor + 1);
        }
        for (cursor = offset; cursor >= 0; cursor -= runtimeInfo.radius) {
            content.moveTo(0, cursor + 1);
            content.lineTo(cavGrid.width, cursor + 1);
        }
        offset = ~~((__self__.outerWidth() - $('.heatmap').width()) / 2);
        ctxIdx = -1;
        for (cursor = offset; cursor < cavGrid.width - offset; cursor += runtimeInfo.radius) {
            content.moveTo(cursor, 0);
            content.lineTo(cursor, cavGrid.height);
            if (ctxIdx >= 0 && ctxIdx % 5 === 0) {
                var mark = '';
                if (ctxIdx < 10) mark = ' ';
                content.fillText(mark + ctxIdx, cursor - 8, 13);
            }
            ctxIdx++;
        }
        for (cursor; cursor < cavGrid.width; cursor += runtimeInfo.radius) {
            content.moveTo(cursor, 0);
            content.lineTo(cursor, cavGrid.height);
        }
        for (cursor = offset; cursor >= 0; cursor -= runtimeInfo.radius) {
            content.moveTo(cursor, 0);
            content.lineTo(cursor, cavGrid.height);
        }
        content.stroke();
        content.save();
        var minLogo = $('<div></div>').addClass('mini-picture').addClass('success').css({ width: runtimeInfo.radius * 1.8, height: runtimeInfo.radius * 1.5 });
        minLogo.append($('<img class="hidden" src="../asset/images/min/logo.png"/>'));
        minLogo.on('click', flipHeatmap);
        __self__.append(minLogo);
    };
    var appendHumanFrame = function() {
        var frame = $('<img src="./asset/images/humanframe.png" />').addClass('little-frame');
        frame.width(__agentParams__.heatmapSize.width);
        frame.height(__agentParams__.heatmapSize.height);
        $('.heatmap').append(frame);
    };
    /*
    var hideFrame = function() {
        $('.heatmap .little-frame').addClass('hidden');
    };
    var showFrame = function() {
        $('.heatmap .little-frame').removeClass('hidden');
    };
    */
    var resetHeatmapView = function() {
        $('.heatmap').width(__agentParams__.heatmapSize.width);
        $('.heatmap').height(__agentParams__.heatmapSize.height);
        __self__.css('height', 'auto');
        createGrid();
        if ('A2' === logic._getProductType()) appendHumanFrame();
        __self__.append(logic._getSymbol());
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || activedInfo.category !== 'product') return;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>').addClass('heatmap-container');

            var heatmap = $('<div></div>').addClass('heatmap');
            if (activedInfo.config.features.indexOf('M001') >= 0) {
                if (typeof heatmapWrapper === 'undefined' || typeof heatmapWrapper._init !== 'function')
                    return false;

                var runtimeInfo = runtimeCollection._get('runtimeInfo');
                if (!runtimeInfo) runtimeCollection._set('runtimeInfo', runtimeInfo);
                var productSize = logic._getProductSize();
                if (!productSize.x || !productSize.y) return false;
                var mySize = contentBody._getSize();
                runtimeInfo.radius = Math.min(~~(mySize.height * 0.6 / (productSize.x + 1)), ~~(mySize.width / (productSize.y + 1)));

                __agentParams__.heatmapSize = {
                    width: productSize.y * runtimeInfo.radius + runtimeInfo.radius,
                    height: productSize.x * runtimeInfo.radius + runtimeInfo.radius
                };

                __self__.append(heatmap);
                __anchor__.append(__self__);
                resetHeatmapView();
                heatmapWrapper._init(heatmap.get(0), runtimeInfo.radius);
            }
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _getCanvasSize: function() {
            return {
                width: __agentParams__.heatmapSize.width,
                height: __agentParams__.heatmapSize.height
            }
        },
        _subscribeListener: function() {
            matrixKeeper._registerListener('Modify', heatmapWrapper._setHeatmap);
            /*
            if ('A2' === logic._getProductType()) {
                scaleAgent._registerListener('leave', hideFrame);
                scaleAgent._registerListener('back', showFrame);
            }
            */
        },
        _heatmapRepainted: function() {
            for (var i = 0; i < __listener__.mapRepaintListener.length; i++)
                __listener__.mapRepaintListener[i]();
        },
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'Repaint':
                    registerRepaintListener(func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'Repaint':
                    unRegisterRepaintListener(func);
                    break;
                default:
                    break;
            }
        }
    };

    return factory;
});