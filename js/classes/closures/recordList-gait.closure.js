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
        putList: function(activedLang) {
            this.filter.controller.addClass('disabled');
            var strFilter = this.filter.controller.val().trim();
            var innerHtml = '';
            var rowCount = 0;
            innerHtml += '<thead>';
            innerHtml += '<th z-lang="C024">' + activedLang.C024 + '</th>';
            innerHtml += '<th z-lang="P004">' + activedLang.P004 + '</th>';
            innerHtml += '<th z-lang="P005">' + activedLang.P005 + '</th>';
            innerHtml += '<th z-lang="P006">' + activedLang.P006 + '</th>';
            innerHtml += '<th z-lang="P007">' + activedLang.P007 + '</th>';
            innerHtml += '<th z-lang="P008">' + activedLang.P008 + '</th>';
            innerHtml += '<th z-lang="P003">' + activedLang.P003 + '</th>';
            innerHtml += '<th z-lang="C028">' + activedLang.C028 + '</th>';
            innerHtml += '</thead>';
            for (var i = 0; i < this.gaitList.length; i++) {
                var keepTimes = this.gaitList[i].finishedTimestamp - this.gaitList[i].startTimestamp;
                var userInfo = this.gaitList[i].analysisData.userInfo;
                var tmpHtml = '<tr id="' + this.gaitList[i].key + '" class="href-gait-record">';
                var hited = false;
                var chkStr = ((userInfo && userInfo.name) ? userInfo.name : '-');
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = commonFunc._toFixed((this.gaitList[i].analysisData.report.stepCount / (keepTimes / 60000)), 1);
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = commonFunc._toFixed(this.gaitList[i].analysisData.report.avgStepLength, 1);
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = commonFunc._toFixed((this.gaitList[i].analysisData.report.samplingDist / (keepTimes / 1000)), 1);
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = commonFunc._toFixed(this.gaitList[i].analysisData.report.stepLengthDeviation, 1);
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = commonFunc._toFixed(this.gaitList[i].analysisData.report.stepWidth, 1);
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = (new Date(this.gaitList[i].startTimestamp)).Format('yyyy-MM-dd hh:mm:ss'); // + '~' + (new Date(this.gaitList[i].finishedTimestamp)).Format('yyyy-MM-dd hh:mm:ss');
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                var showNote = ((userInfo && userInfo.note) ? userInfo.note : '-');
                if (strFilter && showNote.indexOf(strFilter) >= 0) {
                    chkStr = 'hited';
                    hited = true;
                }
                if (showNote.length > 0 && showNote.length > 10) showNote = showNote.substring(0, 10) + '...';
                if (chkStr === 'hited') showNote = '<span class="text-success">' + showNote + '</span>';
                tmpHtml += '<td>' + showNote + '</td>';
                tmpHtml += '</tr>';
                if (strFilter === '') hited = true;
                if (hited) rowCount++;
                if (hited && rowCount > 12 * this.pageIndex && rowCount <= 12 * (this.pageIndex + 1)) innerHtml += tmpHtml;
            }
            this.setPagination(rowCount);
            this.filter.controller.removeClass('disabled');
            return innerHtml;
        },
        setPagination: function(count) {
            if (this.pageIndex === 0) {
                commonFunc._traverseClearEvent(this.paginationController);
                this.paginationController.empty();
                var env = rootScope._get('_ENV_');
                var activedLang = env.languageMap[env.useConfig['default'].lang];
                if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
                this.pageCount = commonFunc._toInt(count / 12);
                if (count % 12 !== 0) this.pageCount += 1;
                if (this.pageCount < 2) return;
                var pre = $('<span class="disabled" id="pg_pre"><i class="fas fa-chevron-left"></i></span>');
                pre.on('click', function(event) {
                    if (this.pageIndex <= 0) return;
                    this.pageIndex--;
                    this.changePagination();
                }.bind(this));
                this.paginationController.append(pre);
                for (var i = 0; i < this.pageCount; i++) {
                    var ctrl = $('<span id="pg_' + i + '">' + (i + 1) + '</span>');
                    if (i === this.pageIndex) ctrl.addClass('actived');
                    ctrl.on('click', this.changePagination.bind(this));
                    this.paginationController.append(ctrl);
                }
                var next = $('<span id="pg_next"><i class="fas fa-chevron-right"></i></span>');
                if (this.pageCount <= 1) next.addClass('disabled');
                next.on('click', function(event) {
                    if (this.pageIndex >= this.pageCount - 1) return;
                    this.pageIndex++;
                    this.changePagination();
                }.bind(this));
                this.paginationController.append(next);
                this.paginationController.append($('<label z-lang="C031">' + activedLang.C031 + '</label>' + this.pageCount + '<label z-lang="C032">' + activedLang.C032 + '</label>&emsp;' + count + '<label z-lang="C033">' + activedLang.C033 + '</label>'));
            } else {
                this.paginationController.children('span').each(function(i, n) {
                    $(n).removeClass('actived');
                    $(n).removeClass('disabled');
                    if (n.id === 'pg_' + this.pageIndex) $(n).addClass('actived');
                    if (this.pageIndex === 0 && n.id === 'pg_pre') $(n).addClass('disabled');
                    if (this.pageIndex >= this.pageCount - 1 && n.id === 'pg_next') $(n).addClass('disabled');
                }.bind(this));
            }
        },
        changePagination: function(event) {
            if (event) {
                event.stopPropagation();
                this.pageIndex = commonFunc._toInt(event.target.id.replace('pg_', ''));
            }
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
            $('.href-gait-record').off('click');
            $(this.__DOM__.find('table.gait-report-table').get(0)).empty().html(this.putList(activedLang));
            $('.href-gait-record').on('click', logic._activeGaitListener.bind(this));
        },
        filterList: function(event) {
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
            if (this.__DOM__.find('table.gait-report-table').length <= 0) return;
            this.pageIndex = 0;
            $('.href-gait-record').off('click');
            $(this.__DOM__.find('table.gait-report-table').get(0)).empty().html(this.putList(activedLang));
            $('.href-gait-record').on('click', logic._activeGaitListener.bind(this));
        },
        _initGaitList: function() {
            this.clearDom();
            this.__DOM__.empty();
            //this.__return__ = $('<div></div>').addClass('return-button');
            //this.__return__.on('click', logic._returnListener);
            //this.__DOM__.append(this.__return__);
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('gaitList', this, env);
            else {
                this.gaitList = io._getGaitList();
                this._gaitListCallback();
            }
        },
        _setGaitList: function(data) {
            this.gaitList = data.sort(function(a, b) {
                return b.startTimestamp - a.startTimestamp;
            });
        },
        _setActivedGaitRecord: function(data) {
            this.activedGaitRecord = data;
            this._getGaitRecordCallback();
        },
        _gaitListCallback: function() {
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
            if (!this.gaitList || !this.gaitList.length) {
                this.__DOM__.append('<div class="record-main-container"><i class="far fa-frown-open fa-2x"></i><label class="note" z-lang="C020">' + activedLang.C020 + '</label></div>');
            } else {
                this.pageIndex = 0;
                var listContainer = $('<div class="record-main-container"></div>');
                var titleContainer = $('<div class="title"><i class="fas fa-history fa-2x"></i><label class="note" z-lang="W003-recordlist-title">' + activedLang['W003-recordlist-title'] + '</label></div>');
                this.filter = {
                    head: '<i class="fas fa-search filter-head">',
                    controller: $('<input type="text" z-lang="C029" maxLength="8" placeholder="' + activedLang.C029 + '" />')
                };
                this.filter.controller.on('keyup', this.filterList.bind(this));
                //this.filter.controller.on('blur', this.filterList.bind(this));
                titleContainer.append($('<div class="filter-container"></div>').html(this.filter.head).append(this.filter.controller));
                listContainer.append(titleContainer);
                this.paginationController = $('<div></div>').addClass('pagination');
                var innerHtml = '<div class="table-container"><table class="gait-report-table">';
                innerHtml += this.putList(activedLang);
                innerHtml += '</table></div>';
                listContainer.append($(innerHtml)).append(this.paginationController);
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
                this.activedGaitRecord.canvasData[i].width = this.activedGaitRecord.canvasData[0].screenShot.width;
                this.activedGaitRecord.canvasData[i].height = this.activedGaitRecord.canvasData[0].screenShot.height;
            }
            pageController._activePlayground(this.activedAnalysisData, this.activedGaitRecord, 'recordlist');
            this.activedAnalysisData = null;
            this.activedGaitRecord = null;
            this.activedKey = null;
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destory: function() {
            this.filter.controller.off('keyup');
            //this.filter.controller.off('blur');
            this.clearDom();
            this.filter.controller.empty();
            this.filter.controller = null;
            this.__return__ = null;
            this.filter = null;
            this.paginationController.empty();
            this.paginationController = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.gaitList = null;
            this.keepRecordList = null;
            this.activedAnalysisData = null;
            this.activedGaitRecord = null;
            this.activedKey = null;
            this.pageIndex = null;
            this.pageCount = null;
        }
    };
    return Recordlist;
})();