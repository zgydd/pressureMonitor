;
var Countdownagent = (function countdownagentClosure() {
    'use strict';

    function Countdownagent(productInfo) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<div></div>').addClass('viewer text-success');
        this.lockTick = 0;
        this.hours = 60 * 60;
        this.minutes = 60;
        this.timestamp = null;
        this.cycleStamp = null;
        this.callback = null;
        this.inited = null;
        this.__spanH__ = $('<span>--</span>').addClass('timmer');
        this.__spanM__ = $('<span>--</span>').addClass('timmer');
        this.__spanS__ = $('<span>--</span>').addClass('timmer timmer-last');
        this.__DOM__.append(this.__spanH__).append(this.__spanM__).append(this.__spanS__);
    };
    Countdownagent.prototype = {
        tick: function() {
            if (this.lockTick) {
                clearTimeout(this.lockTick);
                this.lockTick = 0;
            }
            var left, h, m, s;
            // Time left
            left = --this.timestamp;
            if (left < 0) {
                left = 0;
            }
            // Number of hours left
            h = Math.floor(left / this.hours);
            left -= h * this.hours;
            // Number of minutes left
            m = Math.floor(left / this.minutes);
            left -= m * this.minutes;
            // Number of seconds left
            s = commonFunc._toInt(left);
            if (s >= 60) {
                s = 0;
                m++;
                if (m >= 60) {
                    m = 0;
                    h++;
                }
            }
            this.__spanH__.html(commonFunc._paddingMark(h, '0', 2, true));
            this.__spanM__.html(commonFunc._paddingMark(m, '0', 2, true));
            this.__spanS__.html(commonFunc._paddingMark(s, '0', 2, true));
            var cd = h * 3600 + m * 60 + s;
            if (cd <= 120) this.__DOM__.removeClass('text-success').addClass('text-danger');
            else if (this.__DOM__.hasClass('text-danger')) this.__DOM__.removeClass('text-danger').addClass('text-success');
            if (typeof this.callback === 'function') this.callback(cd);
            // Scheduling another call of this function in 1s
            if (cd > 0) {
                this.lockTick = setTimeout(this.tick.bind(this), 1000);
                alarmController._clearAlarm(this.__ID__ + '_countdown', false);
            } else {
                this.__DOM__.addClass('arrow_box');
                alarmController._startAlarm(this.__ID__ + '_countdown', true);
                pageController._infoTarget(this.__ID__);
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _start: function(timestamp, callback) {
            this.inited = true;
            this._stop();
            this.cycleStamp = this.timestamp = timestamp ? timestamp : 7200;
            if (typeof callback === 'function') this.callback = callback;
            this.__DOM__.removeClass('arrow_box');
            this.lockTick = setTimeout(this.tick.bind(this), 1000);
        },
        _reset: function(timestamp) {
            if (!this.inited) return;
            this._stop();
            if (timestamp) this.cycleStamp = this.timestamp = timestamp;
            else if (this.cycleStamp) this.timestamp = this.cycleStamp;
            else if (!this.timestamp) this.timestamp = 7200;
            this.__DOM__.removeClass('arrow_box');
            this.lockTick = setTimeout(this.tick.bind(this), 1000);
        },
        _stop: function() {
            if (this.lockTick) {
                clearTimeout(this.lockTick);
                this.lockTick = 0;
            }
        },
        _started: function() {
            return this.inited;
        },
        _stoped: function() {
            if (typeof this.timestamp !== 'number') return false;
            return (this.timestamp > 0 && this.lockTick === 0);
        },
        _restart: function() {
            if (!this.timestamp) return;
            this._stop();
            this.lockTick = setTimeout(this.tick.bind(this), 1000);
        },
        _setFinished: function() {
            this.timestamp = 0;
            if (this.lockTick) clearTimeout(this.lockTick);
            this.lockTick = 0;
        },
        _getRestTimestamp: function() {
            return this.timestamp;
        },
        _destroy: function() {
            if (this.lockTick) clearTimeout(this.lockTick);
            this.__spanH__.empty();
            this.__spanM__.empty();
            this.__spanS__.empty();
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__spanH__ = null;
            this.__spanM__ = null;
            this.__spanS__ = null;
            this.__ID__ = null;
            this.lockTick = null;
            this.hours = null;
            this.minutes = null;
            this.timestamp = null;
            this.cycleStamp = null;
            this.callback = null;
            this.inited = null;
        }
    };
    return Countdownagent;
})();