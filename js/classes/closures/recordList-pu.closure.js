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
            innerHtml += '<th z-lang="M002-record-list-time">' + activedLang['M002-record-list-time'] + '</th>';
            innerHtml += '<th z-lang="M002-record-list-duration">' + activedLang['M002-record-list-duration'] + '</th>';
            innerHtml += '<th z-lang="N002">' + activedLang.N002 + '</th>';
            innerHtml += '</thead>';
            for (var i = 0; i < this.keepRecordList.length; i++) {
                var tmpHtml = '<tr id="' + this.keepRecordList[i].key + '" class="href-keep-record">';
                var hited = false;
                var info = this.keepRecordList[i].info;
                var chkStr = ((info && info.startTimestamp) ? (new Date(this.keepRecordList[i].key)).Format('yyyy-MM-dd hh:mm:ss') : '-');
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = ((info && info.duration) ? info.duration : '-');
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
                chkStr = ((info && info.scaleTable) ? info.scaleTable : '--');
                if (strFilter && chkStr.indexOf(strFilter) >= 0) {
                    chkStr = '<span class="text-success">' + chkStr + '</span>';
                    hited = true;
                }
                tmpHtml += '<td>' + chkStr + '</td>';
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
            $('.href-keep-record').off('click');
            $(this.__DOM__.find('table.keep-record-table').get(0)).empty().html(this.putList(activedLang));
            $('.href-keep-record').on('click', this.activePlayground.bind(this));
        },
        filterList: function(event) {
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
            if (this.__DOM__.find('table.keep-record-table').length <= 0) return;
            this.pageIndex = 0;
            $('.href-keep-record').off('click');
            $(this.__DOM__.find('table.keep-record-table').get(0)).empty().html(this.putList(activedLang));
            $('.href-keep-record').on('click', this.activePlayground.bind(this));
        },
        activePlayground: function(event) {
            event.stopPropagation();
            var key = event.target.id;
            if (!key) key = $(event.target).parents('tr').get(0).id;
            if (!key) return;
            var env = rootScope._get('_ENV_');
            this.activedKey = key;
            if (!env.testMode) logic._interfaceConnecter('getKeepRecord', this, env);
            else {
                io._getKeepRecord(this.activedKey, this._setActivedKeepRecord.bind(this));
            }
        },
        _setActivedKeepRecord: function(data) {
            this.activedKeepRecord = data;
            this._getKeepRecordCallback();
        },
        _getKeepRecordCallback: function() {
            pageController._activePlayground(this.activedKeepRecord, 'recordlist');
            this.activedKeepRecord = null;
            this.activedKey = null;
        },
        _initKeepList: function() {
            this.clearDom();
            this.__DOM__.empty();
            this.__return__ = $('<div></div>').addClass('return-button');
            this.__return__.on('click', logic._returnListener);
            this.__DOM__.append(this.__return__);
            var env = rootScope._get('_ENV_');
            this.onlyInfo = true;
            if (!env.testMode) logic._interfaceConnecter('keepRecordList', this, env);
            else {
                this.keepRecordList = io._getKeepRecordInfoList();
                this._keepRecordListCallback();
            }
        },
        _keepRecordListCallback: function() {
            this.onlyInfo = null;
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
            if (!this.keepRecordList || !this.keepRecordList.length) {
                this.__DOM__.append('<div class="record-main-container"><div class="title"><i class="far fa-frown-open fa-2x"></i><label class="note" z-lang="C020">' + activedLang.C020 + '</label></div></div>');
            } else {
                this.pageIndex = 0;
                var listContainer = $('<div class="record-main-container"></div>');
                var titleContainer = $('<div class="title"><i class="fas fa-history fa-2x"></i><label class="note" z-lang="N003">' + activedLang.N003 + '</label></div>');
                this.filter = {
                    head: '<i class="fas fa-search filter-head">',
                    controller: $('<input type="text" z-lang="C029" maxLength="8" placeholder="' + activedLang.C029 + '" />')
                };
                this.filter.controller.on('keyup', this.filterList.bind(this));
                titleContainer.append($('<div class="filter-container"></div>').html(this.filter.head).append(this.filter.controller));
                listContainer.append(titleContainer);
                this.paginationController = $('<div></div>').addClass('pagination');
                var innerHtml = '<div class="table-container"><table class="keep-record-table">';
                innerHtml += this.putList(activedLang);
                innerHtml += '</table></div>';
                listContainer.append($(innerHtml)).append(this.paginationController);
                this.__DOM__.append(listContainer);
                $('.href-keep-record').on('click', this.activePlayground.bind(this));
            }
            pageController._activePage('recordlist');
        },
        _setKeepList: function(data) {
            this.keepRecordList = data;
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destory: function() {
            this.filter.controller.off('keyup');
            this.clearDom();
            this.filter.controller.empty();
            this.filter.controller = null;
            this.__return__ = null;
            this.filter = null;
            this.paginationController.empty();
            this.paginationController = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.keepRecordList = null;
            this.onlyInfo = null;
            this.activedKey = null;
            this.pageIndex = null;
            this.pageCount = null;
        }
    };
    return Recordlist;
})();