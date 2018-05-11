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
})("countDownAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = { mark: null, html: null };
    var __privateParam__ = {
        timestamp: 7200,
        defaultTimeStamp: 7200,
        forceStop: false,
        inited: false
    };

    var __listener__ = {
        countDownCallbackListener: [],
        countDownFinishedListener: []
    };
    var registerFinishedListener = function(func) {
        commonFunc._registerListener(__listener__.countDownFinishedListener, func);
    };
    var unRegisterFinishedListener = function(func) {
        commonFunc._unRegisterListener(__listener__.countDownFinishedListener, func);
    };
    var registerCallbackListener = function(func) {
        commonFunc._registerListener(__listener__.countDownCallbackListener, func);
    };
    var unRegisterCallbackListener = function(func) {
        commonFunc._unRegisterListener(__listener__.countDownCallbackListener, func);
    };
    var clearSelf = function() {
        alarmController._clearAlarm();
        if (!__self__.html || !__self__.html.length) return;
        __self__.html.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__.html = null;
        __anchor__ = null;
    };
    var baseCountDown = function() {
        __privateParam__.inited = true;
        countDown._countDown({
            timestamp: __privateParam__.timestamp,
            callback: countDownCallback
        });
    };
    var rescaleCountDown = function(recoverFlg) {
        if (__privateParam__.forceStop) return;
        var activedInfo = runtimeCollection._get('activedInfo');
        var alarmType = commonFunc._toInt(sharingDataSet._get('alarmType'));
        if (!__privateParam__.inited) {
            if (!activedInfo || !activedInfo.config ||
                !activedInfo.config.features || !activedInfo.config.features.length) {
                baseCountDown();
                return;
            }
            if (alarmType !== 1 || activedInfo.config.features.indexOf('M002') < 0) {
                baseCountDown();
                return;
            }
        }
        var activedScale = io._getAScale(sharingDataSet._get('defaultScale'));
        if (!__privateParam__.inited && !activedScale) {
            baseCountDown();
            return;
        }
        var theScale = 0;
        if (alarmType === 1 &&
            (!activedScale.constantScales || !activedScale.constantScales.length))
            return;
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        for (var i = 0; i < activedScale.constantScales.length; i++) {
            theScale += activedScale.constantScales[i].scale;
        }
        if (activedScale.presureRange) theScale += activedScale.presureRange;
        sharingDataSet._set('activedScale', activedScale);
        runtimeInfo.preScale = theScale;
        runtimeInfo.restDistance = 1;
        var theTime = __privateParam__.timestamp;
        if (activedScale && activedScale.threshold && activedScale.threshold.length) {
            for (var i = 0; i < activedScale.threshold.length; i++) {
                if (activedScale.threshold[i].min <= theScale && activedScale.threshold[i].max >= theScale) {
                    theTime = activedScale.threshold[i].rangeTime * 60;
                    break;
                }
            }
        }
        if (recoverFlg) {
            switch (alarmType) {
                case 0:
                    __privateParam__.timestamp = __privateParam__.defaultTimeStamp;
                    theTime = __privateParam__.timestamp;
                    break;
                case 1:
                    __privateParam__.timestamp = theTime;
                    break;
                default:
                    break;
            }
        } else if (__privateParam__.timestamp < theTime)
            theTime = __privateParam__.timestamp;
        runtimeInfo.preCountDownRange = theTime;
        runtimeInfo.preCountDown = theTime;
        __privateParam__.timestamp = theTime;
        if (!__privateParam__.inited) baseCountDown();
        else countDown._reset(__privateParam__.timestamp);
    };
    var countDownCallback = function(h, m, s, cd) {
        __self__.html.html(commonFunc._paddingMark(h, '0', 2, true) + ' : ' +
            commonFunc._paddingMark(m, '0', 2, true) + ' : ' +
            commonFunc._paddingMark(s, '0', 2, true));
        if (cd < 300) __self__.html.addClass('alarm');
        else __self__.html.removeClass('alarm');
        if (cd <= 0) {
            alarmController._startAlarm();
            for (var i = 0; i < __listener__.countDownFinishedListener.length; i++)
                __listener__.countDownFinishedListener[i]();
            return;
        }
        __privateParam__.timestamp = cd;
        for (var i = 0; i < __listener__.countDownCallbackListener.length; i++)
            __listener__.countDownCallbackListener[i](cd);
    };
    var factory = {
        _init: function() {
            if (__privateParam__.inited) return true;
            clearSelf();
            if (!__self__.mark) __self__.mark = $('<img src="./asset/images/alarm.png" />');

            if (!__self__.html || !__self__.html.length)
                __self__.html = $('<span>--:--:--</span>');
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__.mark);
            __anchor__.append(__self__.html);
            rescaleCountDown();
        },
        _subscribeListener: function() {
            var activedInfo = runtimeCollection._get('activedInfo');
            if (!activedInfo || !activedInfo.config ||
                !activedInfo.config.features || !activedInfo.config.features.length)
                return;
            configAgent._registerListener('alarmTypeChanged', rescaleCountDown);
            if (activedInfo.config.features.indexOf('W002') >= 0) {

            }
            if (activedInfo.config.features.indexOf('M002') >= 0) {

            }
        },
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'CountDownFinished':
                    registerFinishedListener(func);
                    break;
                case 'CountDownCallback':
                    registerCallbackListener(func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'CountDownFinished':
                    unRegisterFinishedListener(func);
                    break;
                case 'CountDownCallback':
                    unRegisterCallbackListener(func);
                    break;
                default:
                    break;
            }
        },
        _stopCountDown: function() {
            __privateParam__.forceStop = true;
            countDown._stop();
        },
        _recoverCountDown: function() {
            __privateParam__.forceStop = false;
            rescaleCountDown(true);
        }
    };

    return factory;
});