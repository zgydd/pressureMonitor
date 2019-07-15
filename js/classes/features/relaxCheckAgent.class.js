;
var Relaxcheckagent = (function relaxcheckagentClosure() {
    'use strict';

    function Relaxcheckagent(productInfo, features) {
        this.__ID__ = productInfo.com;
        var sysConfig = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__viewMatrixFormula__ = (sysConfig.viewMatrixFormula ? sysConfig.viewMatrixFormula : '{0}');
        this.__noiseFilter__ = (sysConfig.noiseFilter ? sysConfig.noiseFilter : 0);
        this.__DOM__ = $('<div></div>').addClass('viewer');
        var logicSize = productInfo.size || {
            x: 32,
            y: 64
        };
        var physicalSize = productInfo.physicalSize || {
            x: 77,
            y: 172.2
        };
        this.__oneSensorArea__ = (physicalSize.x / logicSize.x) * (physicalSize.y / logicSize.y);
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.__relaxCheckHandle__ = 0;
        this.__features__ = features;
        this.__Note__ = $('<label z-lang="CEMPTY"></label>').addClass('text-danger');
        this.__DOM__.append(this.__Note__);
    };
    Relaxcheckagent.prototype = {
        doAlarm: function() {
            this.__DOM__.addClass('arrow_box');
            alarmController._startAlarm(this.__ID__ + '_relax', true);
            this.__Note__.attr('z-lang', 'C041');
            logic._traverseLocales(this.__DOM__, rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
            this.inAlarm = true;
        },
        clearAlarm: function() {
            if (!this.inAlarm) return;
            this.__DOM__.removeClass('arrow_box');
            alarmController._clearAlarm(this.__ID__ + '_relax', false);
            this.__Note__.attr('z-lang', 'CEMPTY');
            logic._traverseLocales(this.__DOM__, rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
            this.inAlarm = false;
        },
        _checkData: function(id) {
            if (id !== this.__ID__) return;
            var relaxLimit = this.__userConfig__.relaxLimit || 0;
            var relaxAreaLimit = this.__userConfig__.relaxAreaLimit || 0;
            if (!relaxLimit && !relaxAreaLimit) return;
            var relaxCheckTimes = this.__userConfig__.relaxCheckTimes || 5000;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            var innerData = dataCollection.matrix;
            var tmpCheckFlg = false;
            var pArea = 0;
            for (var i = 0; i < innerData.length; i++) {
                for (var j = 0; j < innerData[i].length; j++) {
                    if (innerData[i][j] <= this.__noiseFilter__) continue;
                    if (commonFunc._toInt(eval(this.__viewMatrixFormula__.format(innerData[i][j]))) >= relaxLimit) tmpCheckFlg = true;
                    pArea++;
                }
            }
            if (pArea && relaxAreaLimit && (pArea * this.__oneSensorArea__ < relaxAreaLimit)) tmpCheckFlg = true;
            if (tmpCheckFlg) {
                if (!this.__relaxCheckHandle__) {
                    this.__relaxCheckHandle__ = setTimeout(this.doAlarm.bind(this), relaxCheckTimes);
                }
            } else {
                clearTimeout(this.__relaxCheckHandle__);
                this.__relaxCheckHandle__ = 0;
                this.clearAlarm();
            }
        },
        _startCheck: function() {
            this.cntChkTime = 0;
            dataLinks._registerListener('runtime', 'relaxCheck_check' + this.__ID__, this._checkData.bind(this));
        },
        _stopCheck: function() {
            this.cntChkTime = 0;
            this.__DOM__.removeClass('arrow_box');
            alarmController._clearAlarm(this.__ID__ + '_relax', false);
            this.__Note__.attr('z-lang', 'CEMPTY');
            logic._traverseLocales(this.__DOM__, rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
            dataLinks._unRegisterListener('runtime', 'relaxCheck_check' + this.__ID__);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this.__Note__.empty();
            this.__Note__ = null;
            this.__oneSensorArea__ = null;
            this.__noiseFilter__ = null;
            this.__userConfig__ = null;
            this.__relaxCheckHandle__ = null;
            this.inAlarm = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__inActived__ = null;
            this.__ID__ = null;
        }
    };
    return Relaxcheckagent;
})();