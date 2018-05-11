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
})("scaleAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __showFrame__ = {
        mark: $('<label>评分：</label>'),
        html: $('<span>--</span>')
    };
    var __privateParam__ = {
        scaleTitle: '',
        dynamicTableContainer: null,
        worker: null,
        recover: null
    };
    var __listener__ = { leaveListener: [], turnListener: [], backListener: [] };
    var registerLeaveListener = function(func) {
        commonFunc._registerListener(__listener__.leaveListener, func);
    };
    var unRegisterLeaveListener = function(func) {
        commonFunc._unRegisterListener(__listener__.leaveListener, func);
    };
    var registerTurnListener = function(func) {
        commonFunc._registerListener(__listener__.turnListener, func);
    };
    var unRegisterTurnListener = function(func) {
        commonFunc._unRegisterListener(__listener__.turnListener, func);
    };
    var registerBackListener = function(func) {
        commonFunc._registerListener(__listener__.backListener, func);
    };
    var unRegisterBackListener = function(func) {
        commonFunc._unRegisterListener(__listener__.backListener, func);
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
    var getDynamicTable = function(scaleTable) {
        var html = '<table>';
        var scale = io._getAScale(scaleTable);
        if (!scale || !scale.descriptionItem || !scale.descriptionItem.length) return;
        sharingDataSet._set('activedScale', scale);
        if (scale.title) {
            $('.scale-title > span').html(scale.title);
            __privateParam__.scaleTitle = scale.title;
        }
        var maxItemNum = 0;
        for (var i = 0; i < scale.descriptionItem.length; i++) {
            if (!scale.descriptionItem[i].items || !scale.descriptionItem[i].items.length) continue;
            for (var j = 0; j < scale.descriptionItem[i].items.length; j++)
                maxItemNum = Math.max(maxItemNum, commonFunc._toInt(scale.descriptionItem[i].items[j].value));
        }
        var sumScale = 0;
        html += '<tr>';
        html += '<th>参数</th>';
        for (var i = 1; i <= maxItemNum; i++) html += '<th>' + i + '</th>';
        html += '<th>评分</th>';
        html += '</tr>';
        for (var i = 0; i < scale.descriptionItem.length; i++) {
            var thisScale = 1;
            html += '<tr class="item">';
            html += '<td>' + scale.descriptionItem[i].title + '</td>';
            var j = 0;
            for (j = 0; j < scale.descriptionItem[i].items.length; j++)
                html += '<td>' + scale.descriptionItem[i].items[j].description + '</td>';
            if (j < maxItemNum)
                for (var x = j; x <= maxItemNum; x++) html += '<td></td>';
            html += '<td><select id="' + scale.descriptionItem[i].title + '">';
            for (j = 0; j < scale.descriptionItem[i].items.length; j++) {
                html += '<option value="' + scale.descriptionItem[i].items[j].value + '"';
                if (scale.constantScales && scale.constantScales.length) {
                    for (var x = 0; x < scale.constantScales.length; x++) {
                        if (scale.constantScales[x].item.replace(/(^\s*)|(\s*$)/g, "") === scale.descriptionItem[i].title.replace(/(^\s*)|(\s*$)/g, "") &&
                            commonFunc._toInt(scale.constantScales[x].scale) === commonFunc._toInt(scale.descriptionItem[i].items[j].value)) {
                            html += ' selected ';
                            thisScale = commonFunc._toInt(scale.constantScales[x].scale);
                            break;
                        }
                    }
                }
                html += '>' + scale.descriptionItem[i].items[j].description + '</option>';
            }
            html += '</select></td>';
            html += '</tr>';
            sumScale += thisScale;
        }
        if (scale.presureRange) sumScale += scale.presureRange;
        html += '<tr><td colspan="' + (maxItemNum + 2) + '"><label>总分</label><span>' + sumScale + '</span></td></tr>';
        html += '</table>';
        return html;
    };
    var refreshDynamicTable = function(scaleTable) {
        commonFunc._traverseClearEvent(__privateParam__.dynamicTableContainer.children());
        __privateParam__.dynamicTableContainer.html(getDynamicTable(scaleTable));
        $('.scale-dynamic-table-container select').on('change', changeScale);
    };
    var changeScaleTable = function() {
        var target = arguments[0] || null;
        if (target) target = target.target;
        if (target && !target.id) target = $(target).parents('button').length ? $($(target).parents('button').get(0)) : $(target);
        else target = $(target);
        if (target.hasClass('actived')) return;
        $('.scale-select-container button').each(function(i, n) {
            $(n).removeClass('actived');
        });
        target.addClass('actived');
        var newActive = target.get(0).id;
        refreshDynamicTable(newActive);
        sharingDataSet._set('defaultScale', newActive);
    };
    var changeScale = function() {
        var target = arguments[0] || null;
        if (target) target = target.target;
        if (!target || !target.id) return;
        var newScale = sharingDataSet._get('activedScale');
        if (!newScale.hasOwnProperty('constantScales') || !newScale.constantScales.length)
            return;
        var value = commonFunc._toInt($(target).val());
        if (!value) return;
        for (var i = 0; i < newScale.constantScales.length; i++) {
            if (target.id === newScale.constantScales[i].item) {
                newScale.constantScales[i].scale = value;
                break;
            }
        }
        var scalePoint = 0;
        $('.scale-dynamic-table-container select').each(function(i, n) {
            scalePoint += commonFunc._toInt($(n).val());
        });
        if (newScale.presureRange) scalePoint += newScale.presureRange;
        $('.scale-dynamic-table-container table tr:last-child > td > span').html(scalePoint);
        sharingDataSet._set('activedScale', newScale);
        io._saveScaleTable();
    };
    var getScale = function() {
        var scaleList = io._getAScale(sharingDataSet._get('defaultScale'));
        if (!scaleList) return;
        var scalePoint = 0;
        for (var i = 0; i < scaleList.constantScales.length; i++)
            scalePoint += commonFunc._toInt(scaleList.constantScales[i].scale);
        if (scaleList.presureRange) scalePoint += scaleList.presureRange;
        __showFrame__.html.html(scalePoint);
        sharingDataSet._set('activedScale', scaleList);
    };
    var initSelf = function() {
        var activedInfo = runtimeCollection._get('activedInfo') || null;
        if (!activedInfo || !activedInfo.category) return;
        sharingDataSet._setScaleList();
        var activedLang = runtimeCollection._get('activedLanguageList');

        var scaleList = sharingDataSet._get('scaleList');
        var activeScale = sharingDataSet._get('defaultScale');
        if (!activeScale) activeScale = scaleList[0];
        __privateParam__.dynamicTableContainer = $('<div></div>').addClass('scale-dynamic-table-container').html(getDynamicTable(activeScale));
        var buttonFrame = $('<div></div>').addClass('scale-select-container');
        var html = '';
        for (var i = 0; i < scaleList.length; i++) {
            html += '<button id="' + scaleList[i] + '"';
            if (activeScale === scaleList[i]) html += ' class="btn actived"';
            else html += ' class="btn"';
            html += '>' + scaleList[i] + '<span z-lang="P001">' + activedLang.P001 + '</span></button>';
        }
        buttonFrame.html(html);
        __self__.append($('<div></div>').addClass('scale-title').html('<label z-lang="P002">' + activedLang.P002 + '</label><span>' + __privateParam__.scaleTitle + '</span>'));
        __self__.append(__privateParam__.dynamicTableContainer);
        __self__.append(buttonFrame);
    };
    var recoverSender = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        if (runtimeInfo.countDownRevcovered) {
            __privateParam__.recover.terminate();
            __privateParam__.recover = null;
            runtimeInfo.countDownRevcovered = null;
            return;
        }
        if (!__privateParam__.recover && typeof(Worker) !== undefined) {
            __privateParam__.recover = new Worker('./js/workers/recoverAnalysis.worker.js');
            __privateParam__.recover.onmessage = recoverCallback;
        }
        var scaleData = sharingDataSet._get('activedScale');
        var constantScale = 0;
        var innerData = matrixKeeper._getData();
        var calibrationData = matrixKeeper._getCalibrationData();
        if (scaleData.constantScales && scaleData.constantScales.length)
            for (var i = 0; i < scaleData.constantScales.length; i++)
                constantScale += (scaleData.constantScales[i].scale ? scaleData.constantScales[i].scale : 0);
        if (!constantScale || !scaleData || !scaleData.presureRange ||
            !scaleData.threshold || !scaleData.threshold.length ||
            !innerData || !innerData.length || !innerData[0].length ||
            !calibrationData || !calibrationData.length || !calibrationData[0].length ||
            innerData.length !== calibrationData.length || innerData[0].length !== calibrationData[0].length)
            return;
        var postData = {};
        postData.calibrationData = calibrationData;
        postData.innerData = innerData;
        postData.baseScale = constantScale;
        postData.presureRanges = scaleData.presureRange;
        postData.threshold = scaleData.threshold;
        postData.edgeList = commonFunc._getBinaryImage(edgeAgent._getImageData(), edgeAgent._getWidth());
        postData.skeletonList = commonFunc._getBinaryImage(skeletonAgent._getImageData(), skeletonAgent._getWidth());
        __privateParam__.recover.postMessage(JSON.stringify(postData));
    };
    var setCountDownZero = function() {
        countDown._setFinished();
        var num = 0;
        var scaleData = sharingDataSet._get('activedScale');
        if (scaleData.constantScales && scaleData.constantScales.length)
            for (var i = 0; i < scaleData.constantScales.length; i++)
                num += (scaleData.constantScales[i].scale ? scaleData.constantScales[i].scale : 0);
        if (scaleData.presureRange) num += scaleData.presureRange;
        if (!scaleData.threshold || !scaleData.threshold.length) return;
        var rangeTime = 0;
        for (var i = 0; i < scaleData.threshold.length; i++) {
            if (scaleData.threshold[i].min <= num && scaleData.threshold[i].max >= num) {
                rangeTime = scaleData.threshold[i].rangeTime;
                break;
            }
        }
        rangeTime = (rangeTime > 0 ? rangeTime * 60 : 0);
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        runtimeInfo.countDownTime = rangeTime;
        runtimeInfo.preCountDown = rangeTime;
        runtimeInfo.preCountDownRange = rangeTime;
        runtimeInfo.restDistance = 1;
        recoverSender();
        alarmController._startAlarm();
    };
    var analysisWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        if (dataResult.leave) {
            countDownAgent._stopCountDown();
            recoverSender();
            for (var i = 0; i < __listener__.leaveListener.length; i++)
                __listener__.leaveListener[i]('leave');
            edgeAgent._clearCanvas();
        }
        if (dataResult.forceback) {
            for (var i = 0; i < __listener__.turnListener.length; i++)
                __listener__.turnListener[i]('turn');
        }
        if (dataResult.data === 0) {
            setCountDownZero();
            return;
        }
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        if (runtimeInfo.preScale !== dataResult.middData.newScale && sharingDataSet._get('keepRecord'))
            sharingDataSet._outputKeepRecord();
        runtimeInfo.preScale = dataResult.middData.newScale;
        __showFrame__.html.html(dataResult.middData.newScale);
        if (!dataResult.forceback && ((dataResult.data * 60) === runtimeInfo.preCountDownRange))
            return;
        if (countDown._stoped()) return;

        var tmpDist = (runtimeInfo.restDistance -
            ((runtimeInfo.preCountDown - dataResult.cd) / (runtimeInfo.preCountDownRange * 60)));

        if (commonFunc._toInt(sharingDataSet._get('alarmType'))) {
            var newTime = commonFunc._toFloat(tmpDist * dataResult.data * 60);
            if (newTime <= 0) {
                setCountDownZero();
                return;
            }
            countDown._reset(newTime);
            runtimeInfo.preCountDown = newTime;
        } else runtimeInfo.preCountDown = dataResult.cd;
        runtimeInfo.restDistance = tmpDist;
        runtimeInfo.preCountDownRange = dataResult.data * 60;
    };
    var recoverCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        if (dataResult.forceback) {
            alarmController._clearAlarm();
            countDownAgent._recoverCountDown();
            runtimeCollection._get('runtimeInfo').countDownRevcovered = true;
            for (var i = 0; i < __listener__.backListener.length; i++)
                __listener__.backListener[i]('back');
        }
        recoverSender();
    };
    var postMapResource = function(cd) {
        var scaleData = sharingDataSet._get('activedScale');
        var constantScale = 0;
        var innerData = matrixKeeper._getData();
        var calibrationData = matrixKeeper._getCalibrationData();
        if (scaleData.constantScales && scaleData.constantScales.length)
            for (var i = 0; i < scaleData.constantScales.length; i++)
                constantScale += (scaleData.constantScales[i].scale ? scaleData.constantScales[i].scale : 0);
        if (!constantScale || !scaleData || !scaleData.presureRange ||
            !scaleData.threshold || !scaleData.threshold.length ||
            !innerData || !innerData.length || !innerData[0].length ||
            !calibrationData || !calibrationData.length || !calibrationData[0].length ||
            innerData.length !== calibrationData.length || innerData[0].length !== calibrationData[0].length)
            return;

        var postData = {};
        postData.calibrationData = calibrationData;
        postData.innerData = innerData;
        postData.baseScale = constantScale;
        postData.presureRanges = scaleData.presureRange;
        postData.threshold = scaleData.threshold;
        postData.cd = cd;
        //postData.delayedSampling = commConfig.delayedSampling;
        //postData.leaveJudge = commConfig.leaveJudge;
        //postData.turnJudge = commConfig.turnJudge;
        postData.edgeList = commonFunc._getBinaryImage(edgeAgent._getImageData(), edgeAgent._getWidth());
        postData.skeletonList = commonFunc._getBinaryImage(skeletonAgent._getImageData(), skeletonAgent._getWidth());
        __privateParam__.worker.postMessage(JSON.stringify(postData));
    };
    var factory = {
        _init: function() {
            clearSelf();
            if (!__self__ || !__self__.length) __self__ = $('<div></div>');
            initSelf();
            if (typeof(Worker) !== undefined) {
                __privateParam__.worker = new Worker('./js/workers/dataAnalysis.worker.js');
                __privateParam__.worker.onmessage = analysisWorkerCallback;
            }
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _registerSelfListener: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return;
            $('.scale-select-container button').on('click', changeScaleTable);
            $('.scale-dynamic-table-container select').on('change', changeScale);
        },
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'leave':
                    registerLeaveListener(func);
                    break;
                case 'turn':
                    registerTurnListener(func);
                    break;
                case 'back':
                    registerBackListener(func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'leave':
                    unRegisterLeaveListener(func);
                    break;
                case 'turn':
                    unRegisterTurnListener(func);
                    break;
                case 'back':
                    unRegisterBackListener(func);
                    break;
                default:
                    break;
            }
        },
        _linkShowFrame: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            getScale();
            anchorElement.append(__showFrame__.mark);
            anchorElement.append(__showFrame__.html);
        },
        _subscribeListener: function() {
            var activedInfo = runtimeCollection._get('activedInfo');
            if (activedInfo.config.features.indexOf('W001') < 0) return;
            countDownAgent._registerListener('CountDownCallback', postMapResource);
            countDownAgent._registerListener('CountDownFinished', setCountDownZero);
        }
    };

    return factory;
});