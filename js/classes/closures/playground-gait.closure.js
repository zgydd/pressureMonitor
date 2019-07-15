;
var Playground = (function playgroundClosure() {
    'use strict';

    function Playground() {
        this.__DOM__ = $('<article></article>').addClass('playground-container');
    };
    Playground.prototype = {
        replayGait: function() {
            if (this.__GAITRECORD__.canvasData.length <= 0 || this.__GAITRECORD__.canvasData.length <= this.frameIndex) {
                this.tmpFrameCanvas = null;
                this.replayPlayground.empty();
                this.replayPlayground.remove();
                this.replayPlayground = null;
                this.frameIndex = null;
                this.controlBar.children('button.btn').each(function(i, n) {
                    var ele = $(n).removeClass('disabled');
                });
                return;
            }
            var context = this.tmpFrameCanvas.getContext("2d");
            var nextIndex = this.frameIndex + 1;
            var nextTimeout = 1000;
            if (nextIndex < this.__GAITRECORD__.canvasData.length) nextTimeout = this.__GAITRECORD__.canvasData[nextIndex].timestamp - this.__GAITRECORD__.canvasData[this.frameIndex].timestamp;
            var imgData = context.getImageData(0, 0, this.tmpFrameCanvas.width, this.tmpFrameCanvas.height);
            var tmpCtx = this.__GAITRECORD__.canvasData[this.frameIndex].screenShot.getContext("2d");
            var tmpImg = tmpCtx.getImageData(0, 0, this.__GAITRECORD__.canvasData[this.frameIndex].screenShot.width, this.__GAITRECORD__.canvasData[this.frameIndex].screenShot.height);
            for (var i = 0; i < tmpImg.data.length; i++) {
                if (imgData.data.length <= i) break;
                imgData.data[i] = tmpImg.data[i];
            }
            context.putImageData(imgData, 0, 0);
            this.frameIndex = nextIndex;
            setTimeout(this.replayGait.bind(this), nextTimeout);
        },
        clearDom: function() {
            if (this.screenShoot) {
                this.screenShoot.empty();
                this.screenShoot = null;
            }
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
        saveUserInfo: function(event) {
            event.stopPropagation();
            if (this.__userInfo__.btnSubmit.hasClass('disabled') || this.__userInfo__.infoName.val().trim() === '') return;
            this.__userInfo__.btnSubmit.addClass('disabled');
            if (!this.__DATA__.userInfo) this.__DATA__.userInfo = {};
            this.__DATA__.userInfo.name = this.__userInfo__.infoName.val().trim();
            this.__DATA__.userInfo.note = this.__userInfo__.infoNote.val().trim();
            this.__ID__ = this.__DATA__.id;
            this.tmpRecordData = this.__DATA__;
            this.tmpGaitRecord = this.__GAITRECORD__;
            var env = rootScope._get('_ENV_');
            var currentUser = {
                index: 0,
                name: this.__DATA__.userInfo.name,
                sex: 0,
                age: 0,
                times: 1
            };
            var i = 0;
            //var maxIndex = 0;
            for (i = 0; i < env.userList.length; i++) {
                if (this.__DATA__.userInfo.key && commonFunc._chkEqual(this.__DATA__.userInfo.key, env.userList[i].index)) {
                    if (!this.times || !commonFunc._chkEqual(this.times, env.userList[i].times)) env.userList[i].times = commonFunc._toInt(env.userList[i].times) + 1;
                    break;
                }
                //maxIndex = Math.max(env.userList[i].index, maxIndex);
            }
            if (i >= env.userList.length) currentUser.index = commonFunc._getRandomKey(); //maxIndex + 1
            else {
                currentUser.index = env.userList[i].index;
                currentUser.name = env.userList[i].name;
                currentUser.sex = env.userList[i].sex;
                currentUser.age = env.userList[i].age;
                currentUser.times = this.times;
            }
            if (this.__userInfo__.chkSaveUserList.prop("checked") && i >= env.userList.length) {
                this.__DATA__.userInfo.key = currentUser.index;
                env.userList.push(currentUser);
            }
            if (!env.testMode) logic._interfaceConnecter('gaitRecord', this, env);
            else this._gaitRecordSavedCallback();
        },
        deleteRecord: function(event) {
            event.stopPropagation();
            confirm._setActived('gaitRecord');
        },
        confirmDelete: function() {
            this.__ID__ = this.__DATA__.id;
            this.delPath = this.__DATA__.startTimestamp + '-' + this.__DATA__.finishedTimestamp;
            this.tmpType = 'gaitRecord';
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('delGaitRecord', this, env);
            else {
                io._deleteRecord(this.tmpType, this.delPath);
                this._delRecordDeleted();
            }
        },
        _deletedRecorDeleted: function(type) {
            switch (type) {
                case 'gaitRecord':
                    this._delRecordDeleted();
                default:
                    break;
            }
        },
        _gaitRecordSavedCallback: function() {
            pageController._refreshRecordList();
            pageController._outerRefreshUserList();
            this.tmpRecordData = null;
            this.tmpGaitRecord = null;
            this.__ID__ = null;
            this.__userInfo__.btnSubmit.removeClass('disabled');
        },
        _delRecordDeleted: function() {
            pageController._refreshRecordList();
            this.delPath = null;
            this.tmpType = null;
        },
        checkUserInfo: function(event) {
            if (!this.__userInfo__.selectsContainer.hasClass('hidden')) this.__userInfo__.selectsContainer.addClass('hidden');
            commonFunc._traverseClearEvent(this.__userInfo__.selectsContainer);
            this.__userInfo__.selectsContainer.empty();
            this.__userInfo__.infos.empty();
            var userList = rootScope._get('_ENV_').userList;
            if (!userList || !userList.length) return;
            var target = $(event.target);
            var value = target.val().trim();
            if (!value) {
                if (this.__DATA__.userInfo && this.__DATA__.userInfo.key) delete this.__DATA__.userInfo.key;
                return;
            }
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__DATA__.id].lang];
            var hited = false;
            this.__userInfo__.selectsContainer.css({
                left: target.offset().left + target.outerWidth() + 2,
                top: target.offset().top - 2
            });
            for (var i = 0; i < userList.length; i++) {
                if (userList[i].name.indexOf(value) >= 0) {
                    var tmpHited = $('<tr id="check_u_' + userList[i].index + '"><td class="name">' + userList[i].name + '</td><td><span class="age">' + userList[i].age + '</span><span class="unit-age" z-lang="C037">' + activedLang.C037 + '</span></td><td class="sex" z-lang="C035S' + userList[i].sex + '">' + activedLang['C035S' + userList[i].sex] + '</td></tr>');
                    tmpHited.on('click', this.setExistUser.bind(this));
                    hited = true;
                    this.__userInfo__.selectsContainer.append(tmpHited);
                }
            }
            if (hited) this.__userInfo__.selectsContainer.removeClass('hidden');
        },
        setExistUser: function(event) {
            var id = event.target.id;
            if (!id) {
                id = $(event.target).parents('tr');
                if (!id.length) return;
                id = id.get(0).id;
                if (!id) return;
            }
            id = id.replace('check_u_', '');
            if (!id) return;
            var targetUser = null;
            var userList = rootScope._get('_ENV_').userList;
            if (!userList || !userList.length) return;
            for (var i = 0; i < userList.length; i++) {
                if (commonFunc._chkEqual(userList[i].index, id)) {
                    targetUser = userList[i];
                    break;
                }
            }
            if (!targetUser) return;
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__DATA__.id].lang];
            if (!this.__DATA__.userInfo) this.__DATA__.userInfo = {};
            this.__DATA__.userInfo.key = targetUser.index;
            this.__userInfo__.infoName.val(targetUser.name);
            this.__userInfo__.infos.html('<span class="age">' + targetUser.age + '</span><span class="unit-age" z-lang="C037">' + activedLang.C037 + '</span><span class="sex" z-lang="C035S' + targetUser.sex + '">' + activedLang['C035S' + targetUser.sex] + '</span>');
            this.__userInfo__.selectsContainer.addClass('hidden');
        },
        _setGaitData: function(analysisData, gaitRecord, returnId) {
            this.__DATA__ = logic._formatGaitData(analysisData);
            this.__GAITRECORD__ = gaitRecord;
            this.__returnId__ = returnId ? returnId : this.__DATA__.id;
            this.clearDom();
            this.__DOM__.empty();
            //Controller
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__DATA__.id].lang];
            this.__DOM__.append($('<label z-lang="P009">' + activedLang['P009'] + '</label>').addClass('prn-note'));
            this.__DOM__.append($('<label z-lang="W003-user-info">' + activedLang['W003-user-info'] + '</label>'));
            this.__userInfo__ = {
                container: $('<div class="user-info"></div>'),
                titleName: $('<label z-lang="W003-user-name">' + activedLang['W003-user-name'] + '</label>'),
                titleNote: $('<label z-lang="W003-user-content">' + activedLang['W003-user-content'] + '</label>'),
                infos: $('<span></span>').addClass('info-container'),
                selectsContainer: $('<table></table>').addClass('user-select-container hidden'),
                infoName: $('<input type="text" class="user-name" maxlength="10" />').val(((this.__DATA__.userInfo && this.__DATA__.userInfo.name) ? this.__DATA__.userInfo.name : '')),
                infoNote: $('<textarea type="text" class="note"  maxlength="200" />').val(((this.__DATA__.userInfo && this.__DATA__.userInfo.note) ? this.__DATA__.userInfo.note : '')),
                btnSubmit: $('<button class="btn" z-lang="C026">' + activedLang.C026 + '</button>').addClass('prn-disabled'),
                chkSaveUserList: $('<input class="check-save-user hidden" type="checkbox" checked /><span class="check-save-user hidden" z-lang="W003-user-save-list">' + activedLang['W003-user-save-list'] + '</span>')
            };
            var userList = env.userList;
            var targetUser = null;
            if (userList && userList.length && this.__DATA__.userInfo && this.__DATA__.userInfo.key) {
                for (var i = 0; i < userList.length; i++) {
                    if (commonFunc._chkEqual(userList[i].index, this.__DATA__.userInfo.key)) {
                        targetUser = userList[i];
                        break;
                    }
                }
            }
            if ((targetUser && !commonFunc._chkEqual(this.__userInfo__.infoName.val(), targetUser.name)) || (!targetUser && this.__DATA__.userInfo && this.__DATA__.userInfo.key)) {
                //if (targetUser && !commonFunc._chkEqual(this.__userInfo__.infoName.val(), targetUser.name)) this.__userInfo__.infoName.val('');
                //this.__userInfo__.infoName.addClass('important-warning');
                this.__userInfo__.infoName.attr({
                    'title': activedLang['W003-user-name-conflict'],
                    'z-lang': 'W003-user-name-conflict'
                });
                delete this.__DATA__.userInfo.key;
            }
            if (targetUser) {
                this.__userInfo__.infos.html('<span class="age">' + targetUser.age + '</span><span class="unit-age" z-lang="C037">' + activedLang.C037 + '</span><span class="sex" z-lang="C035S' + targetUser.sex + '">' + activedLang['C035S' + targetUser.sex] + '</span>');
                if (commonFunc._chkEqual(this.__returnId__, 'recordlist')) this.times = commonFunc._toInt(targetUser.times);
            }
            this.__userInfo__.infoName.on('keyup', this.checkUserInfo.bind(this));
            this.__userInfo__.infoName.on('blur', function() {
                setTimeout(function() {
                    if (!this.__userInfo__.selectsContainer.hasClass('hidden')) this.__userInfo__.selectsContainer.addClass('hidden');
                }.bind(this), 500);
            }.bind(this));
            this.__DOM__.append(this.__userInfo__.container.append(this.__userInfo__.titleName).append(this.__userInfo__.infoName).append(this.__userInfo__.infos).append(this.__userInfo__.titleNote).append(this.__userInfo__.infoNote).append($('<div></div>').append(this.__userInfo__.btnSubmit).append(this.__userInfo__.chkSaveUserList)).append(this.__userInfo__.selectsContainer));
            /*
            //Playground
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.__DATA__.binaryImage.length;
            this.canvas.height = this.__DATA__.binaryImage[0].length;
            this.showAnalysisImage();
            this.__DOM__.append($(this.canvas).addClass('playground-canvas'));
            */
            //Report
            this.__DOM__.append($('<label z-lang="W003-train-detail">' + activedLang['W003-train-detail'] + '</label>'));
            var htmlInfo = '<div class="detail-info">';
            htmlInfo += '<span z-lang="W003-train-time">' + activedLang['W003-train-time'] + '</span>';
            htmlInfo += '<span>' + (new Date(this.__DATA__.startTimestamp)).Format('yyyy-MM-dd hh:mm:ss') + '</span>'; //'~' + (new Date(this.__DATA__.finishedTimestamp)).Format('yyyy-MM-dd hh:mm:ss') + 
            htmlInfo += '<span z-lang="W003-train-duration">' + activedLang['W003-train-duration'] + '</span>';
            htmlInfo += '<span>' + commonFunc._getShownDifferentTime((new Date(this.__DATA__.finishedTimestamp)), this.__DATA__.startTimestamp) + '</span>';
            htmlInfo += '</div>';
            this.__DOM__.append($(htmlInfo));
            if (this.__DATA__.finishedTimestamp && this.__DATA__.startTimestamp && this.__DATA__.report) {
                var objReference = {
                    amplitude: {
                        min: 100,
                        max: 160
                    },
                    deviation: {
                        min: 0,
                        max: 5
                    },
                    speed: {
                        min: 110,
                        max: 160
                    },
                    frequency: {
                        min: 95,
                        max: 125
                    },
                    length: {
                        min: 50,
                        max: 80
                    }
                }
                var keepTimes = this.__DATA__.finishedTimestamp - this.__DATA__.startTimestamp;
                this.reportTable = $('<section></section>').addClass('gait-report-container');
                var env = rootScope._get('_ENV_');
                var activedLang = env.languageMap[env.useConfig[this.__DATA__.id].lang];
                var innerHtml = '<table class="gait-report-table">';
                innerHtml += '<thead>';
                innerHtml += '<th z-lang="C025">' + activedLang.C025 + '</th>';
                innerHtml += '<th z-lang="P013">' + activedLang.P013 + '</th>';
                //innerHtml += '<th z-lang="P014">' + activedLang.P014 + '</th>';
                innerHtml += '<th z-lang="C025">' + activedLang.C025 + '</th>';
                innerHtml += '<th z-lang="P015">' + activedLang.P015 + '</th>';
                innerHtml += '<th z-lang="P016">' + activedLang.P016 + '</th>';
                //innerHtml += '<th z-lang="P014">' + activedLang.P014 + '</th>';
                innerHtml += '</thead>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P004">' + activedLang.P004 + '</span></td>';
                var avgStepFrequency = this.__DATA__.report.stepCount / (keepTimes / 60000);
                //if (objReference.frequency.min <= avgStepFrequency && objReference.frequency.max >= avgStepFrequency) innerHtml += '<td class="success">' + commonFunc._toFixed(avgStepFrequency, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(avgStepFrequency, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(avgStepFrequency, 1) + '</td>';
                //innerHtml += '<td>' + objReference.frequency.min + '~' + objReference.frequency.max + '</td>';
                //innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P017">' + activedLang.P017 + '</span></td>';
                //if (objReference.length.min <= this.__DATA__.report.avgLeftStepLength && objReference.length.max >= this.__DATA__.report.avgLeftStepLength) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.avgLeftStepLength, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.avgLeftStepLength, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgLeftStepLength, 1) + '</td>';
                //if (objReference.length.min <= this.__DATA__.report.avgRightStepLength && objReference.length.max >= this.__DATA__.report.avgRightStepLength) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.avgRightStepLength, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.avgRightStepLength, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgRightStepLength, 1) + '</td>';
                //innerHtml += '<td>' + objReference.length.min + '~' + objReference.length.max + '</td>';
                //innerHtml += '<td>~</td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P005">' + activedLang.P005 + '</span></td>';
                //if (objReference.amplitude.min <= this.__DATA__.report.avgStepLength && objReference.amplitude.max >= this.__DATA__.report.avgStepLength) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.avgStepLength, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.avgStepLength, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgStepLength, 1) + '</td>';
                //innerHtml += '<td>' + objReference.amplitude.min + '~' + objReference.amplitude.max + '</td>';
                //innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P018">' + activedLang.P018 + '</span>(&deg;)</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgRightAngle, 1) + '</td>';
                //innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P006">' + activedLang.P006 + '</span></td>';
                var avgStepSpeed = this.__DATA__.report.samplingDist / (keepTimes / 1000);
                //if (objReference.speed.min <= avgStepSpeed && objReference.speed.max >= avgStepSpeed) innerHtml += '<td class="success">' + commonFunc._toFixed(avgStepSpeed, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(avgStepSpeed, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(avgStepSpeed, 1) + '</td>';
                //innerHtml += '<td>' + objReference.speed.min + '~' + objReference.speed.max + '</td>';
                //innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P019">' + activedLang.P019 + '</span>(&deg;)</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.minLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.minRightAngle, 1) + '</td>';
                //innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P007">' + activedLang.P007 + '</span></td>';
                //if (objReference.deviation.min <= this.__DATA__.report.stepLengthDeviation && objReference.deviation.max >= this.__DATA__.report.stepLengthDeviation) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.stepLengthDeviation, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.stepLengthDeviation, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.stepLengthDeviation, 1) + '</td>';
                //innerHtml += '<td>' + objReference.deviation.min + '~' + objReference.deviation.max + '</td>';
                //innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P020">' + activedLang.P020 + '</span>(&deg;)</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.maxLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.maxRightAngle, 1) + '</td>';
                //innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P008">' + activedLang.P008 + '</span></td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.stepWidth, 1) + '</td>';
                //innerHtml += '<td></td>';
                innerHtml += '<td class="left midline"><span z-lang="P021">' + activedLang.P021 + '</span></td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.varianceLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.varianceRightAngle, 1) + '</td>';
                //innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '</table>';
                this.reportTable.html(innerHtml);
                this.__DOM__.append(this.reportTable);
            }
            this.controlBar = $('<section></section>').addClass('playground-controlbar prn-disabled');
            var btnBack = $('<button z-lang="C018">' + activedLang.C018 + '</button>').addClass('btn');
            var btnReplay = $('<button z-lang="P012">' + activedLang.P012 + '</button>').addClass('btn');
            var btnPrint = $('<button z-lang="C019">' + activedLang.C019 + '/button>').addClass('btn');
            var btnDelete = $('<button z-lang="C027">' + activedLang.C027 + '</button>').addClass('btn');
            this.__userInfo__.btnSubmit.on('click', this.saveUserInfo.bind(this));
            btnBack.on('click', logic._returnListener.bind(this));
            btnReplay.on('click', logic._replayListener.bind(this));
            btnPrint.on('click', function() {
                window.print();
            });
            btnDelete.on('click', this.deleteRecord.bind(this));
            this.controlBar.append(btnBack).append(btnPrint).append(btnReplay).append(btnDelete);
            confirm._putOk('gaitRecord', this.confirmDelete.bind(this));
            this.__DOM__.append(this.controlBar);
        },
        _startReplayGait: function() {
            if (!this.__GAITRECORD__ || !this.__GAITRECORD__.canvasData || !this.__GAITRECORD__.canvasData.length) return;
            this.controlBar.children('button.btn').each(function(i, n) {
                var ele = $(n).addClass('disabled');
            });
            this.frameIndex = 0;
            this.tmpFrameCanvas = document.createElement('canvas');
            this.tmpFrameCanvas.width = this.__GAITRECORD__.canvasData[0].screenShot.width;
            this.tmpFrameCanvas.height = this.__GAITRECORD__.canvasData[0].screenShot.height;
            this.replayPlayground = $('<div></div>').addClass('replay-playground').append(this.tmpFrameCanvas);
            this.__DOM__.append(this.replayPlayground);
            this.replayGait();
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
            this.tmpFrameCanvas = null;
            this.replayPlayground.empty();
            this.replayPlayground.remove();
            this.replayPlayground = null;
            this.frameIndex = null;
            this.__userInfo__.container.empty();
            this.__userInfo__.titleName.empty();
            this.__userInfo__.titleNote.empty();
            this.__userInfo__.infoName.empty();
            this.__userInfo__.infoNote.empty();
            this.__userInfo__.btnSubmit.off('click');
            this.__userInfo__.btnSubmit.empty();
            this.__DOM__.empty();
            this.__userInfo__.container = null;
            this.__userInfo__.titleName = null;
            this.__userInfo__.titleNote = null;
            this.__userInfo__.infoName = null;
            this.__userInfo__.infoNote = null;
            this.__userInfo__.btnSubmit = null;
            this.__DOM__ = null;
            this.__GAITRECORD__ = null;
            this.__DATA__ = null;
            this.canvas = null;
            this.__returnId__ = null;
            this.times = null;
        }
    };
    return Playground;
})();