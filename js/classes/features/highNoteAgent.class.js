;
var Highnoteagent = (function highnoteagentClosure() {
    'use strict';

    function Highnoteagent(productInfo, size, features) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<canvas></canvas>').addClass('high-note');
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.__DOM__.width(size.width);
        this.__DOM__.height(size.height);
        this.__size__ = JSON.parse(JSON.stringify(size));
        this.__size__.radius = this.__size__.radius / commonFunc._toFloat(rootScope._get('_ENV_').systemConfig[productInfo.type].radiusCoefficient);
        this.__features__ = features;
        this.__DOM__.get(0).width = size.width;
        this.__DOM__.get(0).height = size.height;
        workerCoordinator._registerWorker(this.__ID__, 'highNote', this.highNoteCallback.bind(this));
        dataLinks._registerListener('runtime', 'highNote_refresh' + this.__ID__, this._refreshData.bind(this));
        this._highNoteWorker_ = new Worker('./js/workers/highNote.worker.js');
        this._highNoteWorker_.onmessage = this.highNoteCallback.bind(this);
    };
    Highnoteagent.prototype = {
        _refreshData: function(id) {
            if (id !== this.__ID__ || !this.__userConfig__.levelHighNote) return;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            var postData = {
                id: this.__ID__,
                limit: this.__userConfig__.levelHighLimit,
                innerData: dataCollection.percentage
            };
            this._highNoteWorker_.postMessage(JSON.stringify(postData));
        },
        highNoteCallback: function(event) {
            if (!this.__DOM__ || !this.__DOM__.length) return;
            var dataResult = JSON.parse(event.data);
            if (!dataResult || !dataResult.length) return;
            var cav = this.__DOM__.get(0);
            var context = cav.getContext('2d');
            context.clearRect(0, 0, cav.width, cav.height);
            context.strokeStyle = 'rgb(255,255,255)';
            context.fillStyle = 'rgb(255,255,255)';
            var nowDate = new Date();
            for (var i = 0; i < dataResult.length; i++) {
                if (!dataResult[i].length) continue;
                this.drawnOnCurrent(nowDate, context, this.__size__.radius, dataResult[i]);
            }
        },
        drawnOnCurrent: function(nowDate, context, runtimeRadius, dataResult) {
            if (!this.__userConfig__.levelHighNote || !nowDate || !context || !dataResult) return;
            var fliped = $('.heatmap .heatmap-canvas').hasClass('h-flip');
            switch (commonFunc._toInt(this.__userConfig__.levelHighNote)) {
                case 1:
                    context.font = runtimeRadius + "px Arial";
                    logic._getContextColor(nowDate.getTime(), dataResult[0].timestamp, context);
                    if (dataResult.length < 2) {
                        var contextTime = commonFunc._getShownDifferentTime(nowDate, dataResult[0].timestamp);
                        context.strokeText(contextTime, commonFunc._translatePtoArea(dataResult[0].Sy + 1, runtimeRadius, true), commonFunc._translatePtoArea((fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp) : (dataResult[0].idxTmp + 1)), runtimeRadius, true));
                    } else {
                        var minY = 0;
                        var maxY = 0;
                        var minX = 0;
                        var maxX = 0;
                        var currentTimestamp = 0;
                        for (var i = 0; i < dataResult.length; i++) {
                            minY = (minY === 0) ? dataResult[i].idxTmp : Math.min(dataResult[i].idxTmp, minY);
                            maxY = Math.max(dataResult[i].idxTmp, maxY);
                            minX = (minX === 0) ? dataResult[i].Sy : Math.min(dataResult[i].Sy, minX);
                            maxX = Math.max(dataResult[i].Ey, maxX);
                            currentTimestamp = (currentTimestamp === 0) ? dataResult[i].timestamp : Math.min(dataResult[i].timestamp, currentTimestamp);
                        }
                        var contextTime = commonFunc._getShownDifferentTime(nowDate, currentTimestamp);
                        context.strokeText(contextTime, commonFunc._translatePtoArea(minX + (maxX - minX) / 2 + 1, runtimeRadius, true), commonFunc._translatePtoArea((fliped ? logic._getOppositePoint('V', (minY + (maxY - minY) / 2)) : (minY + (maxY - minY) / 2 + 1)), runtimeRadius, true));
                    }
                    break;
                case 2:
                    if (dataResult.length < 2) {
                        logic._getContextColor(nowDate.getTime(), dataResult[0].timestamp, context);
                        context.beginPath();
                        context.moveTo(commonFunc._translatePtoArea(dataResult[0].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 2, this.__size__) : (dataResult[0].idxTmp - 1)), runtimeRadius));
                        context.lineTo(commonFunc._translatePtoArea(dataResult[0].Ey + 1, runtimeRadius), commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 2, this.__size__) : (dataResult[0].idxTmp - 1)), runtimeRadius));
                        context.lineTo(commonFunc._translatePtoArea(dataResult[0].Ey + 1, runtimeRadius), commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp, this.__size__) : dataResult[0].idxTmp + 1), runtimeRadius));
                        context.lineTo(commonFunc._translatePtoArea(dataResult[0].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp, this.__size__) : dataResult[0].idxTmp + 1), runtimeRadius));
                        context.lineTo(commonFunc._translatePtoArea(dataResult[0].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 2, this.__size__) : (dataResult[0].idxTmp - 1)), runtimeRadius));
                        context.closePath();
                        context.stroke();
                    } else {
                        var cornerLeft = {};
                        var cornerRight = {};
                        var minIdxTmp = 99999;
                        var maxIdxTmp = 0;
                        var minTimeStamp = 0;
                        dataResult.sort(function(a, b) {
                            minIdxTmp = Math.min(minIdxTmp, a.idxTmp, b.idxTmp);
                            maxIdxTmp = Math.max(maxIdxTmp, a.idxTmp, b.idxTmp);
                            minTimeStamp = (minTimeStamp === 0) ? a.timestamp : Math.min(minTimeStamp, a.timestamp, b.timestamp);
                            if (a.idxTmp !== b.idxTmp) return a.idxTmp - b.idxTmp;
                            else if (a.Sy !== b.Sy) return a.Sy - b.Sy;
                            else return a.Ey - b.Ey;
                        });
                        logic._getContextColor(nowDate.getTime(), minTimeStamp, context);
                        context.beginPath();
                        for (var i = 0; i < dataResult.length; i++) {
                            if (!cornerLeft.x || !cornerLeft.y) {
                                cornerLeft.x = dataResult[i].Sy;
                                cornerLeft.y = dataResult[i].idxTmp;
                            }
                            if (dataResult[i].idxTmp === minIdxTmp) {
                                context.moveTo(commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius), commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)), runtimeRadius));
                                context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey + 1, runtimeRadius), commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)), runtimeRadius));
                            }
                            if (dataResult[i].idxTmp === maxIdxTmp) {
                                context.moveTo(commonFunc._translatePtoArea(dataResult[i].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp) : dataResult[i].idxTmp + 1), runtimeRadius));
                                context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey, runtimeRadius), commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp) : dataResult[i].idxTmp + 1), runtimeRadius));
                            }
                            if ((dataResult[i].idxTmp === minIdxTmp || dataResult[i].idxTmp === maxIdxTmp) && i > 0 && dataResult[i].idxTmp === dataResult[i - 1].idxTmp) {
                                var dashLine = commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius) - commonFunc._translatePtoArea(dataResult[i - 1].Ey + 1, runtimeRadius);
                                var realIdxTmp = (dataResult[i].idxTmp === minIdxTmp) ? minIdxTmp : maxIdxTmp + 1;
                                realIdxTmp = fliped ? logic._getOppositePoint('V', realIdxTmp - 1) : realIdxTmp;
                                for (var xIdx = 0; xIdx < dashLine; xIdx += 6) {
                                    context.moveTo(commonFunc._translatePtoArea(dataResult[i - 1].Ey + 1, runtimeRadius) + xIdx, commonFunc._translatePtoArea(realIdxTmp, runtimeRadius));
                                    context.lineTo(commonFunc._translatePtoArea(dataResult[i - 1].Ey + 1, runtimeRadius) + xIdx + 3, commonFunc._translatePtoArea(realIdxTmp, runtimeRadius));
                                }
                            }
                            //The right one
                            if (i === dataResult.length - 1 || dataResult[i + 1].idxTmp !== dataResult[i].idxTmp) {
                                if (cornerRight.x !== undefined && cornerRight.y !== undefined) {
                                    if (i === dataResult.length - 1) {
                                        context.moveTo(commonFunc._translatePtoArea(cornerRight.x, runtimeRadius), commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', cornerRight.y - 2) : (cornerRight.y - 1)), runtimeRadius));
                                        context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey, runtimeRadius), commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp) : dataResult[i].idxTmp + 1), runtimeRadius));
                                    } else {
                                        context.moveTo(commonFunc._translatePtoArea(cornerRight.x, runtimeRadius), commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', cornerRight.y - 2) : (cornerRight.y - 1)), runtimeRadius));
                                        context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey + 1, runtimeRadius), commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)), runtimeRadius));
                                    }
                                }
                                cornerRight.x = dataResult[i].Ey + 1;
                                cornerRight.y = dataResult[i].idxTmp;
                            }
                            //The left one
                            if (i > 0 && dataResult[i - 1].idxTmp !== dataResult[i].idxTmp) {
                                if (cornerLeft.x !== undefined && cornerLeft.y !== undefined) {
                                    context.moveTo(commonFunc._translatePtoArea(cornerLeft.x, runtimeRadius), commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', cornerLeft.y - 2) : (cornerLeft.y - 1)), runtimeRadius));
                                    context.lineTo(commonFunc._translatePtoArea(dataResult[i].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)), runtimeRadius));
                                }
                                if (dataResult[i].idxTmp === maxIdxTmp) {
                                    context.moveTo(commonFunc._translatePtoArea(dataResult[i].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)), runtimeRadius));
                                    context.lineTo(commonFunc._translatePtoArea(dataResult[i].Sy - 1, runtimeRadius), commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp) : dataResult[i].idxTmp + 1), runtimeRadius));
                                }
                                cornerLeft.x = dataResult[i].Sy - 1;
                                cornerLeft.y = dataResult[i].idxTmp;
                            }
                        }
                        context.closePath();
                        context.stroke();
                    }
                    break;
                default:
                    break;
            }
        },
        _clear: function() {
            var cav = this.__DOM__.get(0);
            var context = cav.getContext('2d');
            context.clearRect(0, 0, cav.width, cav.height);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this._highNoteWorker_.terminate();
            this._highNoteWorker_ = null;
            workerCoordinator._unRegisterWorker(this.__ID__, 'highNote');
            dataLinks._unRegisterListener('runtime', 'highNote_refresh' + this.__ID__);
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
            this.__size__ = null;
            this.__userConfig__ = null;
        }
    };
    return Highnoteagent;
})();