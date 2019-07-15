;
var Heatmapagent = (function heatmapagentClosure() {
    'use strict';

    function Heatmapagent(productInfo) {
        this.__repaintListener__ = [];
        this.__HEATMAPCONFIG__ = {
            // only container is required, the rest can be defaults
            //backgroundColor: 'rgba(0,0,255,0.8)',
            //gradient: gradient,
            //opacity: 1,
            maxOpacity: 1,
            minOpacity: 0.1,
            blur: 1,
            //radius: commConfig.radius * (commConfig.productionSize.width === 16 ? 1.4 : 2.1),
            //container: __baseElement__
        };
        var defaultGradientRange = logic._getDefaultGradientRange();
        this.__ID__ = productInfo.com;
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        this.__USERCONFIG__ = rootScope._get('_ENV_').useConfig[this.__ID__] || rootScope._get('_ENV_').useConfig.default;
        this.__HEATMAPCONFIG__.baseRadius = Math.min(~~((window.screen.availHeight - 64) / (productInfo.size.x + 1)), ~~((window.screen.availWidth * 0.8) / (productInfo.size.y + 1)));
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__DOM__.css({
            'width': productInfo.size.y * this.__HEATMAPCONFIG__.baseRadius,
            'height': productInfo.size.x * this.__HEATMAPCONFIG__.baseRadius
        });
        this.__HEATMAPCONFIG__.container = this.__DOM__.get(0);
        this.__HEATMAPCONFIG__.radius = this.__HEATMAPCONFIG__.baseRadius * (this.__PRODUCTCONFIG__.radiusCoefficient || 1);
        if (this.__PRODUCTCONFIG__.opacity) {
            if (commonFunc._isArray(this.__PRODUCTCONFIG__.opacity)) {
                this.__PRODUCTCONFIG__.opacity.sort();
                var min = commonFunc._toFloat(this.__PRODUCTCONFIG__.opacity[0]);
                var max = commonFunc._toFloat(this.__PRODUCTCONFIG__.opacity[1]);
                if (min >= 0 && min <= 1 && max > 0 && max <= 1 && max > min) {
                    this.__HEATMAPCONFIG__.minOpacity = min;
                    this.__HEATMAPCONFIG__.maxOpacity = max;
                }
            } else {
                var opcity = commonFunc._toFloat(this.__PRODUCTCONFIG__.opacity);
                if (opcity > 0 && opcity <= 1) this.__HEATMAPCONFIG__.opacity = opcity;
            }
        }
        if (this.__PRODUCTCONFIG__.gradient) this.__HEATMAPCONFIG__.gradient = this.__PRODUCTCONFIG__.gradient;
        else this.__HEATMAPCONFIG__.gradient = {
            0.1: defaultGradientRange[0],
            0.2: defaultGradientRange[1],
            0.3: defaultGradientRange[2],
            0.4: defaultGradientRange[3],
            0.5: defaultGradientRange[4],
            0.6: defaultGradientRange[5],
            0.7: defaultGradientRange[6],
            0.8: defaultGradientRange[7],
            0.9: defaultGradientRange[8]
        };
        this.__gradientRange__ = [];
        for (var ele in this.__HEATMAPCONFIG__.gradient) this.__gradientRange__.push(this.__HEATMAPCONFIG__.gradient[ele]);
        var that = this;
        setTimeout(function() {
            that.__HEATMAPINSTANCE__ = heatmap.create(that.__HEATMAPCONFIG__);
            that.createGrid();
            that.__DOM__.append(logic._getSymbol(that.__gradientRange__));
            logic._traverseLocales(that.__DOM__, rootScope._get('_ENV_').languageMap[rootScope._get('_ENV_').useConfig['matxTmp'].lang], rootScope._get('_ENV_').useConfig['matxTmp'].lang);
        }, 0);
    };
    Heatmapagent.prototype = {
        createGrid: function() {
            var cavGrid = document.createElement('canvas');
            cavGrid.width = this.__DOM__.width();
            cavGrid.height = this.__DOM__.outerHeight();
            this.__DOM__.append(cavGrid);
            $(cavGrid).addClass('heatmap-grid');
            var content = cavGrid.getContext('2d');
            content.fillStyle = "rgba(0,0,0,1)";
            content.font = "12px Arial";
            content.strokeStyle = "rgba(46,165,255,0.5)";
            var offset = ~~((this.__DOM__.outerHeight() - this.__DOM__.height()) / 2);
            var ctxIdx = 0;
            var cursor = offset + 1;
            for (cursor; cursor < cavGrid.height - offset; cursor += this.__HEATMAPCONFIG__.baseRadius) {
                if (cursor !== offset + 1) {
                    content.moveTo(0, cursor + 1);
                    content.lineTo(cavGrid.width, cursor + 1);
                }
                if (ctxIdx > 0 && ctxIdx % 5 === 0) {
                    var mark = '';
                    if (ctxIdx < 10) mark = ' ';
                    content.fillText(mark + ctxIdx, 0, (cursor - this.__HEATMAPCONFIG__.baseRadius / 2 + 5));
                    content.moveTo(0, cursor + 1);
                    content.lineTo(cavGrid.width, cursor + 1);
                }
                ctxIdx++;
            }
            //content.fillText(ctxIdx, 0, (cursor - this.__HEATMAPCONFIG__.baseRadius / 2 + 5));
            offset = ~~((this.__DOM__.outerWidth() - this.__DOM__.width()) / 2);
            ctxIdx = 0;
            for (cursor = offset; cursor < cavGrid.width - offset; cursor += this.__HEATMAPCONFIG__.baseRadius) {
                content.moveTo(cursor, 0);
                content.lineTo(cursor, cavGrid.height);
                if (ctxIdx > 0 && ctxIdx % 5 === 0) {
                    var mark = '';
                    if (ctxIdx < 10) mark = ' ';
                    content.fillText(mark + ctxIdx, (cursor - this.__HEATMAPCONFIG__.baseRadius / 2 - 9), 14);
                    content.moveTo(cursor, 0);
                    content.lineTo(cursor, cavGrid.height);
                }
                ctxIdx++;
            }
            //content.fillText(ctxIdx, (cursor - this.__HEATMAPCONFIG__.baseRadius / 2 - 9), 14);
            content.fillText(' 1', 0, 14);
            content.stroke();
            content.save();
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _repaint: function(productConfig) {
            if (!this.__HEATMAPINSTANCE__) return;
            var target = dataLinks._getTarget(this.__ID__);
            if (!target || !target.productInfo || !target.instance) return;
            var useConfig = rootScope._get('_ENV_').useConfig[this.__ID__] || rootScope._get('_ENV_').useConfig.default;
            var maxLimit = this.__PRODUCTCONFIG__.maxLimit;
            var innerData = target.instance._getDataCollection((productConfig.features.indexOf('P002') >= 0)).matrix;
            if (!innerData) return;
            var points = [];
            //var max = 0;
            for (var i = 0; i < innerData.length; i++) {
                for (var j = 0; j < innerData[i].length; j++) {
                    var value = commonFunc._toInt(innerData[i][j]);
                    if (commonFunc._toInt(useConfig.lowerLimit) > 0 && value / maxLimit <= commonFunc._toInt(useConfig.lowerLimit) / 100) value = 0;
                    if (value <= 0) continue;
                    //max = Math.max(max, value);
                    points.push({
                        x: Math.floor(j * this.__HEATMAPCONFIG__.baseRadius + this.__HEATMAPCONFIG__.baseRadius / 2),
                        y: Math.floor(i * this.__HEATMAPCONFIG__.baseRadius + this.__HEATMAPCONFIG__.baseRadius / 2),
                        value: value
                    });
                }
            }
            //console.log('innerData[0][0]=' + innerData[0][0]);
            //console.log(max);
            // heatmap data format
            var data = {
                max: maxLimit,
                min: 0,
                data: points
            };
            // if you have a set of datapoints always use setData instead of addData
            // for data initialization
            this.__HEATMAPINSTANCE__.setData(data);
            for (var i = 0; i < this.__repaintListener__.length; i++) this.__repaintListener__[i].func(this.__ID__, this.__DOM__.children('.heatmap-canvas'));
            //heatmapAgent._heatmapRepainted();
            /*
            var runtimeInfo = runtimeCollection._get('runtimeInfo');
            if (!runtimeInfo || !runtimeInfo.radius) return;
            var constantParam = matrixKeeper._getConstantParam();
            */
        },
        _getSize: function() {
            return {
                width: this.__DOM__.width(),
                height: this.__DOM__.height(),
                radius: this.__HEATMAPCONFIG__.radius
            };
        },
        _getImageData: function() {
            try {
                var canvas = this.__DOM__.children('.heatmap-canvas').get(0);
                var ctx = canvas.getContext("2d");
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                var result = {
                    width: canvas.width,
                    height: canvas.height
                };
                var min = (1 - 1 / (this.__PRODUCTCONFIG__.radiusCoefficient || 1.2)) * 255;
                var flg = false;
                result.screenShot = document.createElement('canvas');
                result.screenShot.width = canvas.width;
                result.screenShot.height = canvas.height;
                var screenContext = result.screenShot.getContext("2d");
                var screenImg = screenContext.getImageData(0, 0, result.screenShot.width, result.screenShot.height);
                for (var i = 0; i < imgData.length; i++) {
                    if (i > 0 && i % 3 === 0 && !flg && imgData[i] > min) flg = true;
                    screenImg.data[i] = imgData[i];
                }
                if (!flg) return null;
                screenContext.putImageData(screenImg, 0, 0);
                return result;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        _append: function(target) {
            this.__DOM__.append(target);
        },
        _registerReapintListener: function(key, func) {
            commonFunc._registerClosureListener(this.__repaintListener__, key, func);
        },
        _unRegisterReapintListener: function(key) {
            commonFunc._unRegisterClosureListener(this.__repaintListener__, key);
        },
        _destroy: function() {
            this.__DOM__.empty();
            this.__HEATMAPINSTANCE__ = null;
            this.__ID__ = null;
            this.__HEATMAPCONFIG__ = null;
            this.__DOM__ = null;
        }
    };
    return Heatmapagent;
})();