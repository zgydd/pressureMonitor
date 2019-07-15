;
var Pmatrixkeeper = (function pmatrixkeeperClosure() {
    'use strict';

    function Pmatrixkeeper() {
        this.__id__ = arguments[0];
        var max = (arguments[1] ? commonFunc._toInt(arguments[1]) : 4096);
        var min = (arguments[2] ? commonFunc._toInt(arguments[2]) : 0);
        this.__commonValueParam__ = {
            minValue: min,
            maxValue: max,
            minPercentage: 0,
            maxPercentage: 100
        };
        this.__data__ = null;
        this.__calibrationData__ = null;
        this.__privateParams__ = {
            maxValue: max,
            innerMatrix: null,
            scanModFlg: {},
            listener: []
        };
    };
    Pmatrixkeeper.prototype = {
        getBaseVariance: function(type) {
            var result = rootScope._get('_ENV_').systemConfig[type].baseVariance;
            if (!result) result = 800;
            /*
            switch (type) {
                case 'A1':
                    result = 300;
                    break;
                case 'A2':
                case 'A4':
                    result = 1500;
                    break;
                case 'B1':
                case 'B2':
                case 'B3':
                    result = 5;
                    break;
                default:
                    break;
            }
            */
            return result;
        },
        autoCalibration: function(productInfo) {
            if (!this.__data__ || !this.__data__.length || !this.__data__[0].length) return;
            if (!productInfo.size) {
                this.__calibrationData__ = this.__data__.clone();
                return;
            }
            if (!this.__calibrationData__ || !this.__calibrationData__.length || this.__calibrationData__.length !== productInfo.size.x || this.__calibrationData__[0].length !== productInfo.size.y) {
                this.__calibrationData__ = this.__data__.clone();
                return;
            }
            var variance = 0;
            var cntData = productInfo.size.x * productInfo.size.y;
            var baseDataList = [];
            var innerDataList = [];
            for (var i = 0; i < this.__calibrationData__.length; i++) {
                for (var j = 0; j < this.__calibrationData__[i].length; j++) {
                    variance += Math.pow((this.__data__[i][j] - this.__calibrationData__[i][j]), 2);
                    if (Math.abs(this.__data__[i][j] - this.__calibrationData__[i][j]) != 0) {
                        baseDataList.push(this.__calibrationData__[i][j]);
                        innerDataList.push(this.__data__[i][j]);
                    }
                }
            }
            var avgCalibration = eval(baseDataList.join('+')) / cntData;
            var avgInner = eval(innerDataList.join('+')) / cntData;
            if (Math.floor(avgInner) < Math.ceil(avgCalibration)) {
                this.__calibrationData__ = this.__data__.clone();
                return;
            }
            variance = variance / cntData;
            //console.log(variance);
            if (variance < this.getBaseVariance(productInfo.type)) {
                this.__calibrationData__ = this.__data__.clone();
                return;
            }
        },
        getCalibrationValue: function(i, j) {
            var calibrateValue = 0;
            if (this.__calibrationData__ && this.__calibrationData__.length && this.__calibrationData__.length > i && this.__calibrationData__[i].length > j) calibrateValue = this.__calibrationData__[i][j];
            return calibrateValue;
        },
        setDefaultCalibration: function(cfg) {
            if (!cfg || !cfg.size || !cfg.size.x || !cfg.size.y) return;
            if (this.__calibrationData__ && this.__calibrationData__.length === cfg.size.x && this.__calibrationData__[0].length === cfg.size.y) return;
            var defaultValue = (cfg.lowLimit ? cfg.lowLimit : 0);
            this.__calibrationData__ = [];
            for (var i = 0; i < cfg.size.x; i++) {
                var row = [];
                for (var j = 0; j < cfg.size.y; j++) {
                    row.push(defaultValue);
                }
                this.__calibrationData__.push(row);
            }
        },
        getIncremental: function() {
            var cfg = rootScope._get('_ENV_').systemConfig[this.__productInfo__.type];
            var needCalibration = ((cfg && cfg.autoCalibration) ? true : false);
            var noiseFilter = ((!needCalibration && cfg && cfg.noiseFilter) ? cfg.noiseFilter : 0);
            var inner = [];
            for (var i = 0; i < this.__data__.length; i++) {
                var row = [];
                for (var j = 0; j < this.__data__[i].length; j++) {
                    var value = this.__data__[i][j];
                    var calibrateValue = this.getCalibrationValue(i, j);
                    var incremental = -1;
                    switch (this.__limit__.limitType) {
                        case 1:
                            if (i < this.__limit__.limit.x.min || i > this.__limit__.limit.x.max || j < this.__limit__.limit.y.min || j > this.__limit__.limit.y.max) incremental = this.__commonValueParam__.minValue;
                            break;
                        case 2:
                            if (this.__limit__.limit.indexOf(i + '-' + j) < 0) incremental = this.__commonValueParam__.minValue;
                            break;
                        case 3:
                            if (this.__limit__.limit.indexOf(i + '-' + j) >= 0) incremental = this.__commonValueParam__.minValue;
                            break;
                        default:
                            break;
                    }
                    if (!needCalibration) incremental = ((value > noiseFilter) ? value : 0);
                    else if (incremental < 0) incremental = ((value > calibrateValue) ? (value - calibrateValue) : 0);
                    row.push(incremental);
                }
                inner.push(row);
            }
            return inner;
        },
        getPercentage: function() {
            var cfg = rootScope._get('_ENV_').systemConfig[this.__productInfo__.type];
            var inner = [];
            var needCalibration = ((cfg && cfg.autoCalibration) ? true : false);
            var noiseFilter = ((!needCalibration && cfg && cfg.noiseFilter) ? cfg.noiseFilter : 0);
            for (var i = 0; i < this.__data__.length; i++) {
                var row = [];
                for (var j = 0; j < this.__data__[i].length; j++) {
                    var value = this.__data__[i][j];
                    var calibrateValue = this.getCalibrationValue(i, j);
                    var percentage = -1;
                    switch (this.__limit__.limitType) {
                        case 1:
                            if (i < this.__limit__.limit.x.min || i > this.__limit__.limit.x.max || j < this.__limit__.limit.y.min || j > this.__limit__.limit.y.max) percentage = this.__commonValueParam__.minPercentage;
                            break;
                        case 2:
                            if (this.__limit__.limit.indexOf(i + '-' + j) < 0) percentage = this.__commonValueParam__.minPercentage;
                            break;
                        case 3:
                            if (this.__limit__.limit.indexOf(i + '-' + j) >= 0) percentage = this.__commonValueParam__.minPercentage;
                            break;
                        default:
                            break;
                    }
                    if (percentage < 0) {
                        if (!needCalibration) percentage = ((value > noiseFilter) ? value : 0) / this.__commonValueParam__.maxValue;
                        else percentage = ((value > calibrateValue) ? (value - calibrateValue) : this.__commonValueParam__.minValue) / (this.__commonValueParam__.maxValue - calibrateValue);
                    }
                    row.push(percentage);
                }
                inner.push(row);
            }
            return inner;
        },
        insertScanModFlg: function(i, j, data) {
            if (this.__privateParams__.scanModFlg.hasOwnProperty(i + '-' + j) && commonFunc._isArray(this.__privateParams__.scanModFlg[i + '-' + j])) this.__privateParams__.scanModFlg[i + '-' + j].push(data);
            else this.__privateParams__.scanModFlg[i + '-' + j] = [data];
        },
        dilationMatrix: function() {
            if (!this.__privateParams__.innerMatrix) this.__privateParams__.innerMatrix = this.getIncremental();
            var dispersionEdge = 0;
            var dispersionCorner = 0;
            for (var i = 1; i < this.__privateParams__.innerMatrix.length - 1; i++) {
                for (var j = 1; j < this.__privateParams__.innerMatrix[i].length - 1; j++) {
                    if (this.__privateParams__.innerMatrix[i][j] <= 0) continue;
                    dispersionEdge = commonFunc._getDispersionEdge(this.__privateParams__.innerMatrix[i][j]);
                    dispersionCorner = commonFunc._getDispersionCorner(this.__privateParams__.innerMatrix[i][j]);
                    if (this.__privateParams__.innerMatrix[i - 1][j - 1] < dispersionCorner) this.insertScanModFlg(i - 1, j - 1, dispersionCorner);
                    if (this.__privateParams__.innerMatrix[i - 1][j] < dispersionEdge) this.insertScanModFlg(i - 1, j, dispersionEdge);
                    if (this.__privateParams__.innerMatrix[i - 1][j + 1] < dispersionCorner) this.insertScanModFlg(i - 1, j + 1, dispersionCorner);
                    if (this.__privateParams__.innerMatrix[i][j - 1] < dispersionEdge) this.insertScanModFlg(i, j - 1, dispersionEdge);
                    if (this.__privateParams__.innerMatrix[i][j + 1] < dispersionEdge) this.insertScanModFlg(i, j + 1, dispersionEdge);
                    if (this.__privateParams__.innerMatrix[i + 1][j + 1] < dispersionCorner) this.insertScanModFlg(i + 1, j + 1, dispersionCorner);
                    if (this.__privateParams__.innerMatrix[i + 1][j] < dispersionEdge) this.insertScanModFlg(i + 1, j, dispersionEdge);
                    if (this.__privateParams__.innerMatrix[i + 1][j - 1] < dispersionCorner) this.insertScanModFlg(i + 1, j - 1, dispersionCorner);
                }
            }
            for (var i = 1; i < this.__privateParams__.innerMatrix.length - 1; i++) {
                for (var j = 1; j < this.__privateParams__.innerMatrix[i].length - 1; j++) {
                    if (this.__privateParams__.scanModFlg.hasOwnProperty(i + '-' + j)) this.__privateParams__.innerMatrix[i][j] = Math.max(this.__privateParams__.innerMatrix[i][j], Math.max.apply(null, this.__privateParams__.scanModFlg[i + '-' + j]));
                }
            }
            this.__privateParams__.scanModFlg = null;
            this.__privateParams__.scanModFlg = {};
        },
        corrosionMatrix: function() {
            if (!this.__privateParams__.innerMatrix) this.__privateParams__.innerMatrix = this.getIncremental();
            var dispersionEdge = 0;
            var dispersionCorner = 0;
            for (var i = 1; i < this.__privateParams__.innerMatrix.length - 1; i++) {
                for (var j = 1; j < this.__privateParams__.innerMatrix[i].length - 1; j++) {
                    if (this.__privateParams__.innerMatrix[i][j] <= 0) continue;
                    var p1 = this.__privateParams__.innerMatrix[i][j];
                    var p2 = this.__privateParams__.innerMatrix[i - 1][j];
                    var p3 = this.__privateParams__.innerMatrix[i - 1][j + 1];
                    var p4 = this.__privateParams__.innerMatrix[i][j + 1];
                    var p5 = this.__privateParams__.innerMatrix[i + 1][j + 1];
                    var p6 = this.__privateParams__.innerMatrix[i + 1][j];
                    var p7 = this.__privateParams__.innerMatrix[i + 1][j - 1];
                    var p8 = this.__privateParams__.innerMatrix[i][j - 1];
                    var p9 = this.__privateParams__.innerMatrix[i - 1][j - 1];
                    var maxLine = Math.max(p8 + p4, p2 + p6, p9 + p5, p7 + p3);
                    var chkNum = commonFunc._checkEqualLine([p8 + p4, p2 + p6, p9 + p5, p7 + p3]);
                    dispersionEdge = commonFunc._getDispersionEdge(p1);
                    dispersionCorner = commonFunc._getDispersionCorner(p1);
                    switch (true) {
                        case (chkNum > 0):
                            //console.log('多向' + chkNum + ':' + i + '-' + j);
                            break;
                        case (maxLine === p8 + p4):
                            //console.log('横向' + i + '-' + j);
                            switch (true) {
                                case (p9 + p2 + p3 > p5 + p6 + p7):
                                    if (i >= this.__privateParams__.innerMatrix.length - 2 || (this.__privateParams__.innerMatrix[i + 2][j - 1] + this.__privateParams__.innerMatrix[i + 2][j] + this.__privateParams__.innerMatrix[i + 2][j - 1] <= this.__privateParams__.maxValue * 0.15)) {
                                        this.insertScanModFlg(i + 1, j + 1, dispersionCorner);
                                        this.insertScanModFlg(i + 1, j, dispersionEdge);
                                        this.insertScanModFlg(i + 1, j - 1, dispersionCorner);
                                        this.insertScanModFlg(i, j - 1, commonFunc._getDispersionEdge(p7));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p6));
                                        this.insertScanModFlg(i, j + 1, commonFunc._getDispersionEdge(p5));
                                    }
                                    break;
                                case (p9 + p2 + p3 < p5 + p6 + p7):
                                    if (i < 2 || (this.__privateParams__.innerMatrix[i - 2][j - 1] + this.__privateParams__.innerMatrix[i - 2][j] + this.__privateParams__.innerMatrix[i - 2][j - 1] <= this.__privateParams__.maxValue * 0.15)) {
                                        this.insertScanModFlg(i - 1, j - 1, dispersionCorner);
                                        this.insertScanModFlg(i - 1, j, dispersionEdge);
                                        this.insertScanModFlg(i - 1, j + 1, dispersionCorner);
                                        this.insertScanModFlg(i, j - 1, commonFunc._getDispersionEdge(p9));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p2));
                                        this.insertScanModFlg(i, j + 1, commonFunc._getDispersionEdge(p3));
                                    }
                                    break;
                                default:
                                    continue;
                            }
                            break;
                        case (maxLine === p2 + p6):
                            //console.log('竖向' + i + '-' + j);
                            switch (true) {
                                case (p7 + p8 + p9 > p3 + p4 + p5):
                                    if (j >= this.__privateParams__.innerMatrix[i].length - 2 || (this.__privateParams__.innerMatrix[i - 1][j + 2] + this.__privateParams__.innerMatrix[i][j + 2] + this.__privateParams__.innerMatrix[i + 1][j + 2] <= this.__privateParams__.maxValue * 0.15)) {
                                        this.insertScanModFlg(i - 1, j + 1, dispersionCorner);
                                        this.insertScanModFlg(i, j + 1, dispersionEdge);
                                        this.insertScanModFlg(i + 1, j + 1, dispersionCorner);
                                        this.insertScanModFlg(i - 1, j, commonFunc._getDispersionEdge(p3));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p4));
                                        this.insertScanModFlg(i + 1, j, commonFunc._getDispersionEdge(p5));
                                    }
                                    break;
                                case (p7 + p8 + p9 < p3 + p4 + p5):
                                    if (j < 2 || (this.__privateParams__.innerMatrix[i - 1][j - 2] + this.__privateParams__.innerMatrix[i][j - 2] + this.__privateParams__.innerMatrix[i + 1][j - 2] <= this.__privateParams__.maxValue * 0.15)) {
                                        this.insertScanModFlg(i + 1, j - 1, dispersionCorner);
                                        this.insertScanModFlg(i, j - 1, dispersionEdge);
                                        this.insertScanModFlg(i - 1, j - 1, dispersionCorner);
                                        this.insertScanModFlg(i - 1, j, commonFunc._getDispersionEdge(p9));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p8));
                                        this.insertScanModFlg(i + 1, j, commonFunc._getDispersionEdge(p7));
                                    }
                                    break;
                                default:
                                    continue;
                            }
                            break;
                        case (maxLine === p9 + p5):
                            //console.log('左斜' + i + '-' + j);
                            switch (true) {
                                case (p2 + p3 + p4 > p6 + p7 + p8):
                                    var tmpChkFlg = (i >= this.__privateParams__.innerMatrix.length - 2) ? 0 : this.__privateParams__.innerMatrix[i + 2][j];
                                    tmpChkFlg += (j < 2) ? 0 : this.__privateParams__.innerMatrix[i][j - 2];
                                    if (tmpChkFlg <= this.__privateParams__.maxValue * 0.1) {
                                        this.insertScanModFlg(i + 1, j, dispersionEdge);
                                        this.insertScanModFlg(i + 1, j - 1, dispersionCorner);
                                        this.insertScanModFlg(i, j - 1, dispersionEdge);
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p6));
                                        this.insertScanModFlg(i + 1, j + 1, commonFunc._getDispersionEdge(p6));
                                        this.insertScanModFlg(i - 1, j - 1, commonFunc._getDispersionEdge(p8));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p8));
                                    }
                                    break;
                                case (p2 + p3 + p4 < p6 + p7 + p8):
                                    var tmpChkFlg = (i < 2) ? 0 : this.__privateParams__.innerMatrix[i - 2][j];
                                    tmpChkFlg += (j >= this.__privateParams__.innerMatrix[i].length - 2) ? 0 : this.__privateParams__.innerMatrix[i][j + 2];
                                    if (tmpChkFlg <= this.__privateParams__.maxValue * 0.1) {
                                        this.insertScanModFlg(i - 1, j, dispersionEdge);
                                        this.insertScanModFlg(i - 1, j + 1, dispersionCorner);
                                        this.insertScanModFlg(i, j + 1, dispersionEdge);
                                        this.insertScanModFlg(i - 1, j - 1, commonFunc._getDispersionEdge(p2));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p2));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p4));
                                        this.insertScanModFlg(i + 1, j + 1, commonFunc._getDispersionEdge(p4));
                                    }
                                    break;
                                default:
                                    continue;
                            }
                            break;
                        case (maxLine === p7 + p3):
                            //console.log('右斜' + i + '-' + j);
                            switch (true) {
                                case (p2 + p8 + p9 > p4 + p5 + p6):
                                    var tmpChkFlg = (j >= this.__privateParams__.innerMatrix[i].length - 2) ? 0 : this.__privateParams__.innerMatrix[i][j + 2];
                                    tmpChkFlg += (i >= this.__privateParams__.innerMatrix.length - 2) ? 0 : this.__privateParams__.innerMatrix[i + 2][j];
                                    if (tmpChkFlg <= this.__privateParams__.maxValue * 0.1) {
                                        this.insertScanModFlg(i, j + 1, dispersionEdge);
                                        this.insertScanModFlg(i + 1, j + 1, dispersionCorner);
                                        this.insertScanModFlg(i + 1, j, dispersionEdge);
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p4));
                                        this.insertScanModFlg(i - 1, j + 1, commonFunc._getDispersionEdge(p4));
                                        this.insertScanModFlg(i + 1, j - 1, commonFunc._getDispersionEdge(p6));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p6));
                                    }
                                    break;
                                case (p2 + p8 + p9 < p4 + p5 + p6):
                                    var tmpChkFlg = (i < 2) ? 0 : this.__privateParams__.innerMatrix[i - 2][j];
                                    tmpChkFlg += (j < 2) ? 0 : this.__privateParams__.innerMatrix[i][j - 2];
                                    if (tmpChkFlg <= this.__privateParams__.maxValue * 0.1) {
                                        this.insertScanModFlg(i - 1, j, dispersionEdge);
                                        this.insertScanModFlg(i - 1, j - 1, dispersionCorner);
                                        this.insertScanModFlg(i, j - 1, dispersionEdge);
                                        this.insertScanModFlg(i - 1, j + 1, commonFunc._getDispersionEdge(p2));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p2));
                                        this.insertScanModFlg(i, j, commonFunc._getDispersionEdge(p8));
                                        this.insertScanModFlg(i + 1, j - 1, commonFunc._getDispersionEdge(p8));
                                    }
                                    break;
                                default:
                                    continue;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
            for (var i = 1; i < this.__privateParams__.innerMatrix.length - 1; i++) {
                for (var j = 1; j < this.__privateParams__.innerMatrix[i].length - 1; j++) {
                    if (this.__privateParams__.scanModFlg.hasOwnProperty(i + '-' + j)) this.__privateParams__.innerMatrix[i][j] -= Math.min(this.__privateParams__.innerMatrix[i][j],
                        //Math.min.apply(null, this.__privateParams__.scanModFlg[i + '-' + j]));
                        eval(this.__privateParams__.scanModFlg[i + '-' + j].join('+')) / this.__privateParams__.scanModFlg[i + '-' + j].length);
                    if (this.__privateParams__.innerMatrix[i][j] < 0) this.__privateParams__.innerMatrix[i][j] = 0;
                }
            }
            this.__privateParams__.scanModFlg = null;
            this.__privateParams__.scanModFlg = {};
        },
        getAnalysisMatrix: function() {
            this.dilationMatrix();
            this.corrosionMatrix();
            var data = JSON.parse(JSON.stringify(this.__privateParams__.innerMatrix));
            this.__privateParams__.innerMatrix = null;
            return data;
        },
        _setData: function(data, productInfo) {
            var cfg = rootScope._get('_ENV_').systemConfig[productInfo.type];
            this.__data__ = null;
            if (!this.__limit__ || !this.__productInfo__) {
                this.__limit__ = logic._getLimitLogic(productInfo);
                this.__productInfo__ = productInfo;
            }
            this.__data__ = commonFunc._formatToFloatMatrix(data);
            if (cfg && cfg.autoCalibration) this.autoCalibration(productInfo);
            else this.setDefaultCalibration(cfg);
            for (var i = 0; i < this.__privateParams__.listener.length; i++) this.__privateParams__.listener[i].func(this.__id__);
        },
        _setCalibrationData: function(calibrationData) {
            this.__calibrationData__ = null;
            this.__calibrationData__ = calibrationData;
        },
        _getDataCollection: function(analysisFlg) {
            var collection = {};
            collection.data = JSON.parse(JSON.stringify(this.__data__));
            //var filterInfo = logic._getFilterInfo(this.__productInfo__.type);
            for (var i = 0; i < collection.data.length; i++) {
                for (var j = 0; j < collection.data[i].length; j++) {
                    switch (this.__limit__.limitType) {
                        case 1:
                            if (i < this.__limit__.limit.x.min || i > this.__limit__.limit.x.max || j < this.__limit__.limit.y.min || j > this.__limit__.limit.y.max) collection.data[i][j] = this.__commonValueParam__.minValue;
                            break;
                        case 2:
                            if (this.__limit__.limit.indexOf(i + '-' + j) < 0) collection.data[i][j] = this.__commonValueParam__.minValue;
                            break;
                        case 3:
                            if (this.__limit__.limit.indexOf(i + '-' + j) >= 0) collection.data[i][j] = this.__commonValueParam__.minValue;
                            break;
                        default:
                            break;
                    }
                    /*
                    if (!filterInfo) continue;
                    switch (filterInfo.type) {
                        case 'edge':
                            if (i < filterInfo.line || i >= this.__productInfo__.size.x - filterInfo.line || j < filterInfo.line || j >= this.__productInfo__.size.y - filterInfo.line) {
                                if (collection.data[i][j] > filterInfo.maxLimit / 2) collection.data[i][j] = 0;
                            } else if (collection.data[i][j] > filterInfo.maxLimit) collection.data[i][j] = 0;
                            break;
                        default:
                            break;
                    }
                    */
                }
            }
            collection.incremental = this.getIncremental();
            collection.percentage = this.getPercentage();
            if (analysisFlg) collection.matrix = this.getAnalysisMatrix();
            else collection.matrix = collection.incremental;
            return collection;
        },
        _forceCalibration: function() {
            this.__calibrationData__ = this.__data__.clone();
        },
        _registerDataListener: function(key, func) {
            commonFunc._registerClosureListener(this.__privateParams__.listener, key, func);
        },
        _destroy: function() {
            this.__commonValueParam__ = null;
            this.__limit__ = null;
            this.__productInfo__ = null;
            this.__data__ = null;
            this.__calibrationData__ = null;
            this.__privateParams__.listener.length = 0;
            this.__privateParams__.innerMatrix = null;
            this.__privateParams__.scanModFlg = null;
            this.__privateParams__ = null;
            this.__id__ = null;
        }
    };
    return Pmatrixkeeper;
})();