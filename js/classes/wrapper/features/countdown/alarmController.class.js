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
})("alarmController", this, function() {
    'use strict';

    var __alarmHandle__ = 0;

    var doSoundAlarm = function() {
        var alarmFrequency = commonFunc._toFloat(sharingDataSet._get('alarmFrequency'));
        var alarmKeepTime = commonFunc._toFloat(sharingDataSet._get('alarmKeepTime'));
        var audio = document.getElementById('main-audio-alert');
        audio.play();
        setTimeout(function() {
            audio.pause();
        }, (alarmKeepTime * 1000));
        //_appendAlertRecord();
        __alarmHandle__ = setTimeout(doSoundAlarm, alarmFrequency * 60 * 1000);
    };
    var clearAlarm = function() {
        var audio = document.getElementById('main-audio-alert');
        audio.pause();
        if (__alarmHandle__) {
            clearTimeout(__alarmHandle__);
            __alarmHandle__ = 0;
        }
    };
    var factory = {
        _startAlarm: function() {
            doSoundAlarm();
        },
        _clearAlarm: function() {
            clearAlarm();
            setTimeout(function() {
                if (__alarmHandle__) clearAlarm();
            }, 800);
        }
    };

    return factory;
});