;
var Playground = (function playgroundClosure() {
    'use strict';

    function Playground() {
        this.__DOM__ = $('<article></article>').addClass('playground-container');
    };
    Playground.prototype = {
        clearDom: function() {
            if (this.reportTable) {
                this.reportTable.empty();
                this.reportTable = null;
            }
            if (this.controlBar) {
                commonFunc._traverseClearEvent(this.controlBar);
                this.controlBar.empty();
                this.controlBar = null;
            }
            commonFunc._traverseClearEvent(this.__DOM__);
        },
        showImage: function(event) {
            event.stopPropagation();
            var target = $(event.target);
            if (target.hasClass('shown')) target.removeClass('shown');
            else target.addClass('shown');
        },
        deleteRecord: function(event) {
            event.stopPropagation();
            confirm._setActived('keepRecord');
        },
        confirmDelete: function() {
            this.__ID__ = this.__DATA__.info.id;
            this.delPath = this.__DATA__.timestamp;
            this.tmpType = 'keepRecord';
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('delKeepRecord', this, env);
            else {
                io._deleteRecord(this.tmpType, this.delPath);
                this._delRecordDeleted();
            }
        },
        _deletedRecorDeleted: function(type) {
            switch (type) {
                case 'keepRecord':
                    this._delRecordDeleted();
                default:
                    break;
            }
        },
        _delRecordDeleted: function() {
            pageController._refreshRecordList();
            this.delPath = null;
            this.tmpType = null;
        },
        _setKeepData: function(data, returnId) {
            this.__DATA__ = data;
            this.__returnId__ = returnId;
            this.clearDom();
            this.__DOM__.empty();
            //Controller
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[(this.__DATA__.info && this.__DATA__.info.id ? this.__DATA__.info.id : 'default')].lang];
            this.__DOM__.append($('<i class="fas fa-layer-group fa-2x"></i><label z-lang="M002-record-detail-title">' + activedLang['M002-record-detail-title'] + '</label>'));
            /*
            //Playground
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.__DATA__.binaryImage.length;
            this.canvas.height = this.__DATA__.binaryImage[0].length;
            this.showAnalysisImage();
            this.__DOM__.append($(this.canvas).addClass('playground-canvas'));
            */
            if (this.__DATA__.info) {
                var innerHtml = '<table><thead><th z-lang="M002-record-list-time">' + activedLang['M002-record-list-time'] + '</th>';
                innerHtml += '<th z-lang="M002-record-list-duration">' + activedLang['M002-record-list-duration'] + '</th>';
                innerHtml += '<th z-lang="N002">' + activedLang.N002 + '</th></thead>';
                innerHtml += '<tr><td>' + (new Date(this.__DATA__.info.startTimestamp)).Format('yyyy-MM-dd hh:mm:ss') + '</td><td>' + this.__DATA__.info.duration + '</td><td>' + this.__DATA__.info.scaleTable + '</td></tr>';
                innerHtml += '</table>';
                this.__DOM__.append(innerHtml);
            }
            //Report
            var detailInfo = $('<div></div>').addClass('detail-info');
            for (var i = 0; i < this.__DATA__.canvasData.length; i++) {
                var item = $('<div></div>');
                item.append($('<img src="' + this.__DATA__.canvasData[i].screenShot.toDataURL() + '" />').on('click', this.showImage.bind(this)));
                var duration = commonFunc._getShownDifferentTime(new Date(this.__DATA__.canvasData[i].finishTimestamp), this.__DATA__.canvasData[i].startTimestamp);
                if (!duration) duration = '01\"';
                item.append($('<label>' + duration + '</label>'));
                detailInfo.append(item);
            }
            this.__DOM__.append(detailInfo);
            this.controlBar = $('<section></section>').addClass('playground-controlbar');
            var btnBack = $('<button z-lang="C018">' + activedLang.C018 + '</button>').addClass('btn');
            var btnDelete = $('<button z-lang="C027">' + activedLang.C027 + '</button>').addClass('btn');
            btnBack.on('click', logic._returnListener.bind(this));
            btnDelete.on('click', this.deleteRecord.bind(this));
            this.controlBar.append(btnBack).append(btnDelete);
            confirm._putOk('keepRecord', this.confirmDelete.bind(this));
            this.__DOM__.append(this.controlBar);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _returnCallback: function() {
            this.clearDom();
            this.__DOM__.empty();
            this.__GAITRECORD__ = null;
            this.__DATA__ = null;
            this.canvas = null;
            this.__returnId__ = null;
        },
        _destory: function() {
            this.clearDom();
            this.delPath = null;
            this.tmpType = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__DATA__ = null;
            this.__returnId__ = null;
        }
    };
    return Playground;
})();