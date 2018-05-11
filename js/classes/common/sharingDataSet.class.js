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
})("sharingDataSet", this, function() {
    'use strict';
    var privateDataSet = {};

    var insideCollection = {};

    var dataSetFactory = {
        _set: function(key, value) {
            privateDataSet[key] = value;
        },
        _get: function(key) {
            if (privateDataSet.hasOwnProperty(key))
                switch (typeof privateDataSet[key]) {
                    case 'object':
                        return JSON.parse(JSON.stringify(privateDataSet[key]));
                    default:
                        return privateDataSet[key];
                }
            return null;
        },
        _delete: function(key) {
            delete privateDataSet[key];
        },
        _getMap: function() {
            return JSON.stringify(privateDataSet);
        },
        _resetDataSet: function() {
            privateDataSet = null;
            privateDataSet = {};
        },
        _getConfigData: function() {
            var result = {};
            result.lang = privateDataSet.hasOwnProperty('lang') ? privateDataSet.lang : 'zh-cn';
            result.minNoiseLimit = privateDataSet.hasOwnProperty('minNoiseLimit') ? privateDataSet.minNoiseLimit : 0;
            result.maxNoiseLimit = privateDataSet.hasOwnProperty('maxNoiseLimit') ? privateDataSet.maxNoiseLimit : 100;
            result.alarmFrequency = privateDataSet.hasOwnProperty('alarmFrequency') ? privateDataSet.alarmFrequency : 0.5;
            result.alarmKeepTime = privateDataSet.hasOwnProperty('alarmKeepTime') ? privateDataSet.alarmKeepTime : 5;
            result.alarmType = privateDataSet.hasOwnProperty('alarmType') ? privateDataSet.alarmType : 0;
            result.levelHighNote = privateDataSet.hasOwnProperty('levelHighNote') ? privateDataSet.levelHighNote : 0;
            result.keepRecord = privateDataSet.hasOwnProperty('keepRecord') ? privateDataSet.keepRecord : false;
            result.defaultScale = privateDataSet.hasOwnProperty('defaultScale') ? privateDataSet.defaultScale : 'braden';
            //result.calibrationData = privateDataSet.hasOwnProperty('calibrationData') ? privateDataSet.calibrationData : null;
            result.sysCfgUse = privateDataSet.hasOwnProperty('sysCfgUse') ? privateDataSet.sysCfgUse : 0;
            result.forceProduct = privateDataSet.hasOwnProperty('forceProduct') ? privateDataSet.forceProduct : 'A0';
            return result;
        },
        _setConfigData: function() {
            var cfg = io._getConfigData();
            if (!cfg) return true;
            if (cfg.hasOwnProperty('lang')) privateDataSet.lang = cfg.lang;
            if (cfg.hasOwnProperty('minNoiseLimit')) privateDataSet.minNoiseLimit = cfg.minNoiseLimit;
            if (cfg.hasOwnProperty('maxNoiseLimit')) privateDataSet.maxNoiseLimit = cfg.maxNoiseLimit;
            if (cfg.hasOwnProperty('alarmFrequency')) privateDataSet.alarmFrequency = cfg.alarmFrequency;
            if (cfg.hasOwnProperty('alarmKeepTime')) privateDataSet.alarmKeepTime = cfg.alarmKeepTime;
            if (cfg.hasOwnProperty('alarmType')) privateDataSet.alarmType = cfg.alarmType;
            if (cfg.hasOwnProperty('levelHighNote')) privateDataSet.levelHighNote = cfg.levelHighNote;
            if (cfg.hasOwnProperty('keepRecord')) privateDataSet.keepRecord = cfg.keepRecord;
            if (cfg.hasOwnProperty('defaultScale')) privateDataSet.defaultScale = cfg.defaultScale;
            //if (cfg.hasOwnProperty('calibrationData')) privateDataSet.calibrationData = cfg.calibrationData;
            if (cfg.hasOwnProperty('sysCfgUse')) privateDataSet.sysCfgUse = cfg.sysCfgUse;
            if (cfg.hasOwnProperty('forceProduct')) privateDataSet.forceProduct = cfg.forceProduct;
            return false;
        },
        _setScaleList: function() {
            privateDataSet.scaleList = io._getScaleList();
        },
        _setKeepRecordCollection: function(map) {
            if (!insideCollection.keepRecord) insideCollection.keepRecord = {};
            if (!insideCollection.keepRecord.startTimestamp)
                insideCollection.keepRecord.startTimestamp = (new Date()).getTime();
            if (!insideCollection.startTimeStamp)
                insideCollection.startTimeStamp = (new Date()).getTime();
            if (!map) return;
            if (!insideCollection.keepRecord.map) insideCollection.keepRecord.map = map;
        },
        _outputKeepRecord: function(leaveFlg) {
            if (insideCollection && insideCollection.keepRecord &&
                insideCollection.keepRecord.startTimestamp && insideCollection.keepRecord.map) {
                var nowTime = (new Date()).getTime();
                if (leaveFlg || Math.abs(nowTime - insideCollection.keepRecord.startTimestamp) > 8000)
                    io._outputAKeepRecord(
                        insideCollection.keepRecord.startTimestamp + '-' + nowTime,
                        insideCollection.keepRecord.map,
                        insideCollection.startTimeStamp);
            }
            if (leaveFlg) insideCollection.startTimeStamp = null;
            insideCollection.keepRecord = null;
        },
        _forceClearKeepRecord: function() {
            insideCollection.keepRecord = null;
        }
    };
    return dataSetFactory;
});