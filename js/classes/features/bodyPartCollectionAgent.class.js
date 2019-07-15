;
var Bodypartcollectionagent = (function bodypartcollectionagentClosure() {
    'use strict';

    function Bodypartcollectionagent(productInfo, size, features) {
        this.__ID__ = productInfo.com;
        this.bodyPartCollectionCallbackListener = [];
        this.__DOM__ = $('<div></div>').addClass('viewer');
        var cfg = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__noiseFilter__ = 0;
        if (cfg && cfg.autoCalibration && cfg.noiseFilter) this.__noiseFilter__ = commonFunc._toInt(cfg.noiseFilter);
        this.__size__ = (cfg.size ? cfg.size : {
            x: 32,
            y: 64
        });
        this.__physicalSize__ = (cfg.physicalSize ? cfg.physicalSize : {
            x: 77,
            y: 172.2
        });
        this.__viewWeightFormula__ = (cfg.viewWeightFormula ? cfg.viewWeightFormula : '{0} / 9.80665');
        this.__cavBodySplit__ = document.createElement('canvas');
        $(this.__cavBodySplit__).addClass('body-spliter');
        this.__cavBodySplit__.width = size.width;
        this.__cavBodySplit__.height = size.height;
        this.__cavSpine__ = document.createElement('canvas');
        $(this.__cavSpine__).addClass('body-spine');
        this.__cavSpine__.width = 400;
        this.__cavSpine__.height = 50;
        this._CAVCFG = {
            widthRadius: size.width / this.__size__.y,
            heightRadius: size.height / this.__size__.x
        };
        this.__bodypartProportion__ = ((cfg && cfg.bodypartProportion) ? cfg.bodypartProportion : {
            head: '1/8',
            shoulder: '1.5/8',
            loins: '1/8',
            gluteus: '1.2/8',
            leg: '3.3/8'
        });
        //this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.__features__ = features;
        this.__shownInfo__ = {
            head: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            shoulder: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            loins: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            gluteus: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            leg: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            scale: $('<label>0</label>'),
            height: $('<label>--</label>'),
            weight: $('<label>--</label>')
        };
        var arrTitle = ['', 'max', 'avg', 'area', 'percent', 'areaVariance'];
        var arrShown = ['head', 'shoulder', 'loins', 'gluteus', 'leg'];
        var lstShown = $('<ul></ul>').addClass('bpc-shower');
        var lstTitle = $('<ul></ul>');
        for (var i = 0; i < arrTitle.length; i++) {
            lstTitle.append($('<li></li>').append('<label z-lang="BPC-T-' + arrTitle[i] + '">' + arrTitle[i] + '</label>'));
        }
        lstShown.append($('<li></li>').append(lstTitle));
        for (var i = 0; i < arrShown.length; i++) {
            var lstRow = $('<ul></ul>');
            lstRow.append($('<li></li>').append('<label z-lang="BPC-' + arrShown[i] + '">' + arrShown[i] + '</label>'));
            for (var j = 1; j < arrTitle.length; j++) {
                lstRow.append($('<li></li>').append(this.__shownInfo__[arrShown[i]][arrTitle[j]]));
            }
            lstShown.append($('<li></li>').append(lstRow));
        }
        lstShown.append($('<li></li>').append($('<ul></ul>').append($('<li z-lang="BPC-scale">SCALE</li>')).append($('<li></li>').append(this.__shownInfo__.scale))));
        lstShown.append($('<li></li>').append($('<ul></ul>').append($('<li z-lang="C043">Height</li>')).append($('<li></li>').append(this.__shownInfo__.height)).append($('<li z-lang="C044" style="font-weight: bolder;">Weight</li>')).append($('<li></li>').append(this.__shownInfo__.weight))));
        this.__DOM__.append(lstShown);
        workerCoordinator._registerWorker(this.__ID__, 'bodyPartCollection', this.bodyPartCollectionCallback.bind(this));
        dataLinks._registerListener('runtime', 'bodyPartCollection_refresh' + this.__ID__, this._refreshData.bind(this));
    };
    Bodypartcollectionagent.prototype = {
        bodyPartCollectionCallback: function(data) {
            for (var ele in this.__shownInfo__) {
                if (!data.hasOwnProperty(ele)) continue;
                if (typeof data[ele] !== 'object') {
                    if (this.__shownInfo__.hasOwnProperty(ele)) this.__shownInfo__[ele].html(data[ele].toFixed(2));
                    continue;
                }
                for (var e in this.__shownInfo__[ele]) {
                    if (!data[ele].hasOwnProperty(e)) continue;
                    this.__shownInfo__[ele][e].html(commonFunc._toFloat(data[ele][e]).toFixed(2));
                }
            }
            if (data.hasOwnProperty('pValue')) this.__shownInfo__.weight.html(commonFunc._toFloat(eval(this.__viewWeightFormula__.format(data.pValue))).toFixed(2));
            var context = this.__cavBodySplit__.getContext('2d');
            context.clearRect(0, 0, this.__cavBodySplit__.width, this.__cavBodySplit__.height);
            if (data.direction !== 0 && data.rangeInfo) {
                context.strokeStyle = 'rgb(255,0,0)';
                context.fillStyle = 'rgb(255,0,0)';
                context.beginPath();
                context.moveTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                context.lineTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.iRange.max * this._CAVCFG.heightRadius);
                context.lineTo(data.rangeInfo.jRange.max * this._CAVCFG.widthRadius, data.rangeInfo.iRange.max * this._CAVCFG.heightRadius);
                context.lineTo(data.rangeInfo.jRange.max * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                context.lineTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                context.stroke();
                context.closePath();
                context.save();
                context.beginPath();
                if (data.direction > 0) {
                    for (var i = 0; i < data.rangeInfo.bodyCheckRange.length - 1; i++) {
                        context.moveTo(data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                        context.lineTo(data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius, data.rangeInfo.iRange.max * this._CAVCFG.heightRadius);
                    }
                } else {
                    for (var i = 0; i < data.rangeInfo.bodyCheckRange.length - 1; i++) {
                        context.moveTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.heightRadius);
                        context.lineTo(data.rangeInfo.jRange.max * this._CAVCFG.widthRadius, data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.heightRadius);
                    }
                }
                context.stroke();
                context.closePath();
                context.save();
            }
            //console.log(data.spineLine);
            if (data.spineLine && data.spineLine.length) {
                var spineRange = [99999, 0];
                for (var i = 0; i < data.spineLine.length; i++) {
                    spineRange[0] = Math.min(spineRange[0], data.spineLine[i]);
                    spineRange[1] = Math.max(spineRange[1], data.spineLine[i]);
                }
                context = this.__cavSpine__.getContext('2d');
                context.clearRect(0, 0, this.__cavSpine__.width, this.__cavSpine__.height);
                var stepWidth = this.__cavSpine__.width * 0.8 / data.spineLine.length;
                var stepHeight = this.__cavSpine__.height * 0.6 / (spineRange[1] - spineRange[0]);
                var rangeLeft = this.__cavSpine__.width * 0.1;
                var rangeTop = this.__cavSpine__.height * 0.2;
                /*
                for (var i = 0; i < data.spineLine.length - 1; i++) {
                    var start = [rangeLeft + i * stepWidth, rangeTop + (data.spineLine[i] - spineRange[0]) * stepHeight];
                    var end = [rangeLeft + (i + 1) * stepWidth, rangeTop + (data.spineLine[i + 1] - spineRange[0]) * stepHeight];
                    var cp = [
                        (start[0] + end[0]) / 2 + (start[1] - end[1]) * 0.3, (start[1] + end[1]) / 2 + (end[0] - start[0]) * 0.3
                    ];
                    context.beginPath();
                    context.moveTo(start[0], start[1]);
                    context.quadraticCurveTo(cp[0], cp[1], end[0], end[1]);
                    context.stroke();
                    context.closePath();
                }
                */
                for (var i = 0; i < data.spineLine.length - 2; i += 2) {
                    var start = [rangeLeft + i * stepWidth, rangeTop + (data.spineLine[i] - spineRange[0]) * stepHeight];
                    var end = [rangeLeft + (i + 2) * stepWidth, rangeTop + (data.spineLine[i + 2] - spineRange[0]) * stepHeight];
                    var cp = [rangeLeft + (i + 1) * stepWidth, rangeTop + (data.spineLine[i + 1] - spineRange[0]) * stepHeight];
                    context.beginPath();
                    context.moveTo(start[0], start[1]);
                    context.quadraticCurveTo(cp[0], cp[1], end[0], end[1]);
                    context.stroke();
                    context.closePath();
                }
            }
            for (var i = 0; i < this.bodyPartCollectionCallbackListener.length; i++) this.bodyPartCollectionCallbackListener[i].func((this.tmpMatrix ? this.tmpMatrix.clone() : []), data);
            this.__inCollectionRange__ = false;
            this.tmpMatrix = null;
        },
        _refreshData: function(id) {
            if (id !== this.__ID__) return;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            if (!this.__inCollectionRange__) {
                this.tmpMatrix = dataCollection.matrix.clone();
                this.__inCollectionRange__ = true;
                workerCoordinator._postBodyPartCollectionMessage(JSON.stringify({
                    id: this.__ID__,
                    size: this.__size__,
                    physicalSize: this.__physicalSize__,
                    data: this.tmpMatrix,
                    noiseFilter: this.__noiseFilter__,
                    bodypartProportion: this.__bodypartProportion__
                }));
            }
        },
        _registerListener: function(key, func) {
            commonFunc._registerClosureListener(this.bodyPartCollectionCallbackListener, key, func);
        },
        _unRegisterListener: function(key) {
            commonFunc._unRegisterClosureListener(this.bodyPartCollectionCallbackListener, key);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _getCanvas: function() {
            return this.__cavBodySplit__;
        },
        _getSpine: function() {
            return this.__cavSpine__;
        },
        _getSpineView: function() {
            return this.__spineSplitView__.dom;
        },
        _destroy: function() {
            dataLinks._unRegisterListener('runtime', 'bodyPartCollection_refresh' + this.__ID__);
            workerCoordinator._unRegisterWorker(this.__ID__, 'bodyPartCollection');
            this.__shownInfo__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__cavBodySplit__ = null;
            this.__cavSpine__ = null;
            this._CAVCFG = null;
            this.__bodypartProportion__ = null;
            this.__features__ = null;
            this.__size__ = null;
            this.__physicalSize__ = null;
            this.__viewWeightFormula__ = null;
            this.__ID__ = null;
            this.tmpMatrix = null;
            this.bodyPartCollectionCallbackListener.length = 0;
            this.bodyPartCollectionCallbackListener = null;
        }
    };
    return Bodypartcollectionagent;
})();