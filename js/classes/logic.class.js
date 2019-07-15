;
(function(name, context, factory) {
    // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("logic", this, function() {
    'use strict';
    var __privateCollection__ = {
        specialConfigTarget: ['DEVICE_SET'],
        testMode: false,
        envList: {
            nwSerialPort: -1,
            nwMQTT: 3,
            nwWebSocket: 4,
            nwAddonMatx: 5
        },
        environment: 5, //-1-nwSerialPort; 1-android; 2-iOS; 3-nwMQTT; 4-nwWebSocket; 5-nwAddon-matx
        gradientRange: ["rgb(1,0,220)", "rgb(0,159,253)", "rgb(0,226,253)", "rgb(48,254,5)", "rgb(202,255,0)", "rgb(252,255,13)", "rgb(252,146,2)", "rgb(249,97,0)", "rgb(255,0,13)"]
    };
    var traverseLocales = function(childElements, languageMap, langKey) {
        childElements.each(function(i, n) {
            var ele = $(n);
            var attr = ele.attr('z-lang');
            if (attr && (languageMap.hasOwnProperty(attr) || (attr === 'sptitle') || (attr.indexOf('spproduct') >= 0))) {
                var placeholder = ele.attr('placeholder');
                if (placeholder) ele.attr('placeholder', languageMap[attr]);
                switch (true) {
                    case (attr === 'sptitle'):
                        var title = undefined;
                        try {
                            title = rootScope._get('_ENV_').systemConfig[dataLinks._getTarget(n.id.replace('nav-btn-', '')).productInfo.type].title;
                        } catch (e) {}
                        if (typeof title === 'object' && title.hasOwnProperty(langKey)) ele.html(title[langKey]);
                        break;
                    default:
                        ele.html(languageMap[attr]);
                        if (ele.attr('title')) ele.attr('title', languageMap[attr]);
                        break;
                }
                return;
            }
            if (ele.children().length) {
                traverseLocales(ele.children(), languageMap, langKey);
            }
        });
    };
    var factory = {
        _init: function() {
            var env = {
                testMode: __privateCollection__.testMode
            };
            if (!__privateCollection__.testMode && !__privateCollection__.environment) {
                switch (true) {
                    case (typeof nw !== 'undefined'):
                        __privateCollection__.environment = -1;
                        break;
                    case (typeof window.MyApp !== 'undefined'):
                        __privateCollection__.environment = 1;
                        break;
                        //case (ios):
                        //    __privateCollection__.environment = 2;
                        //    break;
                    default:
                        __privateCollection__.environment = 0;
                        break;
                }
            } else {}
            env.environment = __privateCollection__.environment;
            return env;
        },
        _enterInitStream: function() {
            if (!__privateCollection__.testMode) {
                switch (__privateCollection__.environment) {
                    case 1:
                        window.MyApp.callDefaultSystemConfig();
                        break;
                    case 2:
                        break;
                    default:
                        rootScope._get('_ENV_').systemConfig = commonFunc._getJson('./assets/jsons/systemconfig.json') || {};
                        callbackStream._defaultSystemConfigCallback();
                        break;
                }
            } else {
                rootScope._get('_ENV_').systemConfig = commonFunc._getJson('./assets/jsons/systemconfig.json') || {};
                callbackStream._defaultSystemConfigCallback();
            }
        },
        _startLogicLoop: function() {
            var sysConfig = rootScope._get('_ENV_').systemConfig;
            if (sysConfig.hasOwnProperty('DEVICE_SET') && __privateCollection__.envList.hasOwnProperty(sysConfig.DEVICE_SET)) rootScope._get('_ENV_').environment = __privateCollection__.environment = __privateCollection__.envList[sysConfig.DEVICE_SET];
            switch (true) {
                case (__privateCollection__.testMode):
                    //Test Mode
                    nwController._init();
                    serialPool._init();
                    mqttPool._init();
                    socketPool._init();
                    matxAddonPool._init();
                    dataLinks._initFromAll();
                    break;
                case (__privateCollection__.environment === 0):
                    //Webside
                    break;
                case (__privateCollection__.environment === -1):
                    //SerialPort
                    serialPool._init();
                    nwController._init();
                    dataLinks._initFromSerial();
                    break;
                case (__privateCollection__.environment === 1):
                    //android
                    interfaceDataPool._init();
                    dataLinks._initFromInterfaceApi();
                    break;
                case (__privateCollection__.environment === 2):
                    //iOS
                    break;
                case (__privateCollection__.environment === 3):
                    //MQTT
                    mqttPool._init();
                    nwController._init();
                    dataLinks._initFromMqtt();
                    break;
                case (__privateCollection__.environment === 4):
                    //webSocket
                    socketPool._init();
                    nwController._init();
                    dataLinks._initFromWebSocket();
                    break;
                case (__privateCollection__.environment === 5):
                    //matxAddOn
                    matxAddonPool._init();
                    nwController._init();
                    dataLinks._initFromMatxAddon();
                    break;
                default:
                    //return point
                    break;
            }
        },
        _checkSystemConfig: function(sysConfig) {
            if (typeof sysConfig !== 'object') return;
            var reg = /^[a-zA-Z]\d{1,}$/;
            for (var ele in sysConfig) {
                if (__privateCollection__.specialConfigTarget.indexOf(ele) >= 0) continue;
                var chk = false;
                if (!reg.test(ele)) chk = true;
                if (typeof sysConfig[ele] !== 'object') chk = true;
                if (!sysConfig[ele].hasOwnProperty('title')) chk = true;
                if (!sysConfig[ele].hasOwnProperty('size') || !sysConfig[ele].size.hasOwnProperty('x') || !sysConfig[ele].size.hasOwnProperty('y')) chk = true;
                if (!sysConfig[ele].hasOwnProperty('radiusCoefficient') || typeof sysConfig[ele].radiusCoefficient !== 'number' || sysConfig[ele].radiusCoefficient <= 0.5) chk = true;
                if (!sysConfig[ele].hasOwnProperty('features') || !commonFunc._isArray(sysConfig[ele].features)) chk = true;
                if (chk && sysConfig.hasOwnProperty(ele)) delete sysConfig[ele];
            }
        },
        _getLocalLang: function() {
            var language = navigator.language;
            if (!language) language = navigator.systemLanguage;
            if (!language) language = navigator.userLanguage;
            if (!language || typeof language !== 'string') language = 'en-us';
            else language = language.toLowerCase();
            return language;
        },
        _traverseLocales: function(childElements, languageMap, languageKey) {
            var ele = $('html');
            var langMap = languageMap || rootScope._get('_ENV_').languageMap['en-us'];
            var langKey = languageKey || 'en-us';
            if (childElements && childElements.length) ele = childElements;
            traverseLocales(ele.children(), langMap, langKey);
        },
        _getDefaultGradientRange: function() {
            return __privateCollection__.gradientRange;
        },
        _getSymbol: function(rangeList) {
            var symbol = $('<ul></ul>').addClass('heatmap-symbol');
            symbol.append($('<li></li>').html('<span z-lang="C011">高</span>'));
            for (var i = rangeList.length - 1; i >= 0; i--) symbol.append($('<li></li>').html('&nbsp;').css('background-color', rangeList[i]));
            symbol.append($('<li></li>').html('<span z-lang="C012">低</span>'));
            return symbol;
        },
        _configEventListener: function(event) {
            var configTarget = rootScope._get('_ENV_').useConfig[this.__ID__];
            if (!configTarget) return;
            configTarget[event.target.id] = $(event.target).val();
            //Actived behavior
            switch (event.target.id) {
                case 'keepRecord':
                    configTarget[event.target.id] = event.target.checked;
                    break;
                case 'lang':
                    logic._traverseLocales($('main>article.main-container#' + this.__ID__), rootScope._get('_ENV_').languageMap[$(event.target).val()], $(event.target).val());
                    break;
                default:
                    break;
            }
        },
        _getLimitLogic: function(productInfo) {
            //Lost some exception check
            var limit = {};
            var sysCfg = rootScope._get('_ENV_').systemConfig[productInfo.type];
            if (sysCfg.range && typeof sysCfg.range.minX === 'number' && typeof sysCfg.range.maxX === 'number' && typeof sysCfg.range.minY === 'number' && typeof sysCfg.range.maxY === 'number') {
                limit.limitType = 1;
                limit.limit = {
                    x: {
                        min: sysCfg.range.minX,
                        max: sysCfg.range.maxX
                    },
                    y: {
                        min: sysCfg.range.minY,
                        max: sysCfg.range.maxY
                    }
                }
            }
            if (sysCfg.points && sysCfg.points.length) {
                limit.limitType = 2;
                limit.limit = [];
                for (var i = 0; i < sysCfg.points.length; i++) {
                    if (typeof sysCfg.points[i] === 'string' && sysCfg.points[i].indexOf('-') > 0 && sysCfg.points[i].split('-').length === 2) limit.limit.push(sysCfg.points[i]);
                }
            }
            if (sysCfg.excludes) {
                limit.limitType = 3;
                limit.limit = [];
                for (var i = 0; i < sysCfg.excludes.length; i++) {
                    if (typeof sysCfg.excludes[i] === 'string' && sysCfg.excludes[i].indexOf('-') > 0 && sysCfg.excludes[i].split('-').length === 2) limit.limit.push(sysCfg.excludes[i]);
                }
            }
            return limit;
        },
        _formatGaitData: function(data) {
            return data;
        },
        _showDataViewer: function(event) {
            var targetHeatmapViewer = $('main>article.main-container#' + this.__ID__ + '>div.heatmap-container>.viewer');
            if (!this._inShow) {
                $(event.target).attr('z-lang', 'B002').html('隐藏数据');
                this._dataShower = $('<div></div>').addClass('data-shower');
                var w = targetHeatmapViewer.width() + 1;
                var h = targetHeatmapViewer.height() + 1;
                this._dataShower.css({
                    'width': w,
                    'height': h,
                    'left': targetHeatmapViewer.offset().left,
                    'top': targetHeatmapViewer.offset().top + 1
                });
                var shower = document.createElement('canvas');
                shower.width = w;
                shower.height = h;
                this._CAVCFG = {
                    widthRadius: w / this.__size__.y,
                    heightRadius: h / this.__size__.x
                };
                this._dataShower.append(shower);
                var content = shower.getContext('2d');
                content.fillStyle = "#000";
                content.strokeStyle = "#000";
                for (var i = this._CAVCFG.heightRadius; i < h; i += this._CAVCFG.heightRadius) {
                    content.moveTo(0, i);
                    content.lineTo(w, i);
                }
                for (var i = this._CAVCFG.widthRadius; i < w; i += this._CAVCFG.widthRadius) {
                    content.moveTo(i, 0);
                    content.lineTo(i, h);
                }
                content.stroke();
                content.save();
                targetHeatmapViewer.append(this._dataShower);
                this._registerDataViewer();
                this._inShow = true;
            } else {
                $(event.target).attr('z-lang', 'B001').html('显示数据');
                this._unRegisterDataViewer();
                this._dataShower.remove();
                this._dataShower = null;
                this._inShow = false;
            }
            this._refreshLocale();
        },
        _scaleEventListener: function(event) {
            var target = rootScope._get('_ENV_').useConfig[this.__ID__];
            if (!target) return;
            if (!target.scale) target.scale = {};
            target.scale[event.target.id] = commonFunc._toFloat($(event.target).val());
            this._refreshScale();
        },
        _returnListener: function(event) {
            event.stopPropagation();
            pageController._activePage((typeof this.__returnId__ !== 'undefined') ? this.__returnId__ : 'navigation');
            if (typeof this._returnCallback === 'function') this._returnCallback();
        },
        _activeGaitListListener: function(event) {
            event.stopPropagation();
            pageController._activeRecordList('gait');
        },
        _activeKeepRecordsListListener: function(event) {
            event.stopPropagation();
            pageController._activeRecordList('keep');
        },
        _activeGaitListener: function(event) {
            event.stopPropagation();
            var key = event.target.id;
            if (!key) key = $(event.target).parents('tr').get(0).id;
            if (!key) return;
            this._activeGaitRecord(key);
        },
        _activeKeepRecordListener: function(event) {
            event.stopPropagation();
            var tmpContainer = $(event.target).parents('ul').children().get(1);
            var parent = $(tmpContainer).children('.map-container');
            if (this._loadMap(tmpContainer.id.replace('idxKeep', ''), parent)) {
                if (parent.is(':hidden')) parent.fadeIn(1000);
                else parent.fadeOut(1000);
            }
        },
        _replayListener: function(event) {
            event.stopPropagation();
            this._startReplayGait();
        },
        _interfaceConnecter: function(type, target, env) {
            if (!env || !env.environment) env = rootScope._get('_ENV_');
            switch (type) {
                case 'defaultSysytemConfig':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callCustomSystemConfig();
                            break;
                        case 2:
                            break;
                        default:
                            env.systemConfig = commonFunc._mergeObject(env.systemConfig, io._getConfig(1));
                            target._customSystemConfigCallback();
                            break;
                    }
                    break;
                case 'customSystemConfig':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callLanguageMap();
                            break;
                        case 2:
                            break;
                        default:
                            env.languageMap = commonFunc._getJson('./assets/jsons/language.json');
                            target._languageMapCallback();
                            break;
                    }
                    break;
                case 'languageMap':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callUseConfig();
                            break;
                        case 2:
                            break;
                        default:
                            env.useConfig = io._getConfig(0) || {};
                            target._useConfigCallback();
                            break;
                    }
                    break;
                case 'useConfig':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callDefaultUseConfig();
                            break;
                        case 2:
                            break;
                        default:
                            env.useConfig.default = commonFunc._getJson('./assets/jsons/useconfig.json');
                            env.useConfig.default.lang = logic._getLocalLang();
                            target._useConfigAllCallback();
                            break;
                    }
                    break;
                case 'useConfigAll':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callScalesList();
                            break;
                        case 2:
                            break;
                        default:
                            env.scaleList = io._getScalesList();
                            target._userInfoCallback();
                            break;
                    }
                    break;
                case 'useInfo':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callUserInfo();
                            break;
                        case 2:
                            break;
                        default:
                            env.userList = io._getUserList() || [];
                            target._scaleListCallback();
                            break;
                    }
                    break;
                case 'scaleRoot1':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callDefaultScaleTable(target.__ID__, 'MTS_0' + target.__userConfig__.lang + '.scale');
                            break;
                        case 2:
                            break;
                        default:
                            target.scaleTable = commonFunc._getJson('./assets/jsons/MTS_0' + target.__userConfig__.lang + '.scale');
                            target._defaultScaleTableCallback();
                            break;
                    }
                    break;
                case 'scaleRoot2':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callActivedScaleTable(target.__ID__, target.__userConfig__.defaultScale);
                            break;
                        case 2:
                            break;
                        default:
                            target.scaleTable = io._getScaleTable(target.__userConfig__.defaultScale);
                            target._activedScaleTableCallback();
                            break;
                    }
                    break;
                case 'scaleDefaultScaleTable':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callActivedScaleTable(target.__ID__, 'MTS_0' + target.__userConfig__.lang + '.scale');
                            break;
                        case 2:
                            break;
                        default:
                            target.scaleTable = commonFunc._getJson('./assets/jsons/MTS_0' + target.__userConfig__.lang + '.scale');
                            target._activedScaleTableCallback();
                            break;
                    }
                    break;
                case 'scaleChangedScaleTable':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callChangedScaleTable(target.__ID__, target.tmpTarget);
                            break;
                        case 2:
                            break;
                        default:
                            target.scaleTable = io._getScaleTable(target.tmpTarget);
                            target._changedScaleTableCallback();
                            break;
                    }
                    break;
                case 'scaleDeterminedScaleTable':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.callDeterminedScaleTable(target.__ID__, 'MTS_0' + target.__userConfig__.lang + '.scale');
                            break;
                        case 2:
                            break;
                        default:
                            target.scaleTable = commonFunc._getJson('./assets/jsons/MTS_0' + target.__userConfig__.lang + '.scale');
                            target._determinedScaleTableCallback();
                            break;
                    }
                    break;
                case 'gaitRecord':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.saveGaitRecord(target.__ID__, target.tmpRecordData, target.tmpGaitRecord);
                            break;
                        case 2:
                            break;
                        default:
                            io._saveGaitRecord(target.tmpRecordData, target.tmpGaitRecord);
                            target._gaitRecordSavedCallback();
                            break;
                    }
                    break;
                case 'gaitList':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.getGaitList();
                            break;
                        case 2:
                            break;
                        default:
                            target.gaitList = io._getGaitList();
                            target._gaitListCallback();
                            break;
                    }
                    break;
                case 'getGaitRecord':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.getGaitRecord(target.activedKey);
                            break;
                        case 2:
                            break;
                        default:
                            io._getGaitRecord(target.activedKey, target._setActivedGaitRecord.bind(target));
                            //target._getGaitRecordCallback();
                            break;
                    }
                    break;
                case 'getKeepRecord':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.getKeepRecord(target.activedKey);
                            break;
                        case 2:
                            break;
                        default:
                            io._getKeepRecord(target.activedKey, target._setActivedKeepRecord.bind(target));
                            break;
                    }
                    break;
                case 'keepRecord':
                    switch (env.environment) {
                        case 1:
                            var baseKey = target.activedRecord.startTimestamp;
                            var key1 = target.activedRecord.turnSTimestamp ? target.activedRecord.turnSTimestamp : target.activedRecord.startTimestamp;
                            var key2 = target.activedRecord.turnETimestamp ? target.activedRecord.turnETimestamp : target.activedRecord.finishedTimestamp;
                            var map = target.activedRecord.map ? target.activedRecord.map.toDataURL() : null;
                            if (baseKey && key1 && key2 && map) window.MyApp.saveKeepRecord(target.__ID__, baseKey, key1, key2, map, target.recordInfo);
                            break;
                        case 2:
                            break;
                        default:
                            io._saveKeepRecord(target.activedRecord, target.recordInfo);
                            target._keepRecordSavedCallback();
                            break;
                    }
                    break;
                case 'keepRecordList':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.getKeepRecordList();
                            break;
                        case 2:
                            break;
                        default:
                            if (!target.onlyInfo) target.keepRecordList = io._getKeepRecordList();
                            else target.keepRecordList = io._getKeepRecordInfoList();
                            target._keepRecordListCallback();
                            break;
                    }
                    break;
                case 'saveRecord':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.saveRecord(target.__ID__, target.tmpFileName, target.tmpImgData, target.matrixData);
                            break;
                        case 2:
                            break;
                        default:
                            io._saveImageFromHeatmap(target.tmpImgData, target.tmpFileName);
                            io._saveMartix(target.matrixData, target.tmpFileName);
                            target._saveRecordSavedCallback();
                            break;
                    }
                    break;
                case 'outputCSV':
                    switch (env.environment) {
                        case 1:
                            window.MyApp.outputCSV(target.__ID__, target.tmpFileName, target.tmpImgData, target.matrixData);
                            break;
                        case 2:
                            break;
                        default:
                            io._outputCSV(target.strBuffer, target.outputFileName);
                            target._outputCSVCallback();
                            break;
                    }
                    break;
                case 'delGaitRecord':
                    switch (env.environment) {
                        case 1:
                            window.MyApp._deleteRecord(target.tmpType, target.delPath);
                            break;
                        case 2:
                            break;
                        default:
                            io._deleteRecord(target.tmpType, target.delPath);
                            target._delRecordDeleted(target.tmpType);
                            break;
                    }
                    break;
                case 'delKeepRecord':
                    switch (env.environment) {
                        case 1:
                            window.MyApp._deleteRecord(target.tmpType, target.delPath);
                            break;
                        case 2:
                            break;
                        default:
                            io._deleteRecord(target.tmpType, target.delPath);
                            target._delRecordDeleted(target.tmpType);
                            break;
                    }
                    break;
                case 'saveUserList':
                    switch (env.environment) {
                        case 1:
                            window.MyApp._saveUserList(target.saveInfo);
                            break;
                        case 2:
                            break;
                        default:
                            io._saveUserList(target.saveInfo);
                            target._userListSavedCallback();
                            break;
                    }
                    break;
                default:
                    break;
            }
        },
        _meargeCanvas: function(target, source) {
            if (!target) return source;
            try {
                var targetCtx = target.getContext('2d');
                /*
                var sourceCtx = source.getContext('2d');
                var targetImg = targetCtx.getImageData(0, 0, target.width, target.height);
                var sourceImg = sourceCtx.getImageData(0, 0, source.width, source.height);
                for (var i = 0; i < targetImg.data.length; i++) {
                    if (i >= sourceImg.data.length) break;
                    targetImg.data[i] = Math.max(targetImg.data[i], sourceImg.data[i]);
                }
                targetCtx.putImageData(targetImg, 0, 0);
                */
                targetCtx.drawImage(source, 0, 0);
                return target;
            } catch (e) {
                console.log(e);
                return source;
            }
        },
        _getContextColor: function(newTimestamp, oldTimestamp, context) {
            var keepTime = newTimestamp - oldTimestamp;
            switch (true) {
                case (keepTime >= 5400000):
                    context.strokeStyle = 'rgb(178,34,34)';
                    break;
                case (keepTime >= 3600000):
                    context.strokeStyle = 'rgb(255,255,0)';
                    break;
                case (keepTime >= 1800000):
                    context.strokeStyle = 'rgb(255,255,255)';
                    break;
                case (keepTime > 0):
                    context.strokeStyle = 'rgb(0,200,0)';
                    break;
                default:
                    context.strokeStyle = 'rgb(0,0,0)';
                    break;
            }
        },
        _getOppositePoint: function(flipType, data, productSize) {
            if (data < 0) data = 0;
            if (flipType === 'V') return ((productSize.x >= data) ? (productSize.x - data) : data);
            else return ((productSize.y >= data) ? (productSize.y - data) : data);
        },
    };
    return factory;
});