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
        path: 'C://cfgPresureMonitor/',
        config: 'config.json',
        customConfig: 'customConfig.json',
        scale: '.scale'
    };
    var __nodeFs__, __nodePath__;
    try {
        if (!interFace._isInsideForm()) {
            __nodeFs__ = require('fs');
            __nodePath__ = require('path');
        }
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
                __nodeFs__.writeFileSync(uri, bufferData);
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
    var factory = {
        _saveConfigData: function(bufferData) {
            saveFile(__commonConstant__.path + __commonConstant__.config, bufferData, true);
        },
        _getConfigData: function() {
            if (runtimeCollection._get('_ENV_').insideForm) return interFace._getConfigData();
            return readFile(__commonConstant__.path + __commonConstant__.config, 'utf8', 'json');
        },
        _getSysConfig: function() {
            return commonFunc._getJson('./asset/json/systemconfig.json');
        },
        _getCustomConfig: function() {
            return readFile(__commonConstant__.path + __commonConstant__.customConfig, 'utf8', 'json');
        },
        _getScaleList: function() {
            if (runtimeCollection._get('_ENV_').insideForm) return interFace._getScaleList();
            if (!__nodeFs__) return null;
            var resultList = [];
            var files = __nodeFs__.readdirSync(__commonConstant__.path);
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf(__commonConstant__.scale) <= 0) continue;
                var states = __nodeFs__.statSync(__commonConstant__.path + files[i]);
                if (states.isDirectory()) continue;
                resultList.push(files[i].substring(0, files[i].indexOf(__commonConstant__.scale)));
            }
            if (resultList.length <= 0) resultList.push('braden');
            return resultList;
        },
        _getAScale: function(table) {
            if (runtimeCollection._get('_ENV_').insideForm) return interFace._getAScale(table);
            var result = readFile(__commonConstant__.path + table + __commonConstant__.scale, 'utf8', 'json');
            if (!result) {
                sharingDataSet._set('defaultScale', 'braden');
                result = commonFunc._getJson('./asset/json/defaultscale.json');
            }
            if (result.descriptionItem && result.descriptionItem.length) {
                for (var i = 0; i < result.descriptionItem.length; i++) {
                    if (!result.descriptionItem[i].items || !result.descriptionItem[i].items.length) continue;
                    result.descriptionItem[i].items.sort(function(a, b) {
                        return commonFunc._toInt(a.value) - commonFunc._toInt(b.value);
                    });
                }
            }
            return result;
        },
        _saveScaleTable: function() {
            if (runtimeCollection._get('_ENV_').insideForm) {
                interFace._saveScaleTable(sharingDataSet._get('defaultScale'), JSON.stringify(sharingDataSet._get('activedScale')));
                return;
            }
            saveFile(__commonConstant__.path + sharingDataSet._get('defaultScale') + __commonConstant__.scale,
                JSON.stringify(sharingDataSet._get('activedScale')), true);
        },
        _saveGaitRecord: function(recordCollection) {
            if (!recordCollection ||
                !recordCollection.startTimestamp || !recordCollection.finishedTimestamp ||
                !recordCollection.canvasData || !recordCollection.canvasData.length)
                return;
            var savePath = __commonConstant__.path + 'gait' + recordCollection.startTimestamp;
            if (!runtimeCollection._get('_ENV_').insideForm) makeDir(savePath);
            for (var i = 0; i < recordCollection.canvasData.length; i++) {
                var base64Data = recordCollection.canvasData[i].image.toDataURL().replace(/^data:image\/\w+;base64,/, "");
                if (!runtimeCollection._get('_ENV_').insideForm) {
                    var dataBuffer = new Buffer(base64Data, 'base64');
                    saveFile(savePath + '/' + recordCollection.canvasData[i].timestamp + '.png', dataBuffer, true);
                } else
                    interFace._saveGaitRecord(recordCollection.startTimestamp, recordCollection.canvasData[i].timestamp, base64Data);
            }
        },
        _findHistories: function(forceDir, path, typeMark) {
            if (runtimeCollection._get('_ENV_').insideForm) {
                return interFace._findHistories(forceDir, path, typeMark);
            }
            if (!__nodeFs__) return null;
            try {
                var resultList = [];
                var realPath = path ? __commonConstant__.path + path.replace(__commonConstant__.path, '') : __commonConstant__.path;
                if (realPath.lastIndexOf('/') !== realPath.length - 1) realPath += '/';
                var files = __nodeFs__.readdirSync(realPath);
                for (var i = 0; i < files.length; i++) {
                    var states = __nodeFs__.statSync(realPath + files[i]);
                    var theFileName = files[i];
                    if (typeMark) theFileName = theFileName.replace(typeMark, '');
                    if (!commonFunc._toFloat(theFileName)) continue;
                    if ((forceDir && states.isDirectory()) || !forceDir)
                        resultList.push({
                            path: realPath + files[i],
                            name: theFileName
                        });
                }
                return resultList;
            } catch (e) {
                console.log(e.message);
                return null;
            }
        },
        _saveReportOverview: function(analysisReport) {
            var runtimeInfo = runtimeCollection._get('runtimeInfo');
            var startTimestamp = runtimeInfo.startTimestamp;
            var finishedTimestamp = runtimeInfo.finishedTimestamp;
            var savePath = __commonConstant__.path + 'gait' + startTimestamp;
            if (!runtimeCollection._get('_ENV_').insideForm) makeDir(savePath);
            var overviewData = {};
            overviewData.startTimestamp = startTimestamp;
            overviewData.finishedTimestamp = finishedTimestamp;
            var keepTimes = finishedTimestamp - startTimestamp;
            overviewData.avgStepFrequency = (analysisReport.stepCount / (keepTimes / 60000)).toFixed(2);
            overviewData.avgStepLength = analysisReport.avgStepLength.toFixed(2);
            overviewData.avgStepSpeed = (analysisReport.samplingDist / (keepTimes / 1000)).toFixed(2);
            overviewData.stepLengthDeviation = analysisReport.stepLengthDeviation.toFixed(2);
            overviewData.stepWidth = analysisReport.stepWidth.toFixed(2);
            if (!runtimeCollection._get('_ENV_').insideForm)
                saveFile(savePath + '/' + finishedTimestamp + '.json', JSON.stringify(overviewData), true);
            else interFace._saveReportOverview(finishedTimestamp, JSON.stringify(overviewData));
        },
        _getReportOverview: function(uri) {
            if (runtimeCollection._get('_ENV_').insideForm) {
                interFace._getReportOverview(uri);
                return;
            }
            if (!__nodeFs__) return null;
            if (uri.lastIndexOf('/') !== uri.length - 1) uri += '/';
            var files = __nodeFs__.readdirSync(uri);
            for (var i = 0; i < files.length; i++) {
                //var states = __nodeFs__.statSync(uri + files[i]);
                //if (states.isDirectory()) continue;
                if (files[i].indexOf('.json') <= 0) continue;
                if (!commonFunc._toFloat(files[i].substring(0, files[i].indexOf('.json')))) continue;
                uri += files[i];
                break;
            }
            return readFile(uri, 'utf8', 'json');
        },
        _outputAKeepRecord: function(fileName, map, dirSub) {
            if (runtimeCollection._get('_ENV_').insideForm) {
                interFace._outputAKeepRecord(fileName, map, dirSub);
                return;
            }
            if (!fileName || !map) return;
            var savePath = __commonConstant__.path + 'records';
            makeDir(savePath);
            if (dirSub) {
                savePath += '/' + dirSub;
                makeDir(savePath);
            }
            var dataBuffer = new Buffer(map, 'base64');
            saveFile(savePath + '/' + fileName + '.png', dataBuffer, true);
        }
    };
    return factory;
});