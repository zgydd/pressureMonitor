;
var Outputagent = (function outputagentClosure() {
    'use strict';

    function Outputagent(productInfo, features) {
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
        this.__btnOutput__ = $('<button z-lang="B004">输出数据</button>').addClass('btn btn-show-data');
        this.__btnOutput__.on('click', this.outputData.bind(this));
        this.__DOM__.append(this.__btnOutput__);
        this._dataConstructionWorker_ = new Worker('./js/workers/dataConstruction.worker.js');
        this._dataConstructionWorker_.onmessage = this.dataConstructionCallback.bind(this);
        this.__bufferOutput__ = [];
        this.outputFileName = 'MCZOUTPUT';
        this.inWork = false;
    };
    Outputagent.prototype = {
        dataConstructionCallback: function(event) {
            this.inWork = false;
            if (!this.__inActived__) {
                this._dataConstructionWorker_.postMessage(JSON.stringify({
                    id: this.__ID__,
                    clear: true
                }));
                this.__bufferOutput__.length = 0;
                return;
            }
            var dataResult = JSON.parse(event.data);
            var bufferLimit = this.__splitTimes__ * 10 + 1;
            if (!dataResult) return;
            if (dataResult.id !== this.__ID__ || !dataResult.list || !dataResult.list.length) return;
            for (var i = 0; i < dataResult.list.length; i++) {
                if (!dataResult.list[i].length || dataResult.list[i].length < 4) continue;
                var line = '\'' + (new Date(dataResult.list[i][0])).Format('yyyy-MM-dd hh:mm:ss S') + ',';
                line += eval(this.__viewMatrixFormula__.format(dataResult.list[i][1])) + ',';
                line += eval(this.__viewMatrixFormula__.format(dataResult.list[i][2])) + ',';
                //line += dataResult.list[i][1] + ',';
                //line += dataResult.list[i][2] + ',';
                line += dataResult.list[i][3];
                this.__bufferOutput__.push(line);
            }
            if (this.__bufferOutput__.length < bufferLimit) return;
            this.strBuffer = this.__bufferOutput__.join('\r\n') + '\r\n';
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('outputCSV', this, env);
            else {
                io._outputCSV(this.strBuffer, this.outputFileName);
                this._outputCSVCallback();
            }
        },
        outputData: function() {
            if (!this.__inActived__) {
                this.__btnOutput__.attr('z-lang', 'B005');
                logic._traverseLocales(this.__btnOutput__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
                this.tmpMapData = {
                    key: (new Date()).getTime()
                };
                this.__bufferOutput__.length = 0;
                this.__bufferOutput__.push('TIME,MAX(mmHg),AVG(mmHg),AREA(cm2)');
                dataLinks._registerListener('runtime', 'output_refresh' + this.__ID__, this._refreshData.bind(this));
                this.__inActived__ = true;
            } else {
                this.__btnOutput__.attr('z-lang', 'B004');
                logic._traverseLocales(this.__btnOutput__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
                this.tmpMapData = null;
                dataLinks._unRegisterListener('runtime', 'output_refresh' + this.__ID__);
                this._dataConstructionWorker_.postMessage(JSON.stringify({
                    id: this.__ID__,
                    clear: true
                }));
                this.__bufferOutput__.length = 0;
                this.__inActived__ = false;
            }
        },
        _outputCSVCallback: function() {
            this.__bufferOutput__.length = 0;
            this._dataConstructionWorker_.postMessage(JSON.stringify({
                id: this.__ID__,
                clear: true
            }));
            this.strBuffer = '';
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
            };
            if (this.__features__.indexOf('P003') >= 0) postData.splitTimes = this.__splitTimes__;
            else postData.splitTimes = 1;
            if (!this.inWork) {
                //if (this.__splitTimes__ > 1 && this.__bufferOutput__.length > 1) this.__bufferOutput__.push('');
                postData.data = dataCollection.matrix;
                this._dataConstructionWorker_.postMessage(JSON.stringify(postData));
                this.inWork = true;
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this._dataConstructionWorker_.terminate();
            this._dataConstructionWorker_ = null;
            this.__btnOutput__.off('click');
            //this.__tmpPreInner__ = null;
            this.__btnOutput__ = null;
            this.__size__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__inActived__ = null;
            this.__userConfig__ = null;
            this.__viewMatrixFormula__ = null;
            this.__splitTimes__ = null;
            this.__features__ = null;
            this.__ID__ = null;
            this.strBuffer = null;
            this.__bufferOutput__ = null;
            this.outputFileName = null;
            this.inWork = null;
            this.__size__ = null;
            this.__physicalSize__ = null;
        }
    };
    return Outputagent;
})();