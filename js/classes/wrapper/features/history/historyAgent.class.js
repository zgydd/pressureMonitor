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
})("historyAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = { W003: null, W004: null };

    var clearSelf = function() {
        if (__self__.W003 && __self__.W003.length) __self__.W003.empty();
        if (__self__.W004 && __self__.W004.length) __self__.W004.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = { W003: null, W004: null, empty: null };
        __anchor__ = null;
    };
    var createGaitElement = function(histories) {
        if (__self__.W003 && __self__.W003.length) __self__.W003.empty();
        histories.sort(function(a, b) {
            return commonFunc._toFloat(b.name) - commonFunc._toFloat(a.name);
        });
        var activedLang = runtimeCollection._get('activedLanguageList');
        __self__.W003 = $('<div></div>').addClass('histories-container');
        var containerTable = '<table>';
        containerTable += '<tr><th z-lang="P003">' + activedLang.P003 + '</th><th z-lang="P004">' + activedLang.P004 +
            '</th><th z-lang="P005">' + activedLang.P005 + '</th><th z-lang="P006">' + activedLang.P006 +
            '</th><th z-lang="P007">' + activedLang.P007 + '</th><th z-lang="P008">' + activedLang.P008 + '</th></tr>';
        if (histories && histories.length) {
            for (var i = 0; i < histories.length; i++) {
                containerTable += '<tr>';
                containerTable += '<td><a id="' + histories[i].path + '" href="#">' +
                    (new Date(commonFunc._toFloat(histories[i].name))).Format('yyyy-MM-dd hh:mm:ss') +
                    '</a></td>';
                var overview = (!histories[i].hasOwnProperty('jsonData')) ? io._getReportOverview(histories[i].path) : histories[i].jsonData;
                if (!overview) overview = {
                    avgStepFrequency: 'NaN',
                    avgStepLength: 'NaN',
                    avgStepSpeed: 'NaN',
                    stepLengthDeviation: 'NaN',
                    stepWidth: 'NaN'
                };
                containerTable += '<td>' + overview.avgStepFrequency + '</td>';
                containerTable += '<td>' + overview.avgStepLength + '</td>';
                containerTable += '<td>' + overview.avgStepSpeed + '</td>';
                containerTable += '<td>' + overview.stepLengthDeviation + '</td>';
                containerTable += '<td>' + overview.stepWidth + '</td>';
                containerTable += '</tr>';
            }
        }
        containerTable += '</table>';
        __self__.W003.html(containerTable);
    }
    var setGaitRecordList = function() {
        var histories = io._findHistories(true, null, 'gait');
        if (!histories || !histories.length) return;
        histories.sort(function(a, b) {
            return commonFunc._toFloat(b.name) - commonFunc._toFloat(a.name);
        });
        createGaitElement(histories);
    };
    var setKeepRecordList = function() {
        var histories = io._findHistories(true, 'records');
        if (!histories || !histories.length) return;
        histories.reverse();
        for (var i = 0; i < histories.length; i++) {
            histories[i].data = io._findHistories(false, 'records/' + histories[i].name);
        }
        __self__.W004 = $('<div></div>').addClass('plugin-container');
        flipMenu._config({
            anchorElement: __self__.W004,
            data: histories,
            autoAppend: true,
            needDetail: false
        });
    };
    var showGaitRecord = function() {
        var target = arguments[0] || null;
        if (!target) return;
        var path = target.target.id;
        var sampling = io._findHistories(false, path, 'gait');
        if (!sampling || !sampling.length) return;
        showGaitRecordReal(sampling, path);
    };
    var showGaitRecordReal = function(sampling, path) {
        if (!sampling || !sampling.length) return;
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        runtimeInfo.startTimestamp = 0;
        runtimeInfo.finishedTimestamp = 0;
        runtimeCollection._set('canvasData', []);
        sampling.sort(function(a, b) {
            return commonFunc._toFloat(b.name) - commonFunc._toFloat(a.name);
        });
        var isInsideForm = runtimeCollection._get('_ENV_').insideForm;
        runtimeInfo.startTimestamp = (path !== undefined) ? path.substring(path.lastIndexOf('/') + 1) : commonFunc._toFloat(sampling[0].name);
        for (var i = 0; i < sampling.length; i++) {
            if (sampling[i].name.indexOf('.json') > 0)
                runtimeInfo.finishedTimestamp = sampling[i].name.substring(0, sampling[i].name.indexOf('.json'));
            else runtimeInfo.finishedTimestamp = commonFunc._toFloat(sampling[i].name);
            if (!isInsideForm && sampling[i].name.indexOf('.png') <= 0) continue;
            var splitIdx = sampling[i].name.indexOf('.png');
            var activeTime = (splitIdx >= 0) ? sampling[i].name.substring(0, sampling[i].name.indexOf('.png')) : sampling[i].name;
            var img = new Image();
            img.src = (!isInsideForm) ? path + '/' + sampling[i].name : sampling[i].path;
            img.id = activeTime;
            img.onload = function() {
                var cavInStep = document.createElement('canvas');
                cavInStep.width = this.width;
                cavInStep.height = this.height;
                cavInStep.id = this.id;
                var ctxInStep = cavInStep.getContext("2d");
                ctxInStep.drawImage(this, 0, 0, this.width, this.height);
                runtimeCollection._push('canvasData', {
                    timestamp: this.id,
                    image: cavInStep,
                    imgData: ctxInStep.getImageData(0, 0, cavInStep.width, cavInStep.height).data
                });
                if ((runtimeCollection._get('canvasData')).length === sampling.length - 1) {
                    var canvasData = runtimeCollection._get('canvasData');
                    canvasData.sort(function(a, b) {
                        return commonFunc._toFloat(a.timestamp) - commonFunc._toFloat(b.timestamp);
                    });
                    algorithmsLogic._resetAndReportCollection(false);
                }
            }
        }
    };
    var appendHistoryPage = function() {
        var activedInfo = runtimeCollection._get('activedInfo') || null;
        if (!activedInfo || !activedInfo.category) return;

        var showFlg = -1;
        if (activedInfo.category === 'wait') showFlg = 0;
        if (activedInfo.config && activedInfo.config.features && commonFunc._isArray(activedInfo.config.features)) {
            if (activedInfo.config.features.indexOf('W003') >= 0) showFlg = 1;
            if (activedInfo.config.features.indexOf('W004') >= 0) showFlg = 2;
        }
        switch (showFlg) {
            case 0:
                if (__self__.W003 && __self__.W003.length) __anchor__.append(__self__.W003);
                if (__self__.W004 && __self__.W004.length) __anchor__.append(__self__.W004);
                break;
            case 1:
                if (__self__.W003 && __self__.W003.length) __anchor__.append(__self__.W003);
                break;
            case 2:
                setKeepRecordList();
                if (__self__.W004 && __self__.W004.length) __anchor__.append(__self__.W004);
                break;
            default:
                break;
        }
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();

            setGaitRecordList();
            setKeepRecordList();

            if (!__self__.W003 && !__self__.W004)
                __self__.empty = $('<div style="height:50%;"></div>').addClass('histories-container').html('<label z-lang="P009">' +
                    runtimeCollection._get('activedLanguageList').P009 + '</label>');
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            if (__self__.empty && __self__.empty.length) {
                __anchor__.append(__self__.empty);
                return;
            }
            appendHistoryPage();

            $('.main-content > .main-body .histories-container a').on('click', showGaitRecord);
            if (__self__.W004 && __self__.W004.length) flipMenu._bindListener();
        },
        _gaitToReplay: function() {
            if ($('.popup-layer>div>.canvas-container').hasClass('report-canvas'))
                $('.popup-layer>div>.canvas-container').removeClass('report-canvas');
            if ($('.popup-layer ul.heatmap-symbol').hasClass('report-symbol'))
                $('.popup-layer ul.heatmap-symbol').removeClass('report-symbol');
            if ($('.popup-layer>div>.button-container').hasClass('report-button'))
                $('.popup-layer>div>.button-container').removeClass('report-button');
            if ($('.popup-report-container').hasClass('report-container'))
                $('.popup-report-container').removeClass('report-container');
        },
        _gaitToReport: function() {
            if (!$('.popup-layer>div>.canvas-container').hasClass('report-canvas'))
                $('.popup-layer>div>.canvas-container').addClass('report-canvas');
            if (!$('.popup-layer ul.heatmap-symbol').hasClass('report-symbol'))
                $('.popup-layer ul.heatmap-symbol').addClass('report-symbol');
            if (!$('.popup-layer>div>.button-container').hasClass('report-button'))
                $('.popup-layer>div>.button-container').addClass('report-button');
            if (!$('.popup-report-container').hasClass('report-container'))
                $('.popup-report-container').addClass('report-container');
        },
        _forceShowGaitRecord: function(recordList) {
            showGaitRecordReal(recordList);
        },
        _refreshGaitRecordList: function(gaitHistoryList) {
            if (__self__.W003 && __self__.W003.length) __self__.W003.empty();
            createGaitElement(gaitHistoryList);
            var activedInfo = runtimeCollection._get('activedInfo');
            if (activedInfo && activedInfo.activedContainer === 'left-menu-records') {
                commonFunc._traverseClearEvent(__anchor__);
                __anchor__.empty();
                appendHistoryPage();

                $('.main-content > .main-body .histories-container a').on('click', showGaitRecord);
            }
        },
        _refreshKeepRecordList: function(keepRecordList) {
            if (__self__.W004 && __self__.W004.length) {
                commonFunc._traverseClearEvent(__self__.W004);
                __self__.W004.empty();
            }
            __self__.W004 = $('<div></div>').addClass('plugin-container');
            flipMenu._config({
                anchorElement: __self__.W004,
                data: keepRecordList,
                autoAppend: true,
                needDetail: false
            });
            flipMenu._bindListener();
        }
    };
    return factory;
});