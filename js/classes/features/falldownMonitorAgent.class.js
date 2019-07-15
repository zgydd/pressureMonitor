;
var Falldownmonitoragent = (function falldownmonitoragentClosure() {
    'use strict';

    function Falldownmonitoragent(productInfo, features) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<label></label>').addClass('fall-down-message');
        this.__features__ = features;
        this.__size__ = productInfo.size;
        this.counter = 0;
        dataLinks._registerListener('runtime', 'fallDownMonitor_checkFall' + this.__ID__, this._checkFalldown.bind(this));
    };
    Falldownmonitoragent.prototype = {
        _checkFalldown: function(id) {
            if (id !== this.__ID__) return;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            var innerData = dataCollection.percentage;
            if (!innerData || !innerData.length || !innerData[0].length) return;
            var checkFlg = {};
            var quarter = 0;
            if (this.__size__.x > this.__size__.y) {
                quarter = commonFunc._getQuarter(0, this.__size__.y);
                checkFlg.checkPoint = 'y';
                checkFlg.range = {
                    min: quarter,
                    max: 3 * quarter
                };
            } else {
                quarter = commonFunc._getQuarter(0, this.__size__.x);
                checkFlg.checkPoint = 'x';
                checkFlg.range = {
                    min: quarter,
                    max: 3 * quarter
                };
            }
            if (checkFlg.range.max - checkFlg.range.min < 5) return;
            var result = {
                count: 0,
                minPart: 0,
                maxPart: 0
            };
            var min = Math.max(this.__size__.x, this.__size__.y);
            var cnt = min;
            var max = 0;
            for (var i = 0; i < innerData.length; i++) {
                for (var j = 0; j < innerData[i].length; j++) {
                    if (innerData[i][j] < 0.1) continue;
                    result.count++;
                    if (checkFlg.checkPoint === 'x') {
                        if (i > checkFlg.range.min && i < checkFlg.range.max) continue;
                        if (i <= checkFlg.range.min) result.minPart++;
                        if (i >= checkFlg.range.max) result.maxPart++;
                        min = Math.min(min, j);
                        max = Math.max(max, j);
                    } else {
                        if (j > checkFlg.range.min && j < checkFlg.range.max) continue;
                        if (j <= checkFlg.range.min) result.minPart++;
                        if (j >= checkFlg.range.max) result.maxPart++;
                        min = Math.min(min, i);
                        max = Math.max(max, i);
                    }
                }
            }
            if ((max - min < cnt / 2) || result.count < 50 || ((result.minPart + result.maxPart) / result.count < 0.5) || (Math.abs(result.maxPart - result.minPart) < (result.minPart + result.maxPart) / 3)) {
                this.counter = 0;
                alarmController._clearAlarm(this.__ID__ + '_falldown', false);
                this.__DOM__.attr('z-lang', '');
                this.__DOM__.html('').removeClass('text-info').removeClass('text-danger');;
                return;
            }
            this.counter++;
            if (this.counter > 10 && (max - min > cnt / 2)) {
                if (!alarmController._isInAlarm()) alarmController._startAlarm(this.__ID__ + '_falldown', true);
                var env = rootScope._get('_ENV_');
                var activedLang = env.languageMap[env.useConfig[this.__ID__].lang];
                this.__DOM__.attr('z-lang', 'P022');
                this.__DOM__.html(activedLang.P022);
                if (this.__DOM__.hasClass('text-info')) this.__DOM__.removeClass('text-info').addClass('text-danger');
                else if (this.__DOM__.hasClass('text-danger')) this.__DOM__.removeClass('text-danger').addClass('text-info');
                else this.__DOM__.addClass('text-danger');
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            dataLinks._unRegisterListener('runtime', 'fallDownMonitor_checkFall' + this.__ID__);
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
            this.__features__ = null;
            this.__size__ = null;
            this.counter = null;
        }
    };
    return Falldownmonitoragent;
})();