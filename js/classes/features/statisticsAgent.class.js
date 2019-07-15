;
var Statisticsagent = (function statisticsagentClosure() {
    'use strict';

    function Statisticsagent(productInfo, features) {
        this.__ID__ = productInfo.com;
        var sysConfig = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__viewMatrixFormula__ = (sysConfig.viewMatrixFormula ? sysConfig.viewMatrixFormula : '{0}');
        this.__splitTimes__ = ((sysConfig.splitTimes && sysConfig.splitTimes > 0) ? sysConfig.splitTimes : 1);
        this.__noiseFilter__ = 0;
        if (sysConfig) {
            if (sysConfig.autoCalibration && sysConfig.noiseFilter) this.__noiseFilter__ = commonFunc._toInt(sysConfig.noiseFilter);
            else if (sysConfig.lowLimit) this.__noiseFilter__ = commonFunc._toInt(sysConfig.lowLimit);
        }
        this.__size__ = (sysConfig.size ? sysConfig.size : {
            x: 13,
            y: 13
        });
        this.__physicalSize__ = (sysConfig.physicalSize ? sysConfig.physicalSize : {
            x: 47,
            y: 47
        });
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.__features__ = features;
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__shownInfo__ = {
            max: $('<span>0.00</span>'),
            avg: $('<span>0.00</span>'),
            area: $('<span>0.00</span>')
        };
        this.__DOM__.append($('<ul></ul>').addClass('statistics-container').append($('<li><label z-lang="P045"></label></li>').append(this.__shownInfo__.max).append('<span z-lang="U002"></span>')).append($('<li><label z-lang="P046"></label></li>').append(this.__shownInfo__.avg).append('<span z-lang="U002"></span>')).append($('<li><label z-lang="P047"></label></li>').append(this.__shownInfo__.area).append('<span z-lang="U003"></span>')));
        this._dataConstructionWorker_ = new Worker('./js/workers/dataConstruction.worker.js');
        this._dataConstructionWorker_.onmessage = this.dataConstructionCallback.bind(this);
        this.inWork = false;
    };
    Statisticsagent.prototype = {
        dataConstructionCallback: function(event) {
            this.inWork = false;
            var dataResult = JSON.parse(event.data);
            if (!dataResult) return;
            if (dataResult.id !== this.__ID__ || !dataResult.list || !dataResult.list.length) return;
            for (var i = 0; i < dataResult.list.length; i++) {
                if (!dataResult.list[i].length || dataResult.list[i].length < 4) continue;
                this.__shownInfo__.max.html(eval(this.__viewMatrixFormula__.format(dataResult.list[i][1])).toFixed(2));
                this.__shownInfo__.avg.html(eval(this.__viewMatrixFormula__.format(dataResult.list[i][2])).toFixed(2));
                this.__shownInfo__.area.html(eval(this.__viewMatrixFormula__.format(dataResult.list[i][3])).toFixed(2));
            }
        },
        _refreshData: function(id) {
            if (id !== this.__ID__) return;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            var postData = {
                id: this.__ID__,
                timeStamp: (new Date()).getTime(),
                noiseFilter: this.__noiseFilter__,
                size: this.__size__,
                physicalSize: this.__physicalSize__,
                splitTimes: 1
            };
            if (!this.inWork) {
                postData.data = dataCollection.matrix;
                this._dataConstructionWorker_.postMessage(JSON.stringify(postData));
                this.inWork = true;
            }
        },
        _start: function() {
            dataLinks._registerListener('runtime', 'statistics_refresh' + this.__ID__, this._refreshData.bind(this));
        },
        _stop: function() {
            dataLinks._unRegisterListener('runtime', 'statistics_refresh' + this.__ID__, this._refreshData);
            this.__shownInfo__.max.html('0.00');
            this.__shownInfo__.avg.html('0.00');
            this.__shownInfo__.area.html('0.00');
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this._dataConstructionWorker_.terminate();
            this._dataConstructionWorker_ = null;
            this.__size__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__inActived__ = null;
            this.__userConfig__ = null;
            this.__viewMatrixFormula__ = null;
            this.__splitTimes__ = null;
            this.__features__ = null;
            this.__ID__ = null;
            this.inWork = null;
            this.__size__ = null;
            this.__physicalSize__ = null;
        }
    };
    return Statisticsagent;
})();