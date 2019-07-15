;
var Recordlist = (function recordlistClosure() {
    'use strict';

    function Recordlist() {
        this.__DOM__ = $('<article></article>').addClass('record-list-container');
    };
    Recordlist.prototype = {
        clearDom: function() {
            commonFunc._traverseClearEvent(this.__DOM__);
        },
        _initGaitList: function() {
            this.clearDom();
            this.__DOM__.empty();
            this.__return__ = $('<div></div>').addClass('return-button');
            this.__return__.on('click', logic._returnListener);
            this.__DOM__.append(this.__return__);
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('gaitList', this, env);
            else {
                this.gaitList = io._getGaitList();
                this._gaitListCallback();
            }
        },
        _setGaitList: function(data) {
            this.gaitList = data;
        },
        _setActivedGaitRecord: function(data) {
            this.activedGaitRecord = data;
            this._getGaitRecordCallback();
        },
        _gaitListCallback: function() {
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (!this.gaitList || !this.gaitList.length) {
                this.__DOM__.append('<div><label class="note" z-lang="C020">' + activedLang.C020 + '</label></div>');
            } else {
                var listContainer = $('<div><label class="note" z-lang="F-W003">' + activedLang['F-W003'] + '</label></div>');
                var innerHtml = '<table class="gait-report-table">';
                innerHtml += '<tr>';
                innerHtml += '<th z-lang="P003">' + activedLang.P003 + '</th>';
                innerHtml += '<th z-lang="P004">' + activedLang.P004 + '</th>';
                innerHtml += '<th z-lang="P005">' + activedLang.P005 + '</th>';
                innerHtml += '<th z-lang="P006">' + activedLang.P006 + '</th>';
                innerHtml += '<th z-lang="P007">' + activedLang.P007 + '</th>';
                innerHtml += '<th z-lang="P008">' + activedLang.P008 + '</th>';
                innerHtml += '</tr>';
                for (var i = 0; i < this.gaitList.length; i++) {
                    var keepTimes = this.gaitList[i].finishedTimestamp - this.gaitList[i].startTimestamp;
                    innerHtml += '<tr>';
                    innerHtml += '<td><a id="' + this.gaitList[i].key + '" class="href-gait-record">' + (new Date(this.gaitList[i].startTimestamp)).Format('yyyy-MM-dd hh:mm:ss') + '~' + (new Date(this.gaitList[i].finishedTimestamp)).Format('yyyy-MM-dd hh:mm:ss') + '</a></td>';
                    innerHtml += '<td>' + commonFunc._toFixed((this.gaitList[i].analysisData.report.stepCount / (keepTimes / 60000)), 1) + '</td>';
                    innerHtml += '<td>' + commonFunc._toFixed(this.gaitList[i].analysisData.report.avgStepLength, 1) + '</td>';
                    innerHtml += '<td>' + commonFunc._toFixed((this.gaitList[i].analysisData.report.samplingDist / (keepTimes / 1000)), 1) + '</td>';
                    innerHtml += '<td>' + commonFunc._toFixed(this.gaitList[i].analysisData.report.stepLengthDeviation, 1) + '</td>';
                    innerHtml += '<td>' + commonFunc._toFixed(this.gaitList[i].analysisData.report.stepWidth, 1) + '</td>';
                    innerHtml += '</tr>';
                }
                listContainer.append($(innerHtml));
                this.__DOM__.append(listContainer);
                $('.href-gait-record').on('click', logic._activeGaitListener.bind(this));
            }
            pageController._activePage('recordlist');
            this.keepRecordList = null;
        },
        _activeGaitRecord: function(key) {
            var analysisData = null;
            for (var i = 0; i < this.gaitList.length; i++) {
                if (commonFunc._chkEqual(this.gaitList[i].key, key)) {
                    analysisData = JSON.parse(JSON.stringify(this.gaitList[i].analysisData));
                    break;
                }
            }
            if (!analysisData) return;
            var env = rootScope._get('_ENV_');
            this.activedKey = key;
            this.activedAnalysisData = analysisData;
            if (!env.testMode) logic._interfaceConnecter('getGaitRecord', this, env);
            else {
                io._getGaitRecord(this.activedKey, this._setActivedGaitRecord.bind(this));
            }
        },
        _getGaitRecordCallback: function() {
            if (!this.activedGaitRecord.startTimestamp || !this.activedGaitRecord.finishedTimestamp || !this.activedGaitRecord.canvasData || !this.activedGaitRecord.canvasData.length) return;
            for (var i = 0; i < this.activedGaitRecord.canvasData.length; i++) {
                this.activedGaitRecord.canvasData[i].width = this.activedAnalysisData.binaryImage[0].length;
                this.activedGaitRecord.canvasData[i].height = this.activedAnalysisData.binaryImage.length;
            }
            pageController._activePlayground(this.activedAnalysisData, this.activedGaitRecord, 'recordlist');
            this.activedAnalysisData = null;
            this.activedGaitRecord = null;
            this.activedKey = null;
        },
        _initKeepList: function() {
            this.clearDom();
            this.__DOM__.empty();
            this.__return__ = $('<div></div>').addClass('return-button');
            this.__return__.on('click', logic._returnListener);
            this.__DOM__.append(this.__return__);
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('keepRecordList', this, env);
            else {
                this.keepRecordList = io._getKeepRecordList();
                this._keepRecordListCallback();
            }
        },
        _keepRecordListCallback: function() {
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (!this.keepRecordList || !this.keepRecordList.length) {
                this.__DOM__.append('<div><label class="note" z-lang="C020">' + activedLang.C020 + '</label></div>');
            } else {
                var listContainer = $('<div><label class="note" z-lang="F-W004">' + activedLang['F-W004'] + '</label></div>');
                var innerHtml = '<div class="keep-record-container">';
                for (var i = 0; i < this.keepRecordList.length; i++) {
                    innerHtml += '<ul><li>' + (new Date(this.keepRecordList[i].key)).Format('yyyy-MM-dd hh:mm:ss') + '</li><li id="idxKeep' + i + '">';
                    for (var j = 0; j < this.keepRecordList[i].data.length; j++) {
                        //console.log(this.keepRecordList[i].data[j]);
                        innerHtml += '<ul class="map-container" style="display:none;"><li><img src="" /></li><li>' + (new Date(this.keepRecordList[i].data[j].startTimestamp)).Format('hh:mm:ss') + '~' + (new Date(this.keepRecordList[i].data[j].finishedTimestamp)).Format('hh:mm:ss') + '</li></ul>';
                    }
                    innerHtml += '</li><li class="href-keep-record">' + this.keepRecordList[i].data.length + '</li></ul>';
                }
                innerHtml += '</div>';
                listContainer.append($(innerHtml));
                this.__DOM__.append(listContainer);
                $('.href-keep-record').on('click', logic._activeKeepRecordListener.bind(this));
            }
            pageController._activePage('recordlist');
            this.gaitList = null;
        },
        _loadMap: function(index, target) {
            index = commonFunc._toInt(index);
            if (!target.length || index >= this.keepRecordList.length) return false;
            var tmpImgs = target.children('li:first-child');
            for (var i = 0; i < tmpImgs.length; i++) {
                if (i >= this.keepRecordList[index].data.length) break;
                if ($(tmpImgs[i]).children('img').attr('src')) continue;
                $(tmpImgs[i]).children('img').attr('src', 'data:image/png;base64,' + this.keepRecordList[index].data[i].base64);
            }
            return true;
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destory: function() {
            this.__return__.off('click');
            this.__return__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.gaitList = null;
            this.keepRecordList = null;
            this.activedAnalysisData = null;
            this.activedGaitRecord = null;
            this.activedKey = null;
        }
    };
    return Recordlist;
})();