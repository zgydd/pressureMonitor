;
var Pagetemplate = (function pagetemplateClosure() {
    'use strict';

    function Pagetemplate(productInfo, anchorElement) {
        if (!productInfo || !productInfo.hasOwnProperty('com') || !productInfo.hasOwnProperty('type') || !productInfo.hasOwnProperty('size') || !productInfo.size.hasOwnProperty('x') || !productInfo.size.hasOwnProperty('y')) return;
        this.__USECONFIG__ = rootScope._get('_ENV_').useConfig[productInfo.com];
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        if (!this.__PRODUCTCONFIG__) return;
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<article id="' + productInfo.com + '"></article>').addClass('main-container');
        this.__return__ = $('<div><i class="fas fa-chevron-left fa-3x"></i></div>').addClass('return-button');
        this.__return__.on('click', logic._returnListener);
        this.__ctrlHide__ = $('<div><i class="far fa-eye-slash fa-3x"></i></div>').addClass('return-button hide-button');
        this.__ctrlHide__.on('click', this.hidePanel.bind(this));
        this.__heatmap__ = $('<div></div>').addClass('heatmap-container');
        this.__scale__ = $('<div></div>').addClass('scale-container');
        this.__control__ = $('<div></div>').addClass('control-container');
        this.__config__ = $('<div></div>').addClass('config-container');
        this.__info__ = $('<div></div>').addClass('info-container');
        var html = '<label z-lang="P033">设备类型：</label><span>' + this.__PRODUCTCONFIG__.title[this.__USECONFIG__.lang] + '</span><label z-lang="P042">尺寸：</label><span>' + this.__PRODUCTCONFIG__.size.x + ' * ' + this.__PRODUCTCONFIG__.size.y + '</span><label z-lang="C042">默认压力单位：</label><span>mmHg</span><br /><label z-lang="P043">功能：</label>';
        for (var i = 0; i < this.__PRODUCTCONFIG__.features.length; i++) html += '<span z-lang="F-' + this.__PRODUCTCONFIG__.features[i] + '">' + this.__PRODUCTCONFIG__.features[i] + '</span>';
        html += '<br />';
        this.__info__.html(html);
        if (this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            workerCoordinator._initEdge();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            workerCoordinator._initSkeleton();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W003') >= 0) {
            workerCoordinator._initGaitAnalysis();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W008') >= 0) {
            workerCoordinator._initBodyPartDataCollection();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0) {
            this.heatmap = new Heatmapagent(productInfo);
            this.__heatmap__.append(this.heatmap._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0) {
            this.countDown = new Countdownagent(productInfo);
            this.__control__.append(this.countDown._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0 && this.heatmap) {
            this.behavior = new Behavioragent(productInfo, this.heatmap._getSize(), this.heatmap._getDom());
            this.heatmap._registerReapintListener('pageTemplate_behavoir' + this.__ID__, this.behavior._linkRepaintCallback.bind(this));
            this.__control__.append(this.behavior._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W005') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('P002') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W004') >= 0) {
            this.config = new Configagent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__config__.append(this.config._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M002') >= 0) {
            this.scale = new Scaleagent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__scale__.append(this.scale._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W007') >= 0) {
            this.dataViewer = new Datavieweragent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__control__.append(this.dataViewer._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W008') >= 0) {
            this.bodyPartCollection = new Bodypartcollectionagent(productInfo, this.heatmap._getSize(), this.__PRODUCTCONFIG__.features);
            this.__scale__.append(this.bodyPartCollection._getDom());
            this.__scale__.append(this.bodyPartCollection._getSpine());
            this.heatmap._append(this.bodyPartCollection._getCanvas());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W003') >= 0) {
            this.gaitAnalysis = new Gaitanalysisagent(productInfo);
            this.__control__.append(this.gaitAnalysis._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W004') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0 && this.heatmap) {
            this.keepRecord = new Keeprecordagent(productInfo, this.heatmap);
            this.__scale__.append(this.keepRecord._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W005') >= 0) {
            this.highNote = new Highnoteagent(productInfo, this.heatmap._getSize(), this.__PRODUCTCONFIG__.features);
            this.heatmap._append(this.highNote._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W006') >= 0) {
            this.falldownMonitor = new Falldownmonitoragent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__control__.append(this.falldownMonitor._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W009') >= 0) {
            this.saveController = new Saveagent(productInfo, this.heatmap, this.__PRODUCTCONFIG__.features);
            this.__control__.append(this.saveController._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W010') >= 0) {
            this.outputController = new Outputagent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__control__.append(this.outputController._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W011') >= 0) {
            this.relaxCheck = new Relaxcheckagent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__control__.append(this.relaxCheck._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W012') >= 0) {
            this.chronograph = new Chronographagent(productInfo);
            this.__control__.append(this.chronograph._getDom());
            //this.chronograph._start();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W013') >= 0) {
            this.statistics = new Statisticsagent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__scale__.append(this.statistics._getDom());
            //this.statistics._start();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W014') >= 0) {
            this.statisticsCollection = new Statisticscollectionagent(productInfo);
            this.__control__.append(this.statisticsCollection._getCtrl());
            this.__scale__.append(this.statisticsCollection._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W015') >= 0) {
            this.outputTestController = new Outputtestagent(productInfo, this.__PRODUCTCONFIG__.features);
            this.__control__.append(this.outputTestController._getDom());
        }
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
        if (this.__PRODUCTCONFIG__.features.indexOf('W011') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            this.behavior._registerListener('leave', 'pageTemplate_relaxCheck' + this.__ID__, this.relaxCheck._stopCheck.bind(this.relaxCheck));
            this.behavior._registerListener('back', 'pageTemplate_relaxCheck' + this.__ID__, this.relaxCheck._startCheck.bind(this.relaxCheck));
            //this.relaxCheck._startCheck();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W012') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            this.behavior._registerListener('leave', 'pageTemplate_chronograph' + this.__ID__, this.chronograph._stop.bind(this.chronograph));
            this.behavior._registerListener('back', 'pageTemplate_chronograph' + this.__ID__, this.chronograph._start.bind(this.chronograph));
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W013') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W002') >= 0) {
            this.behavior._registerListener('leave', 'pageTemplate_statistics' + this.__ID__, this.statistics._stop.bind(this.statistics));
            this.behavior._registerListener('back', 'pageTemplate_statistics' + this.__ID__, this.statistics._start.bind(this.statistics));
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W014') >= 0 && this.__PRODUCTCONFIG__.features.indexOf('W008') >= 0) {
            this.bodyPartCollection._registerListener('pageTemplate_statisticsCollection' + this.__ID__, this.statisticsCollection._statisticsCollectionLink.bind(this.statisticsCollection));
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
        this.__DOM__.append(this.__return__);
        this.__DOM__.append(this.__ctrlHide__);
        if (!this.__heatmap__.is(':empty')) this.__DOM__.append(this.__heatmap__);
        if (!this.__scale__.is(':empty')) this.__DOM__.append(this.__scale__);
        if (!this.__control__.is(':empty')) this.__DOM__.append(this.__control__);
        if (!this.__config__.is(':empty')) this.__DOM__.append(this.__config__);
        if (!this.__info__.is(':empty')) this.__DOM__.append(this.__info__);
    };
    Pagetemplate.prototype = {
        hidePanel: function(event) {
            event.stopPropagation();
            if (this.__scale__.is(":hidden")) this.__scale__.fadeIn();
            else this.__scale__.fadeOut();
            if (this.__control__.is(":hidden")) this.__control__.fadeIn();
            else this.__control__.fadeOut();
            if (this.__config__.is(":hidden")) this.__config__.fadeIn();
            else this.__config__.fadeOut();
            if (this.__info__.is(":hidden")) this.__info__.fadeIn();
            else this.__info__.fadeOut();
        },
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
            if (this.dataViewer) {
                this.dataViewer._destroy();
                this.dataViewer = null;
            }
            if (this.config) {
                this.config._destroy();
                this.config = null;
            }
            if (this.scale) {
                this.scale._destroy();
                this.scale = null;
            }
            if (this.bodyPartCollection) {
                this.bodyPartCollection._destroy();
                this.bodyPartCollection = null;
            }
            if (this.gaitAnalysis) {
                this.gaitAnalysis._destroy();
                this.gaitAnalysis = null;
            }
            if (this.keepRecord) {
                this.keepRecord._destroy();
                this.keepRecord = null;
            }
            if (this.falldownMonitor) {
                this.falldownMonitor._destroy();
                this.falldownMonitor = null;
            }
            if (this.saveController) {
                this.saveController._destroy();
                this.saveController = null;
            }
            if (this.outputController) {
                this.outputController._destroy();
                this.outputController = null;
            }
            if (this.outputTestController) {
                this.outputTestController._destroy();
                this.outputTestController = null;
            }
            if (this.relaxCheck) {
                this.relaxCheck._destroy();
                this.relaxCheck = null;
            }
            if (this.chronograph) {
                this.chronograph._destroy();
                this.chronograph = null;
            }
            if (this.statistics) {
                this.statistics._destroy();
                this.statistics = null;
            }
            if (this.statisticsCollection) {
                this.statisticsCollection._destroy();
                this.statisticsCollection = null;
            }
            if (this._scaleAnalysisWorker_) this._scaleAnalysisWorker_.terminate();
            this._scaleAnalysisWorker_ = null;
            this.__return__.off('click');
            this.__ctrlHide__.off('click');
            this.__DOM__.empty();
            this.__return__ = null;
            this.__ctrlHide__ = null;
            this.__heatmap__ = null;
            this.__scale__ = null;
            this.__control__ = null;
            this.__config__ = null;
            this.__info__ = null;
            this.__PRODUCTCONFIG__ = null;
            this.__USECONFIG__ = null;
            this.__DOM__ = null;
            this.__ID__ = null;
        },
        _refresh: function() {
            if (this.dataViewer && this.dataViewer.__inActived__) return;
            if (this.hasOwnProperty('heatmap')) {
                this.heatmap._repaint(this.__PRODUCTCONFIG__);
                if (this.hasOwnProperty('gaitAnalysis') && this.gaitAnalysis.inGait) this.gaitAnalysis._recordGait(this.heatmap._getImageData());
            }
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
        _setDefaultScale: function(scaleTable) {
            this.scale._setScaleTable(scaleTable);
            this.scale._defaultScaleTableCallback();
        },
        _setActivedScale: function(scaleTable) {
            this.scale._setScaleTable(scaleTable);
            this.scale._activedScaleTableCallback();
        },
        _setChangedScale: function(scaleTable) {
            this.scale._setScaleTable(scaleTable);
            this.scale._changedScaleTableCallback();
        },
        _setDeterminedScale: function(scaleTable) {
            this.scale._setScaleTable(scaleTable);
            this.scale._determinedScaleTableCallback();
        },
        _gaitRecordSaved: function() {
            this.gaitAnalysis._gaitRecordSavedCallback();
        },
        _keepRecordSaved: function() {
            this.keepRecord._keepRecordSavedCallback();
        },
        _saveRecordSaved: function() {
            this.saveController._saveRecordSavedCallback();
        },
        _outputCSVSaved: function() {
            this.outputController._outputCSVCallback();
            if (this.outputTestController) this.outputTestController._outputCSVCallback();
        },
        _delRecordDeleted: function(type) {}
    };
    return Pagetemplate;
})();