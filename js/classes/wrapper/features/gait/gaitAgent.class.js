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
})("gaitAgent", this, function() {
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
    var recordGait = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        if (!runtimeInfo.inGaitFlg) return;
        if (!$('.heatmap canvas') || $('.heatmap canvas').length <= 0) return;
        var canvas = $('.heatmap canvas').get(0);
        var ctx = canvas.getContext("2d");
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var imgData = imageData.data;
        var max = 0;
        for (var i = 0; i < imgData.length; i += 4) max = Math.max(max, imgData[i + 3]);
        if (max < 128) return;
        if (!runtimeInfo.startTimestamp) runtimeInfo.startTimestamp = (new Date()).getTime();
        if (runtimeInfo.startTimestamp && !runtimeInfo.finishedTimestamp) {
            var activeTime = (new Date()).getTime();
            var cavInStep = document.createElement('canvas');
            cavInStep.width = canvas.width;
            cavInStep.height = canvas.height;
            cavInStep.id = activeTime;
            var ctxInStep = cavInStep.getContext("2d");
            ctxInStep.putImageData(imageData, 0, 0);
            runtimeCollection._push('canvasData', {
                timestamp: activeTime,
                image: cavInStep,
                imgData: ctxInStep.getImageData(0, 0, cavInStep.width, cavInStep.height).data
            });
        }
    };
    var controlGait = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        matrixKeeper._forceCalibreData();
        var activedLang = runtimeCollection._get('activedLanguageList');
        if (!runtimeInfo.inGaitFlg) {
            runtimeInfo.startTimestamp = 0;
            runtimeInfo.finishedTimestamp = 0;
            runtimeCollection._set('canvasData', []);
            $('.btn-control-gait').html(activedLang.P010);
            heatmapAgent._registerListener('Repaint', recordGait);
            runtimeInfo.inGaitFlg = true;
        } else {
            $('.btn-control-gait').html(activedLang.P011);
            runtimeInfo.inGaitFlg = null;
            heatmapAgent._unRegisterListener('Repaint', recordGait);
            runtimeInfo.finishedTimestamp = (new Date()).getTime();
            algorithmsLogic._resetAndReportCollection(true);
        }
    };
    var replayGait = function() {
        var target = arguments[0] || null;
        if (target) target = $(target.target);
        if (target.hasClass('disabled')) return;
        $('.popup-layer>div>.canvas-container').removeClass('hidden');
        $('.popup-report-container').addClass('hidden');
        target.addClass('disabled');
        historyAgent._gaitToReplay();
        runtimeCollection._get('activedInfo').inReplay = target;
        playRecord(runtimeCollection._get('canvasData'), 0, $('.popup-layer canvas').get(0));
    };
    var playRecord = function(cavList, idx, playground) {
        if (!playground || !cavList || !cavList.length) return;
        var thisCav = cavList[idx].image;
        var ctxThis = thisCav.getContext("2d");
        var ctx = playground.getContext("2d");
        ctx.clearRect(0, 0, playground.width, playground.height);
        ctx.putImageData(ctxThis.getImageData(0, 0, thisCav.width, thisCav.height), 0, 0);
        if (idx >= cavList.length - 1) {
            algorithmsLogic._resetAndReportCollection(false);
            return;
        }
        var timeot = cavList[idx + 1].timestamp - cavList[idx].timestamp;
        setTimeout(function() {
            playRecord(cavList, idx + 1, playground);
        }, timeot);
    };
    var hideMainPopup = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        $('body > .popup-layer').hide();
        runtimeInfo.startTimestamp = 0;
        runtimeInfo.finishedTimestamp = 0;
        runtimeCollection._set('canvasData', []);
        runtimeInfo.inGaitFlg = null;
        $('.btn-control-gait').html(runtimeCollection._get('activedLanguageList').P011);
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>').addClass('button-container');
            var btnControlGait = $('<button></button>').addClass('btn btn-control-gait').attr({ 'z-lang': 'P011' }).html(runtimeCollection._get('activedLanguageList').P011);
            __self__.append(btnControlGait);
            btnControlGait.on('click', controlGait);
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _popupGaitContainer: function() {
            var popupLayer;
            if (!$('body > .popup-layer').length) popupLayer = $('<div></div>');
            else {
                popupLayer = $('body > .popup-layer');
                commonFunc._traverseClearEvent(popupLayer.children());
                popupLayer.empty();
            }
            var gaitContainer = $('<div></div>');

            gaitContainer.append($('<div></div>').addClass('title').append('<i class="icon-remove icon-large"></i>'));

            var cavContainer = $('<div></div>');
            var showCanvas = document.createElement('canvas');
            var baseMap = $('.main-content > .main-body > .heatmap-container > .heatmap');
            showCanvas.width = baseMap.width();
            showCanvas.height = baseMap.height();
            cavContainer.width(showCanvas.width);
            cavContainer.height(showCanvas.height);

            cavContainer.append(showCanvas);
            cavContainer.append(logic._getSymbol());
            gaitContainer.append(cavContainer.addClass('canvas-container'));

            var infoBar = $('<div></div>');
            infoBar.addClass('button-container right');
            var btnReplay = $('<button></button>').addClass('btn btn-replay-gait').attr({ 'z-lang': 'P012' }).html(runtimeCollection._get('activedLanguageList').P012);
            infoBar.append(btnReplay);
            btnReplay.on('click', replayGait);
            gaitContainer.append(infoBar);

            $(popupLayer).append(gaitContainer);
            $(popupLayer).addClass('popup-layer');
            $('body').append(popupLayer);

            $('.popup-layer > div > .title > i').on('click', hideMainPopup);

            $(popupLayer).show();
        }
    };

    return factory;
});