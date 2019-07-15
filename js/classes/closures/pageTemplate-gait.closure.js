;
var Pagetemplate = (function pagetemplateClosure() {
    'use strict';

    function Pagetemplate(productInfo) {
        if (!productInfo || !productInfo.hasOwnProperty('com') || !productInfo.hasOwnProperty('type') || !productInfo.hasOwnProperty('size') || !productInfo.size.hasOwnProperty('x') || !productInfo.size.hasOwnProperty('y')) return;
        this.__USECONFIG__ = rootScope._get('_ENV_').useConfig[productInfo.com];
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        if (!this.__PRODUCTCONFIG__) return;
        this.__ID__ = productInfo.com;
        if (this.__PRODUCTCONFIG__.features.indexOf('W003') >= 0) {
            workerCoordinator._initGaitAnalysis();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0) {
            this.heatmap = new Heatmapagent(productInfo);
            $('main>.main-container>.heatmap-container>.container').append(this.heatmap._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W001') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W005') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('P002') >= 0 || this.__PRODUCTCONFIG__.features.indexOf('W004') >= 0) {
            this.config = new Configagent(productInfo, this.__PRODUCTCONFIG__.features);
            $('main>.main-container>.title>.right').prepend(this.config._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W003') >= 0) {
            this.gaitAnalysis = new Gaitanalysisagent(productInfo);
            $('main>.main-container>.heatmap-container>.controller').append(this.gaitAnalysis._getDom());
        }
        $('main>.main-container>.heatmap-container').show();
        $('main>.main-container>.record-list-container').hide();
        $('main>.main-container>.user-list-container').hide();
        $('main>.main-container>.playground-container').hide();
        confirm._init($('.over-lay'), this.__ID__);
    };
    Pagetemplate.prototype = {
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            workerCoordinator._checkCloseWorker();
            if (this.heatmap) {
                this.heatmap._destroy();
                this.heatmap = null;
            }
            if (this.dataViewer) {
                this.dataViewer._destroy();
                this.dataViewer = null;
            }
            if (this.config) {
                this.config._destroy();
                this.config = null;
            }
            if (this.gaitAnalysis) {
                this.gaitAnalysis._destroy();
                this.gaitAnalysis = null;
            }
            this.__DOM__.empty();
            this.__heatmap__ = null;
            this.__config__ = null;
            this.__PRODUCTCONFIG__ = null;
            this.__DOM__ = null;
            this.__ID__ = null;
        },
        _refresh: function() {
            if (this.hasOwnProperty('heatmap')) {
                this.heatmap._repaint(this.__PRODUCTCONFIG__);
                if (this.hasOwnProperty('gaitAnalysis') && this.gaitAnalysis.inGait) this.gaitAnalysis._recordGait(this.heatmap._getImageData());
            }
        },
        _changeNav: function(id) {
            if (!id) return;
            $('main>.main-container>.playground-container').hide();
            switch (id) {
                case 'nav-heatmap':
                    $('main>.main-container>.heatmap-container').show();
                    $('main>.main-container>.record-list-container').hide();
                    $('main>.main-container>.user-list-container').hide();
                    break;
                case 'nav-history':
                    $('main>.main-container>.heatmap-container').hide();
                    $('main>.main-container>.record-list-container').show();
                    $('main>.main-container>.user-list-container').hide();
                    pageController._activeRecordList('gait');
                    break;
                case 'nav-usrInfo':
                    $('main>.main-container>.heatmap-container').hide();
                    $('main>.main-container>.record-list-container').hide();
                    $('main>.main-container>.user-list-container').show();
                    break;
                default:
                    break;
            }
        },
        _gaitRecordSaved: function() {
            this.gaitAnalysis._gaitRecordSavedCallback();
        }
    };
    return Pagetemplate;
})();