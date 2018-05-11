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
})("countDown", this, function() {
    'use strict';
    var hours = 60 * 60;
    var minutes = 60;

    var options = null;
    var lockTick = 0;

    var tick = function() {
        if (lockTick) {
            clearTimeout(lockTick);
            lockTick = 0;
        }
        var left, h, m, s;
        // Time left
        left = --options.timestamp;
        if (left < 0) {
            left = 0;
        }
        // Number of hours left
        h = Math.floor(left / hours);
        left -= h * hours;
        // Number of minutes left
        m = Math.floor(left / minutes);
        left -= m * minutes;
        // Number of seconds left
        s = commonFunc._toInt(left);

        var cd = h * 3600 + m * 60 + s;
        options.callback(h, m, s, cd);

        // Scheduling another call of this function in 1s
        if (cd > 0) lockTick = setTimeout(tick, 1000);
    };

    return {
        _countDown: function(prop) {
            if (prop && prop.hasOwnProperty('timestamp') && prop.hasOwnProperty('callback'))
                options = prop;
            else options = {
                callback: function() {},
                timestamp: 0
            };
            tick();
        },
        _reset: function(prop) {
            if (lockTick) {
                clearTimeout(lockTick);
                lockTick = 0;
            }
            options.timestamp = prop;
            if (options.timestamp > 0) lockTick = setTimeout(tick, 1000);
        },
        _stop: function() {
            if (lockTick) {
                clearTimeout(lockTick);
                lockTick = 0;
            }
        },
        _start: function() {
            if (lockTick) {
                clearTimeout(lockTick);
                lockTick = 0;
            }
            if (options.timestamp > 0) lockTick = setTimeout(tick, 1000);
        },
        _stoped: function() {
            if (!options || !options.timestamp) return false;
            return (options.timestamp > 0 && lockTick === 0);
        },
        _setFinished: function() {
            options.timestamp = 0;
            lockTick = 0;
        },
        _getRestTimestamp: function() {
            if (!options) return null;
            return options.timestamp;
        }
    };
});