;
//Bridge
var _setActivedConfig_ = function(strCfg) {
    interFace._setActivedConfig(strCfg);
};
var _bufferJsonStringCallback_ = function(strInnerJson) {
    interFace._bufferJsonStringCallback(strInnerJson);
};
var _objMatrixCallback_ = function(strInnerData) {
    interFace._objMatrixCallback(strInnerData);
};
var _setConfigData_ = function(strInnerJson) {
    interFace._setConfigData(strInnerJson);
};
var _setScaleGroup_ = function(strInnerJson) {
    interFace._setScaleGroup(strInnerJson);
};
var _inputGaitReportOverView_ = function(strInnerJson) {
    //window.MyApp.showLog(strInnerJson);
    interFace._inputGaitReportOverView(strInnerJson);
};
var _inputKeepRecordList_ = function(strInnerJson) {
    //window.MyApp.showLog(strInnerJson);
    interFace._inputKeepRecordList(strInnerJson);
};
/*
var _inputGaitRecord_ = function(strInnerJson) {
    interFace._inputGaitRecord(strInnerJson);
};
*/
var _appendGaitRecord_ = function(key, strBase64, endFlg) {
    interFace._appendGaitRecord(key, strBase64, endFlg);
};
var _appendKeepRecord_ = function(key, timeRange, strBase64, endFlg) {
    interFace._appendKeepRecord(key, timeRange, strBase64, endFlg);
};

var _closeDevice_ = function() {
    runtimeCollection._set('productInfo', {});
    var activedInfo = runtimeCollection._get('activedInfo');
    activedInfo.config = null;
    activedInfo.activedContainer = null;
    pageCoordinator._toWait();
};
var _saveConfigData_ = function() {
    interFace._saveConfigData();
};

(function(name, context, factory) {
    // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("interFace", this, function() {
    'use strict';
    var __insideObject__ = {
        forceInside: false,
        dataWrapperWorker: null,
        innerData: null,
        tmpGaitRecordStore: null,
        scaleGroups: []
    };
    var dataWrapperWorkerCallback = function(event) {
        var result = JSON.parse(event.data);
        __insideObject__.innerData = result.data;
        result.activeCom = 'outside';
        if (serialCallBackList.hasOwnProperty('_sericalPortDataWrapper') &&
            typeof serialCallBackList._sericalPortDataWrapper === 'function')
            serialCallBackList._sericalPortDataWrapper(JSON.stringify(result));
    };
    var getActivedEnv = function() {
        var _ENV_ = runtimeCollection._get('_ENV_');
        if (!_ENV_) {
            if (!__insideObject__.forceInside && typeof nw !== 'undefined') return -1;
            else {
                if (window.MyApp) return 1;
                //if(ios) return 2;
                return 0;
            }
        } else {
            if (!_ENV_.insideForm) return -1;
            else return _ENV_.insideType;
        }
    };
    var setDefaultScaleGroup = function() {
        __insideObject__.scaleGroups = [];
        __insideObject__.scaleGroups.push({ name: 'braden', data: commonFunc._getJson('./asset/json/defaultscale.json') });
        __insideObject__.scaleGroups.push({ name: '布兰登', data: commonFunc._getJson('./asset/json/defaultScales/bradenScale.json') });
    };
    var factory = {
        _isInsideForm: function() {
            if (__insideObject__.forceInside) return true;
            if (typeof nw === 'undefined') return true;
            return false;
        },
        _insideType: function() {
            if (window.MyApp) return 1;
            //if(ios) return 2;
            return 0;
        },
        _getDefaultSystemConfig: function() {
            //return JSON.stringify(__insideObject__.defaultSystemConfig);
            return JSON.stringify(commonFunc._getJson('./asset/json/systemconfig.json'));
        },
        _getDefaultScaleGroup: function() {
            setDefaultScaleGroup();
            return __insideObject__.scaleGroups;
        },
        _startDataWorker: function() {
            if (__insideObject__.dataWrapperWorker) return;
            if (typeof Worker === 'undefined') return;
            __insideObject__.dataWrapperWorker = new Worker('./js/workers/bufferDataFormat.worker.js');
            __insideObject__.dataWrapperWorker.onmessage = dataWrapperWorkerCallback;
        },
        _setActivedConfig: function(strCfg) {
            sharingDataSet._set('activedSysConfig', JSON.parse(strCfg));
        },
        _objMatrixCallback: function(strInnerData) {
            var result = JSON.parse(strInnerData);
            var connectedProductInfo = runtimeCollection._get('productInfo') || {};
            var modInfoFlg = false;

            if (!connectedProductInfo.type || connectedProductInfo.type !== result.type) {
                connectedProductInfo.type = result.type;
                modInfoFlg = true;
            }
            if (!connectedProductInfo.size) {
                connectedProductInfo.size = JSON.parse(JSON.stringify(result.size));
                modInfoFlg = true;
            }
            if (!connectedProductInfo.calibrated) {
                matrixKeeper._setCalibrationData(result.data.clone());
                connectedProductInfo.calibrated = true;
                modInfoFlg = true;
            }
            if (modInfoFlg) runtimeCollection._set('productInfo', connectedProductInfo);

            matrixKeeper._setData(result.data.clone());
        },
        _bufferJsonStringCallback: function(strInnerJson) {
            try {
                var buffer = JSON.parse(strInnerJson);
                //!!Important!! Don't use Wide Byte character!!!
                if ((buffer.indexOf(95) >= 0) &&
                    (buffer.indexOf(83) >= 0 || buffer.indexOf(70) >= 0 ||
                        buffer.indexOf(69) >= 0 || buffer.indexOf(65) >= 0)) {
                    var postStr = {};
                    postStr.innerData = __insideObject__.innerData;
                    postStr.data = { data: buffer };
                    __insideObject__.dataWrapperWorker.postMessage(JSON.stringify(postStr));
                }
            } catch (e) {
                console.log(e.message);
            }
        },
        _inputGaitReportOverView: function(gaitHistoryList) {
            __insideObject__.gaitHistories = gaitHistoryList;
            var tmpData = JSON.parse(__insideObject__.gaitHistories);
            var resultList = [];
            if (commonFunc._isArray(tmpData)) {
                for (var i = 0; i < tmpData.length; i++) {
                    resultList.push({
                        path: commonFunc._toFloat(tmpData[i].startTimestamp),
                        name: commonFunc._toFloat(tmpData[i].finishedTimestamp),
                        jsonData: tmpData[i]
                    });
                }
            }
            historyAgent._refreshGaitRecordList(resultList);
        },
        /*
        _inputKeepRecordList: function(strInnerJson) {
            var result = JSON.parse(strInnerJson);
            if (commonFunc._isArray(result)) {
                for (var i = 0; i < result.length; i++) {
                    if (result.data && commonFunc._isArray(result.data) && result.data.length) {
                        for (var j = 0; j < result[i].data.length; j++) {
                            if (result[i].data[j].path)
                                result[i].data[j].path = 'data:image/png;base64,' + result[i].data[j].path;
                        }
                    }
                }
            }
            //Need another dual???
            historyAgent._refreshKeepRecordList(__insideObject__.keepRecordList);
            __insideObject__.keepRecordList = result;
        },
        _inputGaitRecord: function(gaitRecord) {
            var tmpData = JSON.parse(gaitRecord);
            if (!commonFunc._isArray(tmpData)) return;
            var resultList = [];
            for (var i = 0; i < tmpData.length; i++) {
                resultList.push({
                    path: 'data:image/png;base64,' + tmpData[i].data,
                    name: commonFunc._toFloat(tmpData[i].key)
                });
            }
            historyAgent._forceShowGaitRecord(resultList);
        },
        */
        _appendGaitRecord: function(key, strBase64, endFlg) {
            // window.MyApp.showLog("strBase64y\n"+strBase64);
            if (endFlg === 0) __insideObject__.tmpGaitRecordStore = [];
            __insideObject__.tmpGaitRecordStore.push({
                path: 'data:image/png;base64,' + strBase64,
                name: key
            });
            if (endFlg === 2) historyAgent._forceShowGaitRecord(__insideObject__.tmpGaitRecordStore);
        },
        _appendKeepRecord: function(key, timeRange, strBase64, endFlg) {
            if (!__insideObject__.keepRecordList || !commonFunc._isArray(__insideObject__.keepRecordList))
                __insideObject__.keepRecordList = [];
            if (!__insideObject__.tmpCheckObj) __insideObject__.tmpCheckObj = {};
            if (!__insideObject__.tmpCheckObj.hasOwnProperty(key)) {
                __insideObject__.tmpCheckObj[key] = true;
                __insideObject__.keepRecordList.push({
                    name: key,
                    path: key,
                    data: [{ name: timeRange, path: 'data:image/png;base64,' + strBase64 }]
                });
            } else {
                for (var i = 0; i < __insideObject__.keepRecordList.length; i++) {
                    if (__insideObject__.keepRecordList[i].name === key) {
                        __insideObject__.keepRecordList[i].data.push({ name: timeRange, path: 'data:image/png;base64,' + strBase64 });
                        break;
                    }
                }
            }
            if (endFlg) historyAgent._refreshKeepRecordList(__insideObject__.keepRecordList);
        },
        //IO
        _saveConfigData: function() {
            //outsideFileStore('config.json',strInnerJson);
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.setConfig(JSON.stringify(sharingDataSet._getConfigData()));
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _setConfigData: function(strInnerJson) {
            __insideObject__.configData = JSON.parse(strInnerJson);
            sharingDataSet._setConfigData();
        },
        _getConfigData: function() {
            return __insideObject__.configData;
        },
        _setScaleGroup: function(strInnerJson) {
            if (!strInnerJson) {
                setDefaultScaleGroup();
                switch (getActivedEnv()) {
                    case 0:
                        break;
                    case 1:
                        for (var i = 0; i < __insideObject__.scaleGroups.length; i++)
                            window.MyApp.saveScaleTable(__insideObject__.scaleGroups[i].name, JSON.stringify(__insideObject__.scaleGroups[i].data));
                        break;
                    case 2:
                        break;
                    default:
                        break;
                }
            } else __insideObject__.scaleGroups = JSON.parse(strInnerJson);
        },
        _getScaleList: function() {
            if (!__insideObject__.scaleGroups || !__insideObject__.scaleGroups.length) return ['default'];
            var result = [];
            for (var i = 0; i < __insideObject__.scaleGroups.length; i++) {
                result.push(__insideObject__.scaleGroups[i].name);
            }
            return result;
        },
        _getAScale: function(table) {
            //return JSON.parse(outsideStoreGetAScale(table));
            if (!__insideObject__.scaleGroups || !__insideObject__.scaleGroups.length)
                return commonFunc._getJson('./asset/json/defaultscale.json');
            var result = null;
            for (var i = 0; i < __insideObject__.scaleGroups.length; i++) {
                if (__insideObject__.scaleGroups[i].name === table) {
                    result = JSON.parse(JSON.stringify(__insideObject__.scaleGroups[i].data));
                    break;
                }
            }
            if (!result) return commonFunc._getJson('./asset/json/defaultscale.json');
            return result;
            //Test code
            //return JSON.parse('{"descriptionItem":[{"title":"感知能力","items":[{"description":"完全受限","value":"1"},{"description":"大部分受限","value":"2"},{"description":"轻度受限","value":"3"},{"description":"无损害","value":"4"}]},{"title":"潮湿程度","items":[{"description":"持续潮湿","value":"1"},{"description":"常常潮湿","value":"2"},{"description":"偶尔潮湿","value":"3"},{"description":"罕见潮湿","value":"4"}]},{"title":"活动能力","items":[{"description":"卧床","value":"1"},{"description":"坐椅子","value":"2"},{"description":"偶尔步行","value":"3"},{"description":"经常步行","value":"4"}]},{"title":"移动能力","items":[{"description":"完全受限","value":"1"},{"description":"非常受限","value":"2"},{"description":"轻微受限","value":"3"},{"description":"不受限","value":"4"}]},{"title":"营养摄取能力","items":[{"description":"非常差","value":"1"},{"description":"可能不足","value":"2"},{"description":"充足","value":"3"},{"description":"丰富","value":"4"}]}],"threshold":[{"min":6,"max":12,"description":"高危","rangeTime":30},{"min":13,"max":14,"description":"中危","rangeTime":60},{"min":15,"max":18,"description":"低危","rangeTime":120},{"min":19,"max":99,"description":"无危","rangeTime":180}],"constantScales":[{"item":"感知能力","scale":1},{"item":"潮湿程度","scale":4},{"item":"活动能力","scale":4},{"item":"移动能力","scale":4},{"item":"营养摄取能力","scale":4}],"title":"布兰登风险评估表","presureRange":4}');
        },
        _saveScaleTable: function(scaleName, scaleData) {
            //outsideFileStore(scaleName,scaleData);
            if (__insideObject__.scaleGroups && __insideObject__.scaleGroups.length) {
                var idx = 0;
                for (idx = 0; idx < __insideObject__.scaleGroups.length; idx++) {
                    if (__insideObject__.scaleGroups[idx].name === scaleName) {
                        __insideObject__.scaleGroups[idx].data = JSON.parse(scaleData);
                        break;
                    }
                }
                //if (idx >= __insideObject__.scaleGroups.length) __insideObject__.scaleGroups.push({ name: scaleName, data: JSON.parse(scaleData) });
            } else {
                __insideObject__.scaleGroups = [];
                __insideObject__.scaleGroups.push({ name: scaleName, data: JSON.parse(scaleData) });
            }
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.saveScaleTable(scaleName, scaleData);
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _saveGaitRecord: function(startTimestamp, thisTimestamp, map) {
            //outsideFileStorePic(startTimestamp, thisTimestamp, map);
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.onBase64Data(startTimestamp.toString(), thisTimestamp.toString(), map);
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _findHistories: function(forceDir, path, typeMark) {
            //Need discuss
            //return a array build with objects contains 'path' and 'name' for page shows pictures etc. from outside file store
            var resultList = null;
            var tmpData = null;
            switch (true) {
                case (forceDir && path === null && typeMark === 'gait'):
                    if (!__insideObject__.gaitHistories) break;
                    tmpData = JSON.parse(__insideObject__.gaitHistories);
                    if (commonFunc._isArray(tmpData)) {
                        resultList = [];
                        for (var i = 0; i < tmpData.length; i++) {
                            resultList.push({
                                path: commonFunc._toFloat(tmpData[i].startTimestamp),
                                name: commonFunc._toFloat(tmpData[i].finishedTimestamp),
                                jsonData: tmpData[i]
                            });
                        }
                    }
                    break;
                case (!forceDir && !isNaN(parseFloat(path)) && typeMark === 'gait'):
                    //CALL
                    switch (getActivedEnv()) {
                        case 0:
                            break;
                        case 1:
                            window.MyApp.getOneData(parseFloat(path).toString());
                            break;
                        case 2:
                            break;
                        default:
                            break;
                    }
                    break;
                case (forceDir && path === 'records' && typeMark === undefined):
                    if (__insideObject__.keepRecordList &&
                        commonFunc._isArray(__insideObject__.keepRecordList) &&
                        __insideObject__.keepRecordList.length) {
                        resultList = [];
                        for (var i = 0; i < __insideObject__.keepRecordList.length; i++) {
                            if (__insideObject__.keepRecordList[i].data && commonFunc._isArray(__insideObject__.keepRecordList[i].data) &&
                                __insideObject__.keepRecordList[i].data.length)
                                resultList.push({
                                    path: __insideObject__.keepRecordList[i].path,
                                    name: __insideObject__.keepRecordList[i].name
                                });
                        }
                    }
                    break;
                case (!forceDir && typeMark === undefined && typeof path === 'string' && path.length > 0):
                    var searchKey = commonFunc._toFloat(path.replace('records/', ''));
                    if (__insideObject__.keepRecordList &&
                        commonFunc._isArray(__insideObject__.keepRecordList) &&
                        __insideObject__.keepRecordList.length) {
                        resultList = [];
                        for (var i = 0; i < __insideObject__.keepRecordList.length; i++) {
                            if (commonFunc._chkEqual(__insideObject__.keepRecordList[i].name, searchKey) &&
                                __insideObject__.keepRecordList[i].data &&
                                commonFunc._isArray(__insideObject__.keepRecordList[i].data) &&
                                __insideObject__.keepRecordList[i].data.length) {
                                resultList = __insideObject__.keepRecordList[i].data.clone();
                                break;
                            }
                        }
                    }
                    break;
                default:
                    break;
            }

            return resultList;
        },
        _saveReportOverview: function(fileName, strInnerJson) {
            //outsideFileStore(fileName, strInnerJson);
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.onAddId(fileName.toString(), strInnerJson);
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        /* 
         _getReportOverview: function(uri) {
             //Need discuss
             //return JSON.parse(outsideStoreGetReportOverview(uri));
             //Test code
             return JSON.parse('{"startTimestamp":1505353253907,"finishedTimestamp":1505353263347,"avgStepFrequency":"??.??","avgStepLength":"??.??","avgStepSpeed":"??.??","stepLengthDeviation":"??.??","stepWidth":"??.??"}');
         },
         */
        _outputAKeepRecord: function(fileName, map, keyTimestamp) {
            //outsideFileStore(fileName,map);
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.onSleep64Data(fileName.toString(), map, keyTimestamp.toString());
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _playSound: function() {
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.doAlarm();
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _pauseSound: function() {
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.pauseAlarm();
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _forceChangeProductType: function() {
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.reset();
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        },
        _postData: function() {
            switch (getActivedEnv()) {
                case 0:
                    break;
                case 1:
                    window.MyApp.postData();
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        }
    };
    return factory;
});