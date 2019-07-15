;
(function(name, context, factory) { // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("io", this, function() {
    'use strict';
    var __commonConstant__ = {
        path: 'C://City Zen Solutions/Pressure Monitoring/',
        useConfig: 'useConfig.json',
        customConfig: 'customConfig.json',
        socketInfo: 'socketInfo.json',
        matxSetInfo: 'matxSetInfo.json',
        userList: 'userList.json',
        gaitDir: 'gaitRecords',
        recordDir: 'keepRecords',
        saveDir: 'saveRecords',
        gaitAnalysisData: 'analysisData.json',
        scale: '.scale',
        keepRecordInfo: 'recordInfo.json'
    };
    var __nodeFs__, __nodePath__;
    try {
        __nodeFs__ = require('fs');
        __nodePath__ = require('path');
    } catch (e) {
        console.log(e.message);
    }
    //Common function
    var readFile = function(uri, encode, type) {
        if (!__nodeFs__ || !__nodePath__) return null;
        try {
            switch (type) {
                case 'json':
                    return JSON.parse(__nodeFs__.readFileSync(__nodePath__.normalize(uri), encode));
                case 'txt':
                    return __nodeFs__.readFileSync(__nodePath__.normalize(uri), encode);
                default:
                    return null;
            }
        } catch (e) {
            console.log(e.message);
            return null;
        }
    };
    var saveFile = function(uri, bufferData, sync) {
        if (!__nodeFs__ || !__nodePath__) return null;
        try {
            if (sync) {
                __nodeFs__.writeFileSync(__nodePath__.normalize(uri), bufferData);
            } else {
                __nodeFs__.open(__nodePath__.normalize(uri), 'wx', function(err, fd) {
                    if (err) {
                        __nodeFs__.mkdir(__nodePath__.dirname(uri), function(err) {
                            if (!err) {
                                __nodeFs__.writeFile(__nodePath__.normalize(uri), bufferData, function(err) {
                                    if (err) throw err;
                                });
                            }
                        });
                    } else {
                        __nodeFs__.writeFile(__nodePath__.normalize(uri), bufferData, function(err) {
                            if (err) throw err;
                        });
                    }
                    __nodeFs__.close(fd);
                });
            }
        } catch (e) {
            console.log(e.message);
        }
    };
    var makeDir = function(uri) {
        if (!__nodeFs__) return null;
        try {
            __nodeFs__.accessSync(uri, __nodeFs__.R_OK | __nodeFs__.W_OK);
        } catch (e) {
            __nodeFs__.mkdirSync(uri);
        }
    };
    var appendFile = function(uri, bufferData, sync) {
        if (!__nodeFs__ || !__nodePath__) return null;
        try {
            if (sync) {
                __nodeFs__.appendFileSync(__nodePath__.normalize(uri), bufferData);
            } else {
                __nodeFs__.appendFile(__nodePath__.normalize(uri), bufferData, function(err) {
                    if (err) throw err;
                    //console.log('Data was appended to file!');
                });
            }
        } catch (e) {
            console.log(e.message);
        }
    };
    var deleteDir = function(path) {
        if (!__nodeFs__ || !__nodePath__) return null;
        var files = [];
        if (__nodeFs__.existsSync(__nodePath__.normalize(path))) {
            files = __nodeFs__.readdirSync(__nodePath__.normalize(path));
            files.forEach(function(file, index) {
                var curPath = __nodePath__.normalize(path) + "/" + file;
                if (__nodeFs__.statSync(curPath).isDirectory()) { // recurse
                    deleteDir(curPath);
                } else { // delete file
                    __nodeFs__.unlinkSync(curPath);
                }
            });
            __nodeFs__.rmdirSync(__nodePath__.normalize(path));
        }
    };
    var factory = {
        _getConfig: function(type) {
            var result = null;
            switch (type) {
                case 0:
                    result = readFile(__commonConstant__.path + __commonConstant__.useConfig, 'utf8', 'json');
                    break;
                case 1:
                    result = readFile(__commonConstant__.path + __commonConstant__.customConfig, 'utf8', 'json');
                    break;
                default:
                    break;
            }
            return result;
        },
        _saveUseConfig: function() {
            var useConfig = rootScope._get('_ENV_');
            if (!useConfig || !useConfig.hasOwnProperty('useConfig')) return;
            saveFile(__commonConstant__.path + __commonConstant__.useConfig, JSON.stringify(useConfig.useConfig), true);
        },
        _getSocketInfo: function() {
            return readFile(__commonConstant__.path + __commonConstant__.socketInfo, 'utf8', 'json');
        },
        _getMatxSetInfo: function() {
            return readFile(__commonConstant__.path + __commonConstant__.matxSetInfo, 'utf8', 'json');
        },
        _getScalesList: function() {
            if (!__nodeFs__) return null;
            var resultList = [];
            var files = __nodeFs__.readdirSync(__commonConstant__.path);
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf(__commonConstant__.scale) <= 0) continue;
                var states = __nodeFs__.statSync(__commonConstant__.path + files[i]);
                if (states.isDirectory()) continue;
                resultList.push(files[i].substring(0, files[i].indexOf(__commonConstant__.scale)));
            }
            return resultList;
        },
        _getScaleTable: function(fileName) {
            return readFile(__commonConstant__.path + fileName + __commonConstant__.scale, 'utf8', 'json');
        },
        _saveGaitRecord: function(analysisData, sourceData) {
            var savePath = __commonConstant__.path + __commonConstant__.gaitDir;
            makeDir(savePath);
            savePath += '/' + analysisData.startTimestamp + '-' + analysisData.finishedTimestamp;
            makeDir(savePath);
            saveFile(savePath + '/' + __commonConstant__.gaitAnalysisData, JSON.stringify(analysisData), true);
            if (!sourceData.canvasData || !sourceData.canvasData.length) return;
            var width = 0;
            var height = 0;
            for (var i = 0; i < sourceData.canvasData.length; i++) {
                width = Math.max(width, sourceData.canvasData[i].width);
                height = Math.max(height, sourceData.canvasData[i].height);
                var base64Data = sourceData.canvasData[i].screenShot.toDataURL().replace(/^data:image\/\w+;base64,/, "");
                var dataBuffer = new Buffer(base64Data, 'base64');
                saveFile(savePath + '/' + sourceData.canvasData[i].timestamp + '.screen', dataBuffer, true);
            }
            //for (var i = 0; i < sourceData.canvasData.length; i++) saveFile(savePath + '/' + sourceData.canvasData[i].timestamp + '.json', JSON.stringify(sourceData.canvasData[i].imgData), true);
        },
        _getGaitList: function() {
            try {
                var resultList = [];
                var realPath = __commonConstant__.path + __commonConstant__.gaitDir;
                if (realPath.lastIndexOf('/') !== realPath.length - 1) realPath += '/';
                var files = __nodeFs__.readdirSync(realPath);
                for (var i = 0; i < files.length; i++) {
                    var states = __nodeFs__.statSync(realPath + files[i]);
                    var theFileName = files[i];
                    if (!states.isDirectory() || theFileName.indexOf('-') <= 0) continue;
                    var tmpSplit = theFileName.split('-');
                    if (tmpSplit.length !== 2 || !tmpSplit[0] || !tmpSplit[1]) continue;
                    var startTimestamp = commonFunc._toInt(tmpSplit[0]);
                    var finishedTimestamp = commonFunc._toInt(tmpSplit[1]);
                    if (!commonFunc._chkEqual(startTimestamp, tmpSplit[0]) || !commonFunc._chkEqual(finishedTimestamp, tmpSplit[1])) continue;
                    var analysisData = readFile(__commonConstant__.path + __commonConstant__.gaitDir + '/' + theFileName + '/' + __commonConstant__.gaitAnalysisData, 'utf8', 'json');
                    if (!analysisData || !analysisData.id) continue;
                    resultList.push({
                        key: theFileName,
                        startTimestamp: startTimestamp,
                        finishedTimestamp: finishedTimestamp,
                        analysisData: analysisData
                    });
                }
                resultList.sort(function(a, b) {
                    return b.startTimestamp - a.startTimestamp;
                });
                return resultList;
            } catch (e) {
                console.log(e.message);
                return null;
            }
        },
        _getGaitRecord: function(key, callback) {
            var realPath = __commonConstant__.path + __commonConstant__.gaitDir + '/' + key;
            var tmpSplit = key.split('-');
            var result = {
                startTimestamp: commonFunc._toInt(tmpSplit[0]),
                finishedTimestamp: commonFunc._toInt(tmpSplit[1]),
                canvasData: []
            };
            var files = __nodeFs__.readdirSync(realPath);
            var tmpCnt = [];
            for (var i = 0; i < files.length; i++) {
                var states = __nodeFs__.statSync(realPath + '/' + files[i]);
                var theFileName = files[i].replace('.screen', '');
                if (states.isDirectory() || !commonFunc._chkEqual(theFileName, commonFunc._toInt(theFileName))) continue;
                tmpCnt.push(files[i]);
                //$('body').append(tmpImg);
            }
            rootScope._set('_TMPCOUNTER_', tmpCnt.length);
            for (var i = 0; i < tmpCnt.length; i++) {
                var tmpImg = new Image();
                tmpImg.src = 'data:image/png;base64,' + readFile(realPath + '/' + tmpCnt[i], 'base64', 'txt');
                tmpImg.id = tmpCnt[i];
                tmpImg.onload = function() {
                    var tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = this.width;
                    tmpCanvas.height = this.height;
                    tmpCanvas.getContext("2d").drawImage(this, 0, 0);
                    result.canvasData.push({
                        timestamp: commonFunc._toInt(this.id.replace('.screen', '')),
                        screenShot: tmpCanvas
                    });
                    rootScope._set('_TMPCOUNTER_', rootScope._get('_TMPCOUNTER_') - 1);
                    if (rootScope._get('_TMPCOUNTER_') <= 0) {
                        result.canvasData.sort(function(a, b) {
                            return a.timestamp - b.timestamp;
                        });
                        callback(result);
                    }
                };
                //$('body').append(tmpImg);
            }
            //return result;
        },
        _saveImageFromHeatmap: function(screenShot, name) {
            var fileName = (name ? name : (new Date()).Format('yyyy-MM-dd_hh-mm-ss'));
            if (!fileName || !screenShot) return;
            var savePath = __commonConstant__.path + __commonConstant__.saveDir;
            makeDir(savePath);
            saveFile(savePath + '/' + fileName + '.png', new Buffer(screenShot.replace(/^data:image\/\w+;base64,/, ""), 'base64'), true);
        },
        _saveMartix: function(matrixData, name) {
            var fileName = (name ? name : (new Date()).Format('yyyy-MM-dd_hh-mm-ss'));
            if (!fileName || !matrixData) return;
            var bufferData = '';
            for (var i = 0; i < matrixData.length; i++) {
                bufferData += matrixData[i].join(',');
                bufferData += '\r\n';
            }
            var savePath = __commonConstant__.path + __commonConstant__.saveDir;
            makeDir(savePath);
            saveFile(savePath + '/' + fileName + '.csv', bufferData, true);
        },
        _outputCSV: function(bufferData, name) {
            var fileName = (name ? name : (new Date()).Format('yyyy-MM-dd_hh-mm-ss'));
            if (!fileName || !bufferData || !bufferData.length) return;
            var savePath = __commonConstant__.path + __commonConstant__.saveDir;
            makeDir(savePath);
            appendFile(savePath + '/' + fileName + '.csv', bufferData, false);
        },
        _saveKeepRecord: function(record, info) {
            var baseKey = record.startTimestamp;
            var key1 = record.turnSTimestamp ? record.turnSTimestamp : record.startTimestamp;
            var key2 = record.turnETimestamp ? record.turnETimestamp : record.finishedTimestamp;
            var map = record.map ? record.map.toDataURL() : null;
            if (!baseKey || !key1 || !key2 || !map) return;
            var savePath = __commonConstant__.path + __commonConstant__.recordDir;
            makeDir(savePath);
            savePath += '/' + baseKey;
            makeDir(savePath);
            saveFile(savePath + '/' + key1 + '-' + key2 + '.screen', new Buffer(map.replace(/^data:image\/\w+;base64,/, ""), 'base64'), true);
            if (info) saveFile(savePath + '/' + __commonConstant__.keepRecordInfo, JSON.stringify(info), true);
        },
        _getKeepRecordInfoList: function() {
            try {
                var resultList = [];
                var realPath = __commonConstant__.path + __commonConstant__.recordDir;
                if (realPath.lastIndexOf('/') !== realPath.length - 1) realPath += '/';
                var files = __nodeFs__.readdirSync(realPath);
                for (var i = 0; i < files.length; i++) {
                    var states = __nodeFs__.statSync(realPath + files[i]);
                    if (!states.isDirectory() || !commonFunc._chkEqual(files[i], commonFunc._toInt(files[i]))) continue;
                    var records = __nodeFs__.readdirSync(realPath + files[i] + '/');
                    for (var j = 0; j < records.length; j++) {
                        if (records[j] !== __commonConstant__.keepRecordInfo) continue;
                        var info = readFile(realPath + files[i] + '/' + records[j], 'utf8', 'json');
                        if (info) {
                            resultList.push({
                                key: commonFunc._toInt(files[i]),
                                info: info
                            });
                            break;
                        }
                    }
                }
                return resultList;
            } catch (e) {
                console.log(e.message);
                return null;
            }
        },
        _getKeepRecordList: function() {
            try {
                var resultList = [];
                var realPath = __commonConstant__.path + __commonConstant__.recordDir;
                if (realPath.lastIndexOf('/') !== realPath.length - 1) realPath += '/';
                var files = __nodeFs__.readdirSync(realPath);
                for (var i = 0; i < files.length; i++) {
                    var states = __nodeFs__.statSync(realPath + files[i]);
                    if (!states.isDirectory() || !commonFunc._chkEqual(files[i], commonFunc._toInt(files[i]))) continue;
                    var tmpRecordContainer = {
                        key: commonFunc._toInt(files[i]),
                        data: []
                    };
                    var records = __nodeFs__.readdirSync(realPath + files[i] + '/');
                    for (var j = 0; j < records.length; j++) {
                        if (records[j].indexOf('.screen') <= 0) continue;
                        var recordStates = __nodeFs__.statSync(realPath + files[i] + '/' + records[j]);
                        var theFileName = records[j].replace('.screen', '');
                        if (recordStates.isDirectory() || theFileName.indexOf('-') <= 0) continue;
                        var timeRange = theFileName.split('-');
                        if (timeRange.length !== 2 || !timeRange[0] || !timeRange[1]) continue;
                        var startTimestamp = commonFunc._toInt(timeRange[0]);
                        var finishedTimestamp = commonFunc._toInt(timeRange[1]);
                        if (!commonFunc._chkEqual(startTimestamp, timeRange[0]) || !commonFunc._chkEqual(finishedTimestamp, timeRange[1])) continue;
                        var base64Data = readFile(realPath + files[i] + '/' + records[j], 'base64', 'txt');
                        tmpRecordContainer.data.push({
                            startTimestamp: startTimestamp,
                            finishedTimestamp: finishedTimestamp,
                            base64: base64Data
                        });
                    }
                    tmpRecordContainer.data.sort(function(a, b) {
                        return a.startTimestamp - b.startTimestamp;
                    });
                    resultList.push(tmpRecordContainer);
                }
                return resultList;
            } catch (e) {
                console.log(e.message);
                return null;
            }
        },
        _getKeepRecord: function(key, callback) {
            var realPath = __commonConstant__.path + __commonConstant__.recordDir + '/' + key;
            var result = {
                timestamp: commonFunc._toInt(key),
                canvasData: []
            };
            var files = __nodeFs__.readdirSync(realPath);
            var tmpCnt = [];
            for (var i = 0; i < files.length; i++) {
                var states = __nodeFs__.statSync(realPath + '/' + files[i]);
                var theFileName = files[i].replace('.screen', '');
                if (states.isDirectory()) continue;
                if (theFileName === __commonConstant__.keepRecordInfo) {
                    result.info = readFile(realPath + '/' + theFileName, 'utf8', 'json');
                    continue;
                }
                var tmpSplit = theFileName.split('-');
                if (tmpSplit.length !== 2 || !commonFunc._chkEqual(tmpSplit[0], commonFunc._toInt(tmpSplit[0])) || !commonFunc._chkEqual(tmpSplit[1], commonFunc._toInt(tmpSplit[1]))) continue;
                tmpCnt.push(files[i]);
            }
            rootScope._set('_TMPCOUNTER_', tmpCnt.length);
            for (var i = 0; i < tmpCnt.length; i++) {
                var tmpImg = new Image();
                tmpImg.src = 'data:image/png;base64,' + readFile(realPath + '/' + tmpCnt[i], 'base64', 'txt');
                tmpImg.id = tmpCnt[i].replace('.screen', '');
                tmpImg.onload = function() {
                    var tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = this.width;
                    tmpCanvas.height = this.height;
                    tmpCanvas.getContext("2d").drawImage(this, 0, 0);
                    var imgSplit = this.id.split('-');
                    if (imgSplit.length === 2) {
                        result.canvasData.push({
                            startTimestamp: commonFunc._toInt(imgSplit[0]),
                            finishTimestamp: commonFunc._toInt(imgSplit[1]),
                            screenShot: tmpCanvas
                        });
                    }
                    rootScope._set('_TMPCOUNTER_', rootScope._get('_TMPCOUNTER_') - 1);
                    if (rootScope._get('_TMPCOUNTER_') <= 0) {
                        result.canvasData.sort(function(a, b) {
                            return a.startTimestamp - b.startTimestamp;
                        });
                        callback(result);
                    }
                };
            }
            //return result;
        },
        _deleteRecord: function(type, path) {
            var realPath = __commonConstant__.path;
            switch (type) {
                case 'gaitRecord':
                    realPath += __commonConstant__.gaitDir;
                    break;
                case 'keepRecord':
                    realPath += __commonConstant__.recordDir;
                    break;
                default:
                    break;
            }
            realPath += '/' + path;
            if (realPath === __commonConstant__.path) return;
            deleteDir(realPath);
        },
        _getUserList: function() {
            return readFile(__commonConstant__.path + __commonConstant__.userList, 'utf8', 'json');
        },
        _saveUserList: function(userList) {
            saveFile(__commonConstant__.path + __commonConstant__.userList, JSON.stringify(userList), true);
        }
    };
    return factory;
});