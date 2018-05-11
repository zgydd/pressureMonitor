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
})("matrixKeeper", this, function() {
    'use strict';

    var __commonValueParam__ = {
        minValue: 0,
        maxValue: 4096,
        minPercentage: 0,
        maxPercentage: 100
    };

    var __data__ = null;
    var __calibrationData__ = null;

    var __listener__ = {
        dataModifyListener: [],
        dataDisCalibrationListener: []
    };

    var registerModifyListener = function(func) {
        commonFunc._registerListener(__listener__.dataModifyListener, func);
    };
    var unRegisterModifyListener = function(func) {
        commonFunc._unRegisterListener(__listener__.dataModifyListener, func);
    };
    var registerDisCalibrationListener = function(func) {
        commonFunc._registerListener(__listener__.dataDisCalibrationListener, func);
    };
    var unRegisterDisCalibrationListener = function(func) {
        commonFunc._unRegisterListener(__listener__.dataDisCalibrationListener, func);
    };
    var getBaseVariance = function() {
        var result = 800;
        switch (runtimeCollection._get('productInfo').type) {
            case 'A1':
                result = 300;
                break;
            case 'A2':
            case 'A4':
                result = 1500;
                break;
            default:
                break;
        }
        return result;
    };
    var getCalibrationValue = function(i, j) {
        var calibrateValue = 0;
        if (__calibrationData__ &&
            __calibrationData__.length && __calibrationData__.length > i &&
            __calibrationData__[i].length > j)
            calibrateValue = __calibrationData__[i][j];
        return calibrateValue;
    };
    var refreshLimitedValue = function(innerResult, type) {
        var activedInfo = runtimeCollection._get('activedInfo');
        if (!activedInfo || !activedInfo.config || !activedInfo.config.size) return;
        var limitType = 0;
        var limit = null;
        var defaultValue = 0;
        switch (type) {
            case 0:
                defaultValue = __commonValueParam__.minValue;
                break;
            case 1:
                defaultValue = __commonValueParam__.minPercentage;
                break;
            default:
                break;
        }
        if (activedInfo.config.range &&
            typeof activedInfo.config.range.minX === 'number' &&
            typeof activedInfo.config.range.maxX === 'number' &&
            typeof activedInfo.config.range.minY === 'number' &&
            typeof activedInfo.config.range.maxY === 'number') {
            limitType = 1;
            limit = {
                x: {
                    min: activedInfo.config.range.minX,
                    max: activedInfo.config.range.maxX
                },
                y: {
                    min: activedInfo.config.range.minY,
                    max: activedInfo.config.range.maxY
                }
            }
        }
        if (activedInfo.config.points && activedInfo.config.points.length) {
            limitType = 2;
            limit = [];
            for (var i = 0; i < activedInfo.config.points.length; i++) {
                if (typeof activedInfo.config.points[i] === 'string' &&
                    activedInfo.config.points[i].indexOf('-') > 0 &&
                    activedInfo.config.points[i].split('-').length === 2)
                    limit.push(activedInfo.config.points[i]);
            }
        }
        if (activedInfo.config.excludes) {
            limitType = 3;
            limit = [];
            for (var i = 0; i < activedInfo.config.excludes.length; i++) {
                if (typeof activedInfo.config.excludes[i] === 'string' &&
                    activedInfo.config.excludes[i].indexOf('-') > 0 &&
                    activedInfo.config.excludes[i].split('-').length === 2)
                    limit.push(activedInfo.config.excludes[i]);
            }
        }
        if (limitType === 0 || !limit) return;
        for (var i = 0; i < innerResult.length; i++) {
            for (var j = 0; j < innerResult[i].length; j++) {
                switch (limitType) {
                    case 1:
                        if (i < limit.x.min || i > limit.x.max ||
                            j < limit.y.min || j > limit.y.max)
                            innerResult[i][j] = defaultValue;
                        break;
                    case 2:
                        if (limit.indexOf(i + '-' + j) < 0)
                            innerResult[i][j] = defaultValue;
                        break;
                    case 3:
                        if (limit.indexOf(i + '-' + j) >= 0)
                            innerResult[i][j] = defaultValue;
                        break;
                    default:
                        break;
                }
            }
        }
    };
    var autoCalibration = function() {
        var productInfo = runtimeCollection._get('productInfo');
        /*
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        var calibrationDelay = 1;
        if (!runtimeInfo.calibrationDelay)
            runtimeInfo.calibrationDelay = calibrationDelay;
        else calibrationDelay = runtimeInfo.calibrationDelay;
        if (calibrationDelay < 21) {
            runtimeInfo.calibrationDelay = ++calibrationDelay;
            return;
        }
        runtimeInfo.calibrationDelay = 1;
        */
        if (!__data__ || !__data__.length || !__data__[0].length) return;
        if (!productInfo.size) {
            __calibrationData__ = __data__.clone();
            return;
        }
        if (!__calibrationData__.length || __calibrationData__.length !== productInfo.size.x ||
            __calibrationData__[0].length !== productInfo.size.y) {
            __calibrationData__ = __data__.clone();
            return;
        }
        var variance = 0;
        var cntData = productInfo.size.x * productInfo.size.y;
        var baseDataList = [];
        var innerDataList = [];
        for (var i = 0; i < __calibrationData__.length; i++) {
            for (var j = 0; j < __calibrationData__[i].length; j++) {
                variance += Math.pow((__data__[i][j] - __calibrationData__[i][j]), 2);
                if (Math.abs(__data__[i][j] - __calibrationData__[i][j]) != 0) {
                    baseDataList.push(__calibrationData__[i][j]);
                    innerDataList.push(__data__[i][j]);
                }
            }
        }
        var avgCalibration = eval(baseDataList.join('+')) / cntData;
        var avgInner = eval(innerDataList.join('+')) / cntData;
        if (Math.floor(avgInner) < Math.ceil(avgCalibration)) {
            __calibrationData__ = __data__.clone();
            return;
        }
        variance = variance / cntData;
        if (variance < getBaseVariance()) {
            __calibrationData__ = __data__.clone();
            return;
        }
        for (var i = 0; i < __listener__.dataDisCalibrationListener.length; i++)
            __listener__.dataDisCalibrationListener[i]();
    };
    var factory = {
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'Modify':
                    registerModifyListener(func);
                    break;
                case 'DisCalibration':
                    registerDisCalibrationListener(func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'Modify':
                    unRegisterModifyListener(func);
                    break;
                case 'DisCalibration':
                    unRegisterDisCalibrationListener(func);
                    break;
                default:
                    break;
            }
        },
        _setData: function(data) {
            __data__ = null;
            __data__ = data;
            autoCalibration();
            for (var i = 0; i < __listener__.dataModifyListener.length; i++)
                __listener__.dataModifyListener[i]();
        },
        _setCalibrationData: function(calibrationData) {
            __calibrationData__ = null;
            __calibrationData__ = calibrationData;
        },
        _getData: function() {
            return __data__.clone();
        },
        _getCalibrationData: function() {
            return __calibrationData__.clone();
        },
        _getConstantParam: function() {
            return JSON.parse(JSON.stringify(__commonValueParam__));
        },
        _getIncremental: function() {
            var minLimit = commonFunc._toInt(sharingDataSet._get('minNoiseLimit'));
            var maxLimit = commonFunc._toInt(sharingDataSet._get('maxNoiseLimit'));
            var inner = [];
            for (var i = 0; i < __data__.length; i++) {
                var row = [];
                for (var j = 0; j < __data__[i].length; j++) {
                    var value = __data__[i][j];
                    var calibrateValue = getCalibrationValue(i, j);
                    var incremental = ((value > calibrateValue) ?
                        (value - calibrateValue) : __commonValueParam__.minValue);
                    var percentage = incremental / (__commonValueParam__.maxValue - calibrateValue);
                    if (percentage < minLimit / 100) incremental = __commonValueParam__.minValue;
                    if (percentage > maxLimit / 100)
                        incremental = (__commonValueParam__.maxValue - calibrateValue);
                    row.push(incremental);
                }
                inner.push(row);
            }
            refreshLimitedValue(inner, 0);
            return inner;
        },
        _getPercentage: function() {
            var minLimit = commonFunc._toInt(sharingDataSet._get('minNoiseLimit'));
            var maxLimit = commonFunc._toInt(sharingDataSet._get('maxNoiseLimit'));
            var inner = [];
            for (var i = 0; i < __data__.length; i++) {
                var row = [];
                for (var j = 0; j < __data__[i].length; j++) {
                    var value = __data__[i][j];
                    var calibrateValue = getCalibrationValue(i, j);
                    var incremental = ((value > calibrateValue) ?
                        (value - calibrateValue) : __commonValueParam__.minValue);
                    var percentage = incremental / (__commonValueParam__.maxValue - calibrateValue);
                    if (percentage < minLimit / 100)
                        percentage = __commonValueParam__.minPercentage;
                    if (percentage > maxLimit / 100)
                        percentage = __commonValueParam__.maxPercentage;
                    row.push(percentage);
                }
                inner.push(row);
            }
            refreshLimitedValue(inner, 1);
            return inner;
        },
        _forceCalibreData: function() {
            __calibrationData__ = __data__.clone();
        }
    };
    return factory;
});