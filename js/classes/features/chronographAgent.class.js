;
var Chronographagent = (function chronographagentClosure() {
    'use strict';

    function Chronographagent(productInfo) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__spanH__ = $('<span>--</span>').addClass('timmer text-success');
        this.__spanM__ = $('<span>--</span>').addClass('timmer text-success');
        this.__spanS__ = $('<span>--</span>').addClass('timmer text-success timmer-last');
        this.__DOM__.append('<label z-lang="P044"></label>').append(this.__spanH__).append(this.__spanM__).append(this.__spanS__);
        this._startTimestamp_ = null;
    };
    Chronographagent.prototype = {
        tick: function() {
            if (this.lockTick) {
                clearTimeout(this.lockTick);
                this.lockTick = 0;
            }
            if (!this._startTimestamp_) {
                this._stop();
                return;
            }
            var timeDiff = (new Date()).getDiff(this._startTimestamp_, false);
            this.__spanH__.html(commonFunc._paddingMark((timeDiff.h ? timeDiff.h : 0), '0', 2, true));
            this.__spanM__.html(commonFunc._paddingMark((timeDiff.m ? timeDiff.m : 0), '0', 2, true));
            this.__spanS__.html(commonFunc._paddingMark((timeDiff.s ? timeDiff.s : 0), '0', 2, true));
            this.lockTick = setTimeout(this.tick.bind(this), 1000);
        },
        _start: function() {
            this._startTimestamp_ = (new Date()).getTime();
            this.lockTick = setTimeout(this.tick.bind(this), 1000);
        },
        _stop: function() {
            clearTimeout(this.lockTick);
            this.lockTick = 0;
            this.__spanH__.html('--');
            this.__spanM__.html('--');
            this.__spanS__.html('--');
            this._startTimestamp_ = null;
        },
        _getDom: function() {
            return this.__DOM__;
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
    return Chronographagent;
})();