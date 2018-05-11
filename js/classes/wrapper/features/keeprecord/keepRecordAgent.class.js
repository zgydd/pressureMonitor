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
})("keepRecordAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;

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
    var sendKeepRecord = function() {
        if (!$('.heatmap .heatmap-canvas').length) {
            setTimeout(sendKeepRecord, 1000);
            return;
        }
        var cav = $('.heatmap .heatmap-canvas').get(0);
        var ctx = cav.getContext("2d");
        var imgData = ctx.getImageData(0, 0, cav.width, cav.height).data;
        var cntHasValue = 0;
        for (var i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] > 20) {
                cntHasValue++;
            }
            if (cntHasValue > 300) break;
        }
        if (cntHasValue < 300) return;

        /*
        var tmpCav = document.createElement('canvas');
        tmpCav.width = cav.width;
        tmpCav.height = cav.height;
        var tmpCtx = tmpCav.getContext("2d");
        tmpCtx.putImageData(ctx.getImageData(0, 0, cav.width, cav.height), 0, 0);

        var img = $('.main-content>.main-body .heatmap-container>div.mini-picture img');
        if (img.length) tmpCtx.drawImage(img.get(0), 0, 0);
        if (img.length) {
            if (!$('.heatmap .heatmap-canvas').hasClass('h-flip')) tmpCtx.drawImage(img.get(0), 0, 0);
            else tmpCtx.drawImage(img.get(0), 0, tmpCav.height - img.height() - 2);
        }
        */
        var base64Data = cav.toDataURL().replace(/^data:image\/\w+;base64,/, "");
        if (!base64Data) {
            setTimeout(sendKeepRecord, 1000);
            return;
        }
        sharingDataSet._setKeepRecordCollection(base64Data);
    };
    var doRecord = function() {
        var activedInfo = runtimeCollection._get('activedInfo');
        if (!activedInfo || !activedInfo.config) return;
        if (activedInfo.config.features.indexOf('W004') < 0) return;
        if (!sharingDataSet._get('keepRecord')) return;
        setTimeout(sendKeepRecord, 1000);
    };
    var changeStatus = function(flg) {
        if (!sharingDataSet._get('keepRecord')) return;
        switch (flg) {
            case 'leave':
                sharingDataSet._outputKeepRecord(true);
                break;
            case 'turn':
                sharingDataSet._outputKeepRecord();
                break;
            case 'back':
                setTimeout(sendKeepRecord, 1000);
                break;
            default:
                break;
        }
    };
    var factory = {
        _init: function() {
            return true;
        },
        _subscribeListener: function() {
            heatmapAgent._registerListener('Repaint', doRecord);
            scaleAgent._registerListener('leave', changeStatus);
            scaleAgent._registerListener('turn', changeStatus);
            scaleAgent._registerListener('back', changeStatus);
        }
    };

    return factory;
});