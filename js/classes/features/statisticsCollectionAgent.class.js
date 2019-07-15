;
var Statisticscollectionagent = (function statisticscollectionagentClosure() {
    'use strict';

    function Statisticscollectionagent(productInfo) {
        this.__ID__ = productInfo.com;
        this.__INFO__ = {
            variance: $('<label></label>'),
            head: {
                max: $('<span></span>'),
                avg: $('<span></span>'),
                area: $('<span></span>')
            },
            shoulder: {
                max: $('<span></span>'),
                avg: $('<span></span>'),
                area: $('<span></span>')
            },
            loins: {
                max: $('<span></span>'),
                avg: $('<span></span>'),
                area: $('<span></span>')
            },
            gluteus: {
                max: $('<span></span>'),
                avg: $('<span></span>'),
                area: $('<span></span>')
            },
            leg: {
                max: $('<span></span>'),
                avg: $('<span></span>'),
                area: $('<span></span>')
            },
            scale: $('<span></span>'),
            timeDiff: $('<span></span>')
        };
        this.__DOM__ = $('<div></div>').addClass('viewer statistics-collection');
        this.__DOM__.append(this.__INFO__.variance);
        var tmpTable = $('<table><thead><th z-lang="CEMPTY"></th><th z-lang="P045">MAX</th><th z-lang="P046">AVG</th><th z-lang="P047">AREA</th></thead><tbody></tbody></table>');
        this.showRange = ['head', 'shoulder', 'loins', 'gluteus', 'leg'];
        for (var i = 0; i < this.showRange.length; i++) {
            var tmpTR = $('<tr></tr>');
            tmpTR.append($('<td z-lang="BPC-' + this.showRange[i] + '"></td>'));
            tmpTR.append($('<td></td>').append(this.__INFO__[this.showRange[i]].max));
            tmpTR.append($('<td></td>').append(this.__INFO__[this.showRange[i]].avg));
            tmpTR.append($('<td></td>').append(this.__INFO__[this.showRange[i]].area));
            tmpTable.children('tbody').append(tmpTR);
        }
        this.__DOM__.append(tmpTable);
        this.__DOM__.append($('<div></div>').append('<label z-lang="BPC-scale"></label>').append(this.__INFO__.scale));
        this.__DOM__.append($('<div></div>').append('<label z-lang="P003"></label>').append(this.__INFO__.timeDiff));
        this.__CTRL__ = $('<button z-lang="B006"></button>').addClass('btn btn-show-data');
        var cfg = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__noiseFilter__ = 0;
        if (cfg && cfg.autoCalibration && cfg.noiseFilter) this.__noiseFilter__ = commonFunc._toInt(cfg.noiseFilter);
        this.__stableSamplingLimit__ = 0;
        if (cfg && cfg.stableSamplingLimit) this.__stableSamplingLimit__ = (commonFunc._toInt(cfg.stableSamplingLimit) || 10);
        this.__size__ = (cfg.size ? cfg.size : {
            x: 32,
            y: 64
        });
        this._statisticsCollectionWorker_ = new Worker('./js/workers/statisticsCollection.worker.js');
        this._statisticsCollectionWorker_.onmessage = this.statisticsCollectionCallback.bind(this);
        this.__CTRL__.on('click', this.callOutput.bind(this));
        this.startStatus = false;
    };
    Statisticscollectionagent.prototype = {
        callOutput: function(event) {
            event.stopPropagation();
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__ID__].lang];
            var postData = {
                id: this.__ID__,
                noiseFilter: this.__noiseFilter__,
                size: this.__size__,
                timestamp: (new Date()).getTime(),
                checkLimit: this.__stableSamplingLimit__,
                forceClear: false
            };
            if (!this.startStatus) {
                postData.forceStart = true;
                postData.output = false;
                this.startStatus = true;
                this.__CTRL__.attr('z-lang', 'B007').html(activedLang.B007);
            } else {
                postData.forceStart = false;
                postData.output = true;
                this.startStatus = false;
                this.__CTRL__.attr('z-lang', 'B006').html(activedLang.B006);
            }
            this._statisticsCollectionWorker_.postMessage(JSON.stringify(postData));
        },
        statisticsCollectionCallback: function(event) {
            var dataResult = JSON.parse(event.data);
            if (!dataResult) return;
            if (dataResult.id !== this.__ID__) return;
            //console.log(dataResult);
            if (!dataResult.check) {
                if (dataResult.hasOwnProperty('statisticsVariance')) this.__INFO__.variance.html(dataResult.statisticsVariance);
            } else {
                this.__INFO__.timeDiff.html(commonFunc._getShownDifferentTime((new Date()), dataResult.startTimestamp));
                this.__INFO__.scale.html(dataResult.partCollection.scale);
                for (var i = 0; i < this.showRange.length; i++) {
                    this.__INFO__[this.showRange[i]].max.html(dataResult.partCollection[this.showRange[i]].max);
                    this.__INFO__[this.showRange[i]].avg.html(dataResult.partCollection[this.showRange[i]].avg);
                    this.__INFO__[this.showRange[i]].area.html(dataResult.partCollection[this.showRange[i]].area);
                }
            }
        },
        _statisticsCollectionLink: function(matrix, partInfo) {
            if (!matrix || !commonFunc._isArray(matrix) || !matrix.length) return;
            var postData = {
                id: this.__ID__,
                data: matrix,
                noiseFilter: this.__noiseFilter__,
                size: this.__size__,
                timestamp: (new Date()).getTime(),
                checkLimit: this.__stableSamplingLimit__,
                partInfo: partInfo,
                forceStart: false,
                forceClear: false,
                output: false
            };
            this._statisticsCollectionWorker_.postMessage(JSON.stringify(postData));
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _getCtrl: function() {
            return $('<div></div>').addClass('viewer').append(this.__CTRL__);
        },
        _destroy: function() {
            this._statisticsCollectionWorker_.terminate();
            this._statisticsCollectionWorker_ = null;
            this.__CTRL__.off('click');
            this.__CTRL__.empty();
            this.__CTRL__ = null;
            this.__INFO__.empty();
            this.__INFO__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__noiseFilter__ = null;
            this.__stableSamplingLimit__ = null;
            this.__size__ = null;
            this.startStatus = null;
        }
    };
    return Statisticscollectionagent;
})();