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
})("levelNoteAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __privateParams__ = { worker: null };

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        __self__.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };
    var getContextColor = function(newTimestamp, oldTimestamp, context) {
        var keepTime = newTimestamp - oldTimestamp;
        switch (true) {
            case (keepTime >= 7200000):
                context.strokeStyle = 'rgb(178,34,34)';
                break;
            case (keepTime >= 5400000):
                context.strokeStyle = 'rgb(255,255,0)';
                break;
            case (keepTime >= 3600000):
                context.strokeStyle = 'rgb(0,128,0)';
                break;
            case (keepTime > 0):
                context.strokeStyle = 'rgb(255,255,255)';
                break;
            default:
                context.strokeStyle = 'rgb(0,0,0)';
                break;
        }
    };
    var drawnOnCurrent = function(highLevel, nowDate, context, runtimeRadius, dataResult) {
        if (!highLevel || !nowDate || !context || !dataResult) return;
        var fliped = $('.heatmap .heatmap-canvas').hasClass('h-flip');
        switch (highLevel) {
            case 1:
                context.font = runtimeRadius + "px Arial";
                if (dataResult.length < 2) {
                    var contextTime = commonFunc._getShownDifferentTime(nowDate, dataResult[0].timestamp);
                    context.strokeText(contextTime,
                        commonFunc._translatePtoArea(dataResult[0].Sy + 1, runtimeRadius, true),
                        commonFunc._translatePtoArea((fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp) : (dataResult[0].idxTmp + 1)),
                            runtimeRadius, true));
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
                        currentTimestamp = (currentTimestamp === 0) ?
                            dataResult[i].timestamp : Math.min(dataResult[i].timestamp, currentTimestamp);
                    }
                    var contextTime = commonFunc._getShownDifferentTime(nowDate, currentTimestamp);
                    context.strokeText(contextTime,
                        commonFunc._translatePtoArea(minX + (maxX - minX) / 2 + 1, runtimeRadius, true),
                        commonFunc._translatePtoArea((fliped ? logic._getOppositePoint('V', (minY + (maxY - minY) / 2)) : (minY + (maxY - minY) / 2 + 1)),
                            runtimeRadius, true));
                }
                break;
            case 2:
                if (dataResult.length < 2) {
                    getContextColor(nowDate.getTime(), dataResult[0].timestamp, context);
                    context.beginPath();
                    context.moveTo(commonFunc._translatePtoArea(dataResult[0].Sy, runtimeRadius),
                        commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 2) : (dataResult[0].idxTmp - 1)),
                            runtimeRadius));
                    context.lineTo(commonFunc._translatePtoArea(dataResult[0].Ey + 1, runtimeRadius),
                        commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 2) : (dataResult[0].idxTmp - 1)),
                            runtimeRadius));
                    context.lineTo(commonFunc._translatePtoArea(dataResult[0].Ey + 1, runtimeRadius),
                        commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 1) : dataResult[0].idxTmp),
                            runtimeRadius));
                    context.lineTo(commonFunc._translatePtoArea(dataResult[0].Sy, runtimeRadius),
                        commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 1) : dataResult[0].idxTmp),
                            runtimeRadius));
                    context.lineTo(commonFunc._translatePtoArea(dataResult[0].Sy, runtimeRadius),
                        commonFunc._translatePtoArea(
                            (fliped ? logic._getOppositePoint('V', dataResult[0].idxTmp - 2) : (dataResult[0].idxTmp - 1)),
                            runtimeRadius));
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
                    getContextColor(nowDate.getTime(), minTimeStamp, context);
                    context.beginPath();
                    for (var i = 0; i < dataResult.length; i++) {
                        if (!cornerLeft.x || !cornerLeft.y) {
                            cornerLeft.x = dataResult[i].Sy;
                            cornerLeft.y = dataResult[i].idxTmp;
                        }
                        if (dataResult[i].idxTmp === minIdxTmp) {
                            context.moveTo(commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius),
                                commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)),
                                    runtimeRadius));
                            context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey + 1, runtimeRadius),
                                commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)),
                                    runtimeRadius));
                        }
                        if (dataResult[i].idxTmp === maxIdxTmp) {
                            context.moveTo(commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius),
                                commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 1) : dataResult[i].idxTmp),
                                    runtimeRadius));
                            context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey + 1, runtimeRadius),
                                commonFunc._translatePtoArea(
                                    (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 1) : dataResult[i].idxTmp),
                                    runtimeRadius));
                        }
                        if ((dataResult[i].idxTmp === minIdxTmp || dataResult[i].idxTmp === maxIdxTmp) &&
                            i > 0 && dataResult[i].idxTmp === dataResult[i - 1].idxTmp) {
                            var dashLine = commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius) -
                                commonFunc._translatePtoArea(dataResult[i - 1].Ey + 1, runtimeRadius);
                            var realIdxTmp = (dataResult[i].idxTmp === minIdxTmp) ? minIdxTmp : maxIdxTmp + 1;
                            realIdxTmp = fliped ? logic._getOppositePoint('V', realIdxTmp - 1) : realIdxTmp;
                            for (var xIdx = 0; xIdx < dashLine; xIdx += 6) {
                                context.moveTo(commonFunc._translatePtoArea(dataResult[i - 1].Ey + 1, runtimeRadius) + xIdx,
                                    commonFunc._translatePtoArea(realIdxTmp, runtimeRadius));
                                context.lineTo(commonFunc._translatePtoArea(dataResult[i - 1].Ey + 1, runtimeRadius) + xIdx + 3,
                                    commonFunc._translatePtoArea(realIdxTmp, runtimeRadius));
                            }
                        }
                        //The right one
                        if (i === dataResult.length - 1 || dataResult[i + 1].idxTmp !== dataResult[i].idxTmp) {
                            if (cornerRight.x !== undefined && cornerRight.y !== undefined) {
                                if (i === dataResult.length - 1) {
                                    context.moveTo(commonFunc._translatePtoArea(cornerRight.x, runtimeRadius),
                                        commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', cornerRight.y - 2) : (cornerRight.y - 1)),
                                            runtimeRadius));
                                    context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey + 1, runtimeRadius),
                                        commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 1) : dataResult[i].idxTmp),
                                            runtimeRadius));
                                } else {
                                    context.moveTo(commonFunc._translatePtoArea(cornerRight.x, runtimeRadius),
                                        commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', cornerRight.y - 2) : (cornerRight.y - 1)),
                                            runtimeRadius));
                                    context.lineTo(commonFunc._translatePtoArea(dataResult[i].Ey + 1, runtimeRadius),
                                        commonFunc._translatePtoArea(
                                            (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)),
                                            runtimeRadius));
                                }
                            }
                            cornerRight.x = dataResult[i].Ey + 1;
                            cornerRight.y = dataResult[i].idxTmp;
                        }
                        //The left one
                        if (i > 0 && dataResult[i - 1].idxTmp !== dataResult[i].idxTmp) {
                            if (cornerLeft.x !== undefined && cornerLeft.y !== undefined) {
                                context.moveTo(commonFunc._translatePtoArea(cornerLeft.x, runtimeRadius),
                                    commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', cornerLeft.y - 2) : (cornerLeft.y - 1)),
                                        runtimeRadius));
                                context.lineTo(commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius),
                                    commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)),
                                        runtimeRadius));
                            }
                            if (dataResult[i].idxTmp === maxIdxTmp) {
                                context.moveTo(commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius),
                                    commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 2) : (dataResult[i].idxTmp - 1)),
                                        runtimeRadius));
                                context.lineTo(commonFunc._translatePtoArea(dataResult[i].Sy, runtimeRadius),
                                    commonFunc._translatePtoArea(
                                        (fliped ? logic._getOppositePoint('V', dataResult[i].idxTmp - 1) : dataResult[i].idxTmp),
                                        runtimeRadius));
                            }
                            cornerLeft.x = dataResult[i].Sy;
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
    };
    var levelNoteWorkerCallback = function(event) {
        if (!__self__ || !__self__.length) return;
        var dataResult = JSON.parse(event.data);
        if (!dataResult || !dataResult.length) return;
        var cav = __self__.get(0);
        var context = cav.getContext('2d');
        context.clearRect(0, 0, cav.width, cav.height);
        context.strokeStyle = 'rgb(255,255,255)';
        context.fillStyle = 'rgb(255,255,255)';
        var nowDate = new Date();
        var highLevel = sharingDataSet._get('levelHighNote');
        for (var i = 0; i < dataResult.length; i++) {
            if (!dataResult[i].length) continue;
            drawnOnCurrent(highLevel, nowDate, context,
                runtimeCollection._get('runtimeInfo').radius, dataResult[i]);
        }
    };
    var postMapResource = function() {
        var activedInfo = runtimeCollection._get('activedInfo');
        if (!activedInfo || activedInfo.activedContainer !== 'left-menu-heatmap')
            return;
        __privateParams__.worker.postMessage(JSON.stringify(matrixKeeper._getPercentage()));
    };
    var clearCanvas = function() {
        var cav = __self__.get(0);
        var context = cav.getContext('2d');
        context.clearRect(0, 0, cav.width, cav.height);
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<canvas id="levelHighNoteCav"></canvas>');

            if (typeof heatmapAgent === 'undefined' || typeof heatmapAgent._getCanvasSize !== 'function')
                return false;

            var size = heatmapAgent._getCanvasSize();
            __self__.width(size.width);
            __self__.height(size.height);
            __self__.css({
                'left': $('.heatmap > canvas').offset().left,
                'top': $('.heatmap > canvas').offset().top
            });
            __self__.get(0).width = size.width;
            __self__.get(0).height = size.height;

            if (typeof(Worker) !== undefined) {
                __privateParams__.worker = new Worker('./js/workers/levelHighNote.worker.js');
                __privateParams__.worker.onmessage = levelNoteWorkerCallback;
            }
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _subscribeListener: function() {
            heatmapAgent._registerListener('Repaint', postMapResource);
            var activedInfo = runtimeCollection._get('activedInfo');
            if (activedInfo.config.features.indexOf('M002') >= 0)
                scaleAgent._registerListener('leave', clearCanvas);
        },
        _getImageData: function() {
            if (!__self__ || !__self__.length) return null;
            var canvas = __self__.get(0);
            var ctx = canvas.getContext("2d");
            return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        },
        _getWidth: function() {
            if (!__self__ || !__self__.length) return null;
            var cav = __self__.get(0);
            return cav.width;
        }
    };

    return factory;
});