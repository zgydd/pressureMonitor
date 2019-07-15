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
    var __privateParam__ = {
        inPlay: false,
        keys: {}
    };
    var doSoundAlarm = function() {
        if (__privateParam__.inPlay) return;
        var alarmFrequency = 10;
        var alarmKeepTime = 5;
        var audio = document.getElementById('main-audio-alert');
        __privateParam__.inPlay = true;
        audio.play();
        //interFace._playSound();
        setTimeout(function() {
            __privateParam__.inPlay = false;
            audio.pause();
            //interFace._pauseSound();
        }, (alarmKeepTime * 1000));
        //_appendAlertRecord();
        __alarmHandle__ = setTimeout(doSoundAlarm, alarmFrequency * 1000);
    };
    var clearAlarm = function() {
        var audio = document.getElementById('main-audio-alert');
        audio.pause();
        //interFace._pauseSound();
        if (__alarmHandle__) {
            clearTimeout(__alarmHandle__);
            __alarmHandle__ = 0;
        }
    };
    var factory = {
        _startAlarm: function(key, value) {
            if (key) __privateParam__.keys[key] = value;
            doSoundAlarm();
        },
        _clearAlarm: function(key, value) {
            if (key) __privateParam__.keys[key] = value;
            var allClear = true;
            for (var ele in __privateParam__.keys) {
                if (__privateParam__.keys[ele]) {
                    allClear = false;
                    break;
                }
            }
            if (allClear) clearAlarm();
        },
        _isInAlarm: function() {
            return __privateParam__.inPlay;
        }
    };
    return factory;
});