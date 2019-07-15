;
var Outputtestagent = (function outputtestagentClosure() {
    'use strict';

    function Outputtestagent(productInfo, features) {
        this.__ID__ = productInfo.com;
        var sysConfig = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__viewMatrixFormula__ = (sysConfig.viewMatrixFormula ? sysConfig.viewMatrixFormula : '{0}');
        this.__testWait__ = (sysConfig.testWait ? sysConfig.testWait : [50, 30]);
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
        this.__btnOutput__ = $('<button z-lang="B004-1">输出测试数据</button>').addClass('btn btn-show-data');
        this.__btnOutput__.on('click', this.outputData.bind(this));
        this.__DOM__.append(this.__btnOutput__);
        this._testConstructionWorker_ = new Worker('./js/workers/testConstruction.worker.js');
        this._testConstructionWorker_.onmessage = this.testConstructionCallback.bind(this);
        this.__bufferOutput__ = [];
        this.outputFileName = 'MCZOUTPUT';
        this.inWork = false;
    };
    Outputtestagent.prototype = {
        testConstructionCallback: function(event) {
            this.inWork = false;
            if (!this.__inActived__) {
                this._testConstructionWorker_.postMessage(JSON.stringify({
                    id: this.__ID__,
                    clear: true
                }));
                //this.__bufferOutput__.length = 0;
                return;
            }
            var dataResult = JSON.parse(event.data);
            if (!dataResult || dataResult.id !== this.__ID__ || !dataResult.list || !dataResult.list.length) return;
            for (var i = 0; i < dataResult.list.length; i++) {
                if (!dataResult.list[i].length || dataResult.list[i].length < 10) continue;
                var row = [];
                row.push(dataResult.list[i][0]);
                row.push(eval(this.__viewMatrixFormula__.format(dataResult.list[i][1])));
                row.push(eval(this.__viewMatrixFormula__.format(dataResult.list[i][2])));
                row.push(dataResult.list[i][3]);
                row.push(dataResult.list[i][4]);
                row.push(dataResult.list[i][5]);
                row.push(dataResult.list[i][6]);
                row.push(dataResult.list[i][7]);
                row.push(dataResult.list[i][8]);
                row.push(dataResult.list[i][9]);
                this.__bufferOutput__.push(row);
            }
        },
        outputData: function() {
            if (this.__inActived__) return;
            this.__btnOutput__.addClass('hidden');
            //this.__btnOutput__.attr('z-lang', 'B005-1');
            //logic._traverseLocales(this.__btnOutput__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
            this.__bufferOutput__.length = 0;
            dataLinks._registerListener('runtime', 'outputTest_refresh' + this.__ID__, this._refreshData.bind(this));
            var that = this;
            setTimeout(function() {
                that.__inActived__ = true;
                var that2 = that;
                setTimeout(function() {
                    that2._outputCSV();
                    that2.__inActived__ = false;
                }, that.__testWait__[1] * 1000);
            }, this.__testWait__[0] * 1000);
        },
        _outputCSV: function() {
            this.strBuffer = 'TIME,MAX(mmHg),AVG(mmHg),AREA(cm2),MAX,AVG,AREA(point),oneSenserArea(cm2),AVG31,AREA31(point)\r\n';
            var cursor = 0;
            var a = 0;
            var b = 0;
            var c = 0;
            var d = 0;
            var e = 0;
            var f = 0;
            var g = 0;
            var h = 0;
            var i = 0;
            var j = 0;
            for (cursor; cursor < this.__bufferOutput__.length; cursor++) {
                a += this.__bufferOutput__[cursor][0];
                b += this.__bufferOutput__[cursor][1];
                c += this.__bufferOutput__[cursor][2];
                d += this.__bufferOutput__[cursor][3];
                e += this.__bufferOutput__[cursor][4];
                f += this.__bufferOutput__[cursor][5];
                g += this.__bufferOutput__[cursor][6];
                h += this.__bufferOutput__[cursor][7];
                i += this.__bufferOutput__[cursor][8];
                j += this.__bufferOutput__[cursor][9];
            }
            a /= cursor;
            a = '\'' + (new Date(a)).Format('yyyy-MM-dd hh:mm:ss S');
            b /= cursor;
            c /= cursor;
            d /= cursor;
            e /= cursor;
            f /= cursor;
            g /= cursor;
            h /= cursor;
            i /= cursor;
            j /= cursor;
            this.strBuffer += a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ',' + g + ',' + h + ',' + i + ',' + j + ',' + cursor + ',' + '\r\n';
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('outputCSV', this, env);
            else {
                io._outputCSV(this.strBuffer, this.outputFileName);
                this._outputCSVCallback();
            }
        },
        _outputCSVCallback: function() {
            this.__btnOutput__.removeClass('hidden');
            this.__btnOutput__.attr('z-lang', 'B004-1');
            logic._traverseLocales(this.__btnOutput__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
            dataLinks._unRegisterListener('runtime', 'outputTest_refresh' + this.__ID__);
            this._testConstructionWorker_.postMessage(JSON.stringify({
                id: this.__ID__,
                clear: true
            }));
            this.__bufferOutput__.length = 0;
            this.__inActived__ = false;
            if (!alarmController._isInAlarm()) alarmController._startAlarm(this.__ID__ + '_testOutputCompleted', true);
            var that = this;
            setTimeout(function() {
                alarmController._clearAlarm(that.__ID__ + '_testOutputCompleted', false);
            }, 2000);
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
            if (!this.inWork) {
                //if (this.__splitTimes__ > 1 && this.__bufferOutput__.length > 1) this.__bufferOutput__.push('');
                postData.data = dataCollection.matrix;
                this._testConstructionWorker_.postMessage(JSON.stringify(postData));
                this.inWork = true;
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this._testConstructionWorker_.terminate();
            this._testConstructionWorker_ = null;
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
    return Outputtestagent;
})();