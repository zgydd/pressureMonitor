;
var Gaitanalysisagent = (function gaitanalysisagentClosure() {
    'use strict';

    function Gaitanalysisagent(productInfo) {
        this.__ID__ = productInfo.com;
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        if (!this.__PRODUCTCONFIG__.physicalSize) {
            this.__PRODUCTCONFIG__.physicalSize = {
                x: 77,
                y: 172
            };
        }
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.inGait = false;
        this.inAnalysis = false;
        this.__BTNCTRL__ = $('<button></button>').addClass('btn btn-control-gait').attr({
            'z-lang': 'P011'
        }).html('开始步态分析');
        workerCoordinator._registerWorker(this.__ID__, 'gaitAnalysis', this.gaitAnalysis.bind(this));
        this.__BTNCTRL__.on('click', this.controlGait.bind(this));
        this.__DOM__.append(this.__BTNCTRL__);
    };
    Gaitanalysisagent.prototype = {
        controlGait: function(event) {
            if (event) event.stopPropagation();
            if (this.inAnalysis) return;
            if (!this.inGait) {
                try {
                    if (this.__PRODUCTCONFIG__.autoCalibration) dataLinks._getTarget(this.__ID__).instance._forceCalibration();
                } catch (e) {
                    console.log(e);
                }
                this.tmpGaitRecord = {
                    startTimestamp: 0,
                    finishedTimestamp: 0,
                    canvasData: []
                };
                this.__BTNCTRL__.attr('z-lang', 'P010');
                logic._traverseLocales(this.__BTNCTRL__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
                this.inGait = true;
            } else {
                this.inAnalysis = true;
                this.__BTNCTRL__.addClass('disabled').attr('z-lang', 'C016');
                logic._traverseLocales(this.__BTNCTRL__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
                this.inGait = false;
                this.tmpGaitRecord.finishedTimestamp = (new Date()).getTime();
                var postData = {
                    id: this.__ID__,
                    size: this.__PRODUCTCONFIG__.size,
                    physicalSize: this.__PRODUCTCONFIG__.physicalSize,
                    startTimestamp: this.tmpGaitRecord.startTimestamp,
                    finishedTimestamp: this.tmpGaitRecord.finishedTimestamp,
                    canvasData: []
                };
                for (var i = 0; i < this.tmpGaitRecord.canvasData.length; i++) {
                    var tmpCtx = this.tmpGaitRecord.canvasData[i].screenShot.getContext("2d");
                    var tmpImg = tmpCtx.getImageData(0, 0, this.tmpGaitRecord.canvasData[i].screenShot.width, this.tmpGaitRecord.canvasData[i].screenShot.height);
                    var frame = {
                        timestamp: this.tmpGaitRecord.canvasData[i].timestamp,
                        binaryImage: commonFunc._getBinaryImage(tmpImg.data, this.tmpGaitRecord.canvasData[i].width, (this.__PRODUCTCONFIG__.radiusCoefficient || 1.2))
                    };
                    postData.canvasData.push(frame);
                }
                workerCoordinator._postGaitAnaylsisMessage(JSON.stringify(postData));
            }
        },
        gaitAnalysis: function(data) {
            //console.log(data);
            this.inAnalysis = false;
            if (!data.errMsg) {
                //console.log(this.tmpGaitRecord);
                this.__BTNCTRL__.attr('z-lang', 'C017');
                logic._traverseLocales(this.__BTNCTRL__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
                this.tmpRecordData = data;
                this.tmpGaitRecord.finishedTimestamp = data.finishedTimestamp;
                pageController._activePlayground(data, this.tmpGaitRecord, this.__ID__);
                var env = rootScope._get('_ENV_');
                if (!env.testMode) logic._interfaceConnecter('gaitRecord', this, env);
                else {
                    io._saveGaitRecord(this.tmpRecordData, this.tmpGaitRecord);
                    this._gaitRecordSavedCallback();
                }
            } else {
                this.__BTNCTRL__.removeClass('disabled').attr('z-lang', 'P011');
                logic._traverseLocales(this.__BTNCTRL__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
                this.tmpGaitRecord = null;
            }
        },
        _recordGait: function(imageData) {
            if (!this.inGait || !imageData) return;
            if (!this.tmpGaitRecord.startTimestamp) this.tmpGaitRecord.startTimestamp = (new Date()).getTime();
            if (!this.tmpGaitRecord.imgWidth) this.tmpGaitRecord.imgWidth = imageData.width;
            if (this.tmpGaitRecord.startTimestamp && !this.tmpGaitRecord.finishedTimestamp) {
                this.tmpGaitRecord.canvasData.push({
                    timestamp: (new Date()).getTime(),
                    screenShot: imageData.screenShot,
                    width: imageData.width,
                    height: imageData.height
                });
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            workerCoordinator._unRegisterWorker(this.__ID__, 'gaitAnalysis');
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
            this.inGait = null;
            this.__userConfig__ = null;
            this.tmpGaitRecord = null;
            this.inAnalysis = null;
        },
        _gaitRecordSavedCallback: function() {
            this.tmpRecordData = null;
            this.tmpGaitRecord = null;
            this.__BTNCTRL__.removeClass('disabled').attr('z-lang', 'P011');
            logic._traverseLocales(this.__BTNCTRL__.parent(), rootScope._get('_ENV_').languageMap[this.__userConfig__.lang], this.__userConfig__.lang);
            this.tmpGaitRecord = null;
        }
    };
    return Gaitanalysisagent;
})();