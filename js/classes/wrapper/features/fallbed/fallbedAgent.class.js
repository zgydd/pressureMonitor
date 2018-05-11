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
})("fallbedAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;

    var __privateParam__ = { counter: 0 };

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
    var fallBedTick = function() {
        var innerData = matrixKeeper._getPercentage();
        if (!innerData || !innerData.length || !innerData[0].length) return;
        var productSize = logic._getProductSize();
        if (!productSize || !productSize.x || !productSize.y) return;
        var checkFlg = {};
        var quarter = 0;
        if (productSize.x > productSize.y) {
            quarter = commonFunc._getQuarter(0, productSize.y);
            checkFlg.checkPoint = 'y';
            checkFlg.range = { min: quarter, max: 3 * quarter };
        } else {
            quarter = commonFunc._getQuarter(0, productSize.x);
            checkFlg.checkPoint = 'x';
            checkFlg.range = { min: quarter, max: 3 * quarter };
        }
        if (checkFlg.range.max - checkFlg.range.min < 5) return;

        var result = { count: 0, minPart: 0, maxPart: 0 };
        var min = Math.max(productSize.x, productSize.y);
        var cnt = min;
        var max = 0;

        for (var i = 0; i < innerData.length; i++) {
            for (var j = 0; j < innerData[i].length; j++) {
                if (innerData[i][j] < 0.5) continue;
                result.count++;
                if (checkFlg.checkPoint === 'x') {
                    if (i > checkFlg.range.min && i < checkFlg.range.max) continue;
                    if (i <= checkFlg.range.min) result.minPart++;
                    if (i >= checkFlg.range.max) result.maxPart++;
                    min = Math.min(min, j);
                    max = Math.max(max, j);
                } else {
                    if (j > checkFlg.range.min && j < checkFlg.range.max) continue;
                    if (j <= checkFlg.range.min) result.minPart++;
                    if (j >= checkFlg.range.max) result.maxPart++;
                    min = Math.min(min, i);
                    max = Math.max(max, i);
                }
            }
        }

        if ((max - min < cnt / 2) || result.count < 50 || ((result.minPart + result.maxPart) / result.count < 0.5) ||
            (Math.abs(result.maxPart - result.minPart) < (result.minPart + result.maxPart) / 3)) {
            __privateParam__.counter = 0;
            alarmController._clearAlarm();
            heatmapInfo._putNote('');
            return;
        }

        __privateParam__.counter++;

        if (__privateParam__.counter > 10 && (max - min > cnt / 2) && !alarmController._isInAlarm()) {
            alarmController._startAlarm();
            heatmapInfo._putNote(runtimeCollection._get('activedLanguageList').P022);
        }
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>');

            __privateParam__.counter = 0;

            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _subscribeListener: function() {
            matrixKeeper._registerListener('Modify', fallBedTick);
        }
    };

    return factory;
});