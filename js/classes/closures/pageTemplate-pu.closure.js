;
var Pagetemplate = (function pagetemplateClosure() {
    'use strict';

    function Pagetemplate(productInfo) {
        if (!productInfo || !productInfo.hasOwnProperty('com') || !productInfo.hasOwnProperty('type') || !productInfo.hasOwnProperty('size') || !productInfo.size.hasOwnProperty('x') || !productInfo.size.hasOwnProperty('y')) return;
        this.__USECONFIG__ = rootScope._get('_ENV_').useConfig[productInfo.com];
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        if (!this.__PRODUCTCONFIG__) return;
        this.__ID__ = productInfo.com;
        if (this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            workerCoordinator._initEdge();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            workerCoordinator._initSkeleton();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0) {
            this.heatmap = new Heatmapagent(productInfo);
            $('main>.main-container>.heatmap-container>.container').append(this.heatmap._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0) {
            this.countDown = new Countdownagent(productInfo);
            $('main>.main-container>.heatmap-container>.controller>div.left>div.info .count-down').append(this.countDown._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0 && this.heatmap) {
            this.behavior = new Behavioragent(productInfo, this.heatmap._getSize(), this.heatmap._getDom());
            this.heatmap._registerReapintListener('pageTemplate_behavoir' + this.__ID__, this.behavior._linkRepaintCallback.bind(this));
            //$('main>.main-container>.heatmap-container>.controller>div.left>div.info').append(this.behavior._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M002') >= 0) {
            this.scale = new Scaleagent(productInfo, this.__PRODUCTCONFIG__.features);
            $('main>.main-container>.scale-container').append(this.scale._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W004') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0 && this.heatmap) {
            this.keepRecord = new Keeprecordagent(productInfo, this.heatmap);
            //$('main>.main-container>.heatmap-container>.controller').append(this.keepRecord._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W005') >= 0) {
            this.highNote = new Highnoteagent(productInfo, this.heatmap._getSize(), this.__PRODUCTCONFIG__.features);
            this.heatmap._append(this.highNote._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W006') >= 0) this.falldownMonitor = new Falldownmonitoragent(productInfo, this.__PRODUCTCONFIG__.features);
        //Features connection listener
        if (this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            this.behavior._registerListener('leave', 'pageTemplate_countDown' + this.__ID__, this.countDown._stop.bind(this.countDown));
            this.behavior._registerListener('back', 'pageTemplate_countDown' + this.__ID__, this.countDown._reset.bind(this.countDown));
            this.behavior._registerListener('turn', 'pageTemplate_countDown' + this.__ID__, this.countDown._reset.bind(this.countDown));
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W004') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            this.behavior._registerListener('leave', 'pageTemplate_keepRecord' + this.__ID__, this.keepRecord._stopRecord.bind(this.keepRecord));
            this.behavior._registerListener('back', 'pageTemplate_keepRecord' + this.__ID__, this.keepRecord._startRecord.bind(this.keepRecord));
            this.behavior._registerListener('turn', 'pageTemplate_keepRecord' + this.__ID__, this.keepRecord._sendRecord.bind(this.keepRecord));
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W005') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            this.behavior._registerListener('leave', 'pageTemplate_highNote' + this.__ID__, this.highNote._clear.bind(this.highNote));
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('M002') >= 0 && typeof(Worker) !== undefined) {
            this._scaleAnalysisWorker_ = new Worker('./js/workers/dataAnalysis.worker.js');
            this._scaleAnalysisWorker_.onmessage = this._scaleAnalysisCallback.bind(this);
            if (this.scale.activedCountDown) this.countDown._start(this.scale.activedCountDown);
            var target = dataLinks._getTarget(this.__ID__);
            if (target && target.productInfo && target.instance) {
                var innerData = target.instance._getDataCollection((this.__PRODUCTCONFIG__.features.indexOf('P002') >= 0)).matrix;
                var chkFlg = false;
                for (var i = 0; i < innerData.length; i++) {
                    for (var j = 0; j < innerData[i].length; j++) {
                        var value = commonFunc._toInt(innerData[i][j]);
                        if (commonFunc._toInt(this.__USECONFIG__.lowerLimit) > 0 && value / this.__PRODUCTCONFIG__.maxLimit <= commonFunc._toInt(this.__USECONFIG__.lowerLimit) / 100) value = 0;
                        if (value <= 0) continue;
                        chkFlg = true;
                        break;
                    }
                }
                if (!chkFlg) this.countDown._stop();
            }
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W005') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('P002') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W004') >= 0) {
            this.config = new Configagent(productInfo, this.__PRODUCTCONFIG__.features);
            $('main>.main-container>.title>.right').prepend(this.config._getDom());
        }
        $('main>.main-container>.heatmap-container').show();
        $('main>.main-container>.record-list-container').hide();
        $('main>.main-container>.scale-container').hide();
        $('main>.main-container>.playground-container').hide();
        confirm._init($('.over-lay'), this.__ID__);
    };
    Pagetemplate.prototype = {
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            workerCoordinator._checkCloseWorker();
            if (this.heatmap && this.behavior) {
                this.heatmap._unRegisterReapintListener('pageTemplate_behavoir' + this.__ID__);
            }
            if (this.heatmap) {
                this.heatmap._destroy();
                this.heatmap = null;
            }
            if (this.countDown) {
                this.countDown._destroy();
                this.countDown = null;
            }
            if (this.behavior) {
                this.behavior._destroy();
                this.behavior = null;
            }
            if (this.config) {
                this.config._destroy();
                this.config = null;
            }
            if (this.scale) {
                this.scale._destroy();
                this.scale = null;
            }
            if (this.keepRecord) {
                this.keepRecord._destroy();
                this.keepRecord = null;
            }
            if (this.falldownMonitor) {
                this.falldownMonitor._destroy();
                this.falldownMonitor = null;
            }
            if (this._scaleAnalysisWorker_) this._scaleAnalysisWorker_.terminate();
            this._scaleAnalysisWorker_ = null;
            this.__DOM__.empty();
            this.__heatmap__ = null;
            this.__config__ = null;
            this.__PRODUCTCONFIG__ = null;
            this.__DOM__ = null;
            this.__ID__ = null;
        },
        _refresh: function() {
            if (this.hasOwnProperty('heatmap')) this.heatmap._repaint(this.__PRODUCTCONFIG__);
            if (this._scaleAnalysisWorker_ && commonFunc._toInt(this.__USECONFIG__.countDownType) === 1 && this.countDown._started() && !this.countDown._stoped()) {
                var target = dataLinks._getTarget(this.__ID__);
                if (!target || !target.productInfo || !target.instance) return;
                var cd = this.countDown._getRestTimestamp();
                if (!cd) return;
                var useConfig = rootScope._get('_ENV_').useConfig[this.__ID__] || rootScope._get('_ENV_').useConfig.default;
                var dataCollection = target.instance._getDataCollection((this.__PRODUCTCONFIG__.features.indexOf('P002') >= 0));
                var innerData = null;
                innerData = dataCollection.percentage;
                if (!innerData) return;
                var postData = {};
                postData.innerData = innerData;
                postData.maxLimit = this.__PRODUCTCONFIG__.maxLimit;
                postData.cd = cd;
                postData.presureRanges = commonFunc._toInt(this.scale.scaleTable.presureRange);
                postData.baseScale = this.scale.baseScale;
                postData.pressureScale = this.scale.pressureScale;
                postData.threshold = this.scale.scaleTable.threshold;
                this._scaleAnalysisWorker_.postMessage(JSON.stringify(postData));
                if (this.scale.needReset) {
                    this.countDown._reset(this.scale.activedCountDown);
                    this.scale.needReset = null;
                }
            }
        },
        _scaleAnalysisCallback: function(event) {
            //console.log(event);
            var dataResult = JSON.parse(event.data);
            this.countDown._reset(dataResult.cd);
            this.scale.pressureScale = dataResult.scale - this.scale.baseScale;
            this.scale._refreshScale();
        },
        _changeNav: function(id) {
            if (!id) return;
            $('main>.main-container>.playground-container').hide();
            switch (id) {
                case 'nav-heatmap':
                    $('main>.main-container>.heatmap-container').show();
                    $('main>.main-container>.record-list-container').hide();
                    $('main>.main-container>.scale-container').hide();
                    break;
                case 'nav-history':
                    $('main>.main-container>.heatmap-container').hide();
                    $('main>.main-container>.record-list-container').show();
                    $('main>.main-container>.scale-container').hide();
                    pageController._activeRecordList('keep');
                    break;
                case 'nav-scale':
                    $('main>.main-container>.heatmap-container').hide();
                    $('main>.main-container>.record-list-container').hide();
                    $('main>.main-container>.scale-container').show();
                    break;
                default:
                    break;
            }
        }
    };
    return Pagetemplate;
})();