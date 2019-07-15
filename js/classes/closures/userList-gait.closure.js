;
var Userlist = (function userlistClosure() {
    'use strict';

    function Userlist() {
        this.__DOM__ = $('<article></article>').addClass('user-list-container');
        var env = rootScope._get('_ENV_');
        var activedLang = env.languageMap[env.useConfig['default'].lang];
        if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
        this.userList = env.userList;
        this.controller = {
            container: $('<div class="controller"></div>'),
            add: $('<button class="btn"><i class="fas fa-user-plus"></i><span z-lang="C034">' + activedLang.C034 + '</span></button>'),
            save: $('<button class="btn"><i class="fas fa-save"></i><span z-lang="C026">' + activedLang.C026 + '</span></button>')
        };
        this.refreshList();
    };
    Userlist.prototype = {
        clearDom: function() {
            commonFunc._traverseClearEvent(this.__DOM__);
        },
        insertRow: function() {
            //var currentIndex = 0;
            //if (this.userList && this.userList.length) {
            //    for (var i = 0; i < this.userList.length; i++) currentIndex = Math.max(currentIndex, this.userList[i].index);
            //}
            //currentIndex++;
            this.userList.unshift({
                index: commonFunc._getRandomKey(), //currentIndex
                name: '',
                sex: 0,
                age: 0,
                times: 0
            });
            this.saveUserList();
        },
        putList: function(activedLang) {
            var innerHtml = '';
            var rowCount = 0;
            innerHtml += '<thead>';
            innerHtml += '<th z-lang="C024">' + activedLang.C024 + '</th>';
            innerHtml += '<th z-lang="C036">' + activedLang.C036 + '</th>';
            innerHtml += '<th z-lang="C035">' + activedLang.C035 + '</th>';
            //innerHtml += '<th z-lang="W003-train-times">' + activedLang['W003-train-times'] + '</th>';
            innerHtml += '<th z-lang="C027">' + activedLang.C027 + '</th>';
            innerHtml += '</thead>';
            for (var i = 0; i < this.userList.length; i++) {
                var tmpHtml = '<tr>';
                tmpHtml += '<td class="editable"><input type="text" maxLength="10" id="t_u_name_' + this.userList[i].index + '" value="' + this.userList[i].name + '"></td>';
                tmpHtml += '<td class="editable"><input type="number" oninput="if(value>200)value=200" id="n_u_age_' + this.userList[i].index + '" value="' + this.userList[i].age + '"></td>';
                tmpHtml += '<td class="editable"><select id="s_u_sex_' + this.userList[i].index + '">';
                for (var j = 0; j < 2; j++) {
                    tmpHtml += '<option z-lang="C035S' + j + '" value=' + j;
                    if (this.userList[i].sex === j) tmpHtml += ' selected';
                    tmpHtml += '>' + activedLang['C035S' + j] + '</option>'
                }
                tmpHtml += '</select></td>';
                //tmpHtml += '<td>' + this.userList[i].times + '</td>';
                tmpHtml += '<td><i class="fas fa-user-minus fa-lg" id="del_u_' + this.userList[i].index + '"></i></td>';
                tmpHtml += '</tr>';
                rowCount++;
                if (rowCount > 12 * this.pageIndex && rowCount < 12 * (this.pageIndex + 1) - 1) innerHtml += tmpHtml;
            }
            this.setPagination(rowCount);
            return innerHtml;
        },
        changeValue: function(event) {
            if (!event.target.id) return;
            var arrTargetInfo = event.target.id.split('_');
            if (!arrTargetInfo || arrTargetInfo.length < 4) return;
            var index = arrTargetInfo[3];
            var type = arrTargetInfo[0];
            var info = arrTargetInfo[2];
            var changed = false;
            for (var i = 0; i < this.userList.length; i++) {
                if (commonFunc._chkEqual(this.userList[i].index, index) && !commonFunc._chkEqual(this.userList[i][info], $(event.target).val())) {
                    switch (info) {
                        case 'sex':
                        case 'age':
                            this.userList[i][info] = commonFunc._toInt($(event.target).val());
                            break;
                        default:
                            this.userList[i][info] = $(event.target).val();
                            break;
                    }
                    changed = true;
                    break;
                }
            }
            //if (changed) $(event.target).parents('td').addClass('success');
        },
        deleteRecord: function(event) {
            if (!event.target.id) return;
            this.arrTargetInfo = event.target.id.split('_');
            confirm._setActived('userRecord');
        },
        confirmDelete: function() {
            if (!this.arrTargetInfo || this.arrTargetInfo.length < 3 || !this.arrTargetInfo[2]) return;
            for (var i = 0; i < this.userList.length; i++) {
                if (commonFunc._chkEqual(this.userList[i].index, this.arrTargetInfo[2])) {
                    this.userList.splice(i, 1);
                    break;
                }
            }
            this.arrTargetInfo = null;
            this.saveUserList();
        },
        saveUserList: function() {
            this.saveInfo = [];
            for (var i = 0; i < this.userList.length; i++) {
                if (this.userList[i].name.trim() !== '') this.saveInfo.push(JSON.parse(JSON.stringify(this.userList[i])));
            }
            if (!this.saveInfo.length) {
                this.refreshList();
                return;
            }
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('saveUserList', this, env);
            else {
                io._saveUserList(this.saveInfo);
                this._userListSavedCallback();
            }
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
            $('main>.main-container div.record-main-container table.user-list-table td>select').off('change');
            $('main>.main-container div.record-main-container table.user-list-table td>input').off('blur');
            $(this.__DOM__.find('table.user-list-table').get(0)).empty().html(this.putList(activedLang));
            $('main>.main-container div.record-main-container table.user-list-table td>select').on('change', this.changeValue.bind(this));
            $('main>.main-container div.record-main-container table.user-list-table td>input').on('blur', this.changeValue.bind(this));
            $('main>.main-container div.record-main-container table.user-list-table td>i.fa-user-minus').on('click', this.deleteRecord.bind(this));
        },
        refreshList: function() {
            this.clearDom();
            this.__DOM__.empty();
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig['default'].lang];
            if (env.useConfig.hasOwnProperty('matxTmp')) activedLang = env.languageMap[env.useConfig['matxTmp'].lang];
            if (!this.userList || !this.userList.length) {
                this.__DOM__.append($('<div class="record-main-container"><i class="far fa-frown-open fa-2x"></i></div>').append($('<label class="note" z-lang="C020">' + activedLang.C020 + '</label>')).append(this.controller.container.append(this.controller.add)));
            } else {
                this.pageIndex = 0;
                var listContainer = $('<div class="record-main-container"></div>');
                var titleContainer = $('<div class="title"><i class="fas fa-hiking fa-2x"></i><label class="note" z-lang="W003-user-info">' + activedLang['W003-user-info'] + '</label><span class="subtitle" z-lang="W003-user-list-subtitle">' + activedLang['W003-user-list-subtitle'] + '</span></div>');
                listContainer.append(titleContainer);
                this.paginationController = $('<div></div>').addClass('pagination');
                var innerHtml = '<div class="table-container"><table class="user-list-table">';
                innerHtml += this.putList(activedLang);
                innerHtml += '</table></div>';
                listContainer.append($(innerHtml)).append(this.paginationController).append(this.controller.container.append(this.controller.add).append(this.controller.save));
                this.__DOM__.append(listContainer);
            }
            this.controller.add.on('click', this.insertRow.bind(this));
            this.controller.save.on('click', this.saveUserList.bind(this));
            $('main>.main-container div.record-main-container table.user-list-table td>select').on('change', this.changeValue.bind(this));
            $('main>.main-container div.record-main-container table.user-list-table td>input').on('blur', this.changeValue.bind(this));
            $('main>.main-container div.record-main-container table.user-list-table td>i.fa-user-minus').on('click', this.deleteRecord.bind(this));
            confirm._putOk('userRecord', this.confirmDelete.bind(this));
        },
        _userListSavedCallback: function() {
            this.saveInfo.length = 0;
            this.saveInfo = null;
            this.refreshList();
        },
        _outerSaveUserList: function() {
            var env = rootScope._get('_ENV_');
            this.userList = env.userList;
            this.saveInfo = env.userList.clone();
            if (!env.testMode) logic._interfaceConnecter('saveUserList', this, env);
            else {
                io._saveUserList(this.saveInfo);
                this._userListSavedCallback();
            }
        },
        _getDom: function() {
            var that = this;
            setTimeout(function() {
                $('main>.main-container div.record-main-container table.user-list-table td>select').on('change', that.changeValue.bind(that));
                $('main>.main-container div.record-main-container table.user-list-table td>input').on('blur', that.changeValue.bind(that));
                $('main>.main-container div.record-main-container table.user-list-table td>i.fa-user-minus').on('click', that.deleteRecord.bind(that));
            }, 200);
            return this.__DOM__;
        },
        _destory: function() {
            this.clearDom();
            this.controller.add.empty();
            this.controller.add = null;
            this.controller.save.empty();
            this.controller.save = null;
            this.controller.container.empty();
            this.controller.container = null;
            this.controller = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.userList = null;
            this.pageIndex = null;
            this.saveInfo = null;
            this.pageCount = null;
        }
    };
    return Userlist;
})();