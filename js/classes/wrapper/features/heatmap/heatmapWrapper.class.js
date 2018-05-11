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
})("heatmapWrapper", this, function() {
    'use strict';
    var __baseElement__ = null;
    var __heatmapInstance__ = null;
    var __defaultConfig__ = {
        // only container is required, the rest can be defaults
        //backgroundColor: 'rgba(0,0,255,0.8)',
        //gradient: gradient,
        maxOpacity: 1,
        minOpacity: 0,
        blur: 0.95,
        //radius: commConfig.radius * (commConfig.productionSize.width === 16 ? 1.4 : 2.1),
        //container: __baseElement__
    };

    var __defaultGradientRange__ = ["rgb(176,225,255)",
        "rgb(1,139,250)",
        "rgb(5,252,241)",
        "rgb(48,254,5)",
        "rgb(202,255,0)",
        "rgb(252,255,13)",
        "rgb(252,146,2)",
        "rgb(249,97,0)",
        "rgb(255,0,13)"
    ];

    var __activedGradientRange__ = null;
    /*
        var getBinaryImage = function(imgData, width) {
            var inner = [];
            var row = [];
            for (var i = 0; i < imgData.length; i += 4) {
                if (imgData[i] === null) continue;
                if (imgData[i + 3] > 20) row.push(1);
                else row.push(0);
                if (row.length === width) {
                    inner.push(row.slice(0));
                    row.length = 0;
                }
            }
            return inner;
        };
    */
    var heatmapWrapperFactory = {
        _init: function(parentEle, runtimeRadius) {
            if (!parentEle) return;
            __heatmapInstance__ = null;
            __baseElement__ = parentEle;
            var productType = logic._getProductType();
            if (!productType || !__baseElement__) return;
            var radius = runtimeRadius ? runtimeRadius : 20;

            if (runtimeRadius)
                radius = runtimeRadius * runtimeCollection._get('activedInfo').config.radiusCoefficient;

            var productCfg = {
                gradient: null,
                radius: radius,
                container: __baseElement__
            };

            switch (productType) {
                case 'A1':
                    __activedGradientRange__ = productCfg.gradient = {
                        0.005: __defaultGradientRange__[0],
                        0.18: __defaultGradientRange__[1],
                        0.27: __defaultGradientRange__[2],
                        0.36: __defaultGradientRange__[3],
                        0.45: __defaultGradientRange__[4],
                        0.54: __defaultGradientRange__[5],
                        0.63: __defaultGradientRange__[6],
                        0.72: __defaultGradientRange__[7],
                        0.91: __defaultGradientRange__[8]
                    };
                    break;
                case 'A2':
                case 'A3':
                case 'A4':
                    __activedGradientRange__ = productCfg.gradient = {
                        0.1: __defaultGradientRange__[0],
                        0.32: __defaultGradientRange__[1],
                        0.59: __defaultGradientRange__[2],
                        0.67: __defaultGradientRange__[3],
                        0.72: __defaultGradientRange__[4],
                        0.85: __defaultGradientRange__[5],
                        0.93: __defaultGradientRange__[6],
                        0.97: __defaultGradientRange__[7],
                        0.995: __defaultGradientRange__[8]
                    };
                    break;
                default:
                    __activedGradientRange__ = productCfg.gradient = {
                        0.1: __defaultGradientRange__[0],
                        0.2: __defaultGradientRange__[1],
                        0.3: __defaultGradientRange__[2],
                        0.4: __defaultGradientRange__[3],
                        0.5: __defaultGradientRange__[4],
                        0.6: __defaultGradientRange__[5],
                        0.7: __defaultGradientRange__[6],
                        0.8: __defaultGradientRange__[7],
                        0.9: __defaultGradientRange__[8]
                    };
                    break;
            }

            __heatmapInstance__ = heatmap.create(commonFunc._mergeObject(__defaultConfig__, productCfg));
        },
        _getGradientRange: function() {
            return JSON.parse(JSON.stringify(__defaultGradientRange__));
        },
        _getActivedGradientRange: function() {
            if (__activedGradientRange__) return __activedGradientRange__;
            return {
                0.1: __defaultGradientRange__[0],
                0.2: __defaultGradientRange__[1],
                0.3: __defaultGradientRange__[2],
                0.4: __defaultGradientRange__[3],
                0.5: __defaultGradientRange__[4],
                0.6: __defaultGradientRange__[5],
                0.7: __defaultGradientRange__[6],
                0.8: __defaultGradientRange__[7],
                0.9: __defaultGradientRange__[8]
            };
        },
        _setHeatmap: function() {
            if (!__heatmapInstance__) return;
            var innerData = matrixKeeper._getIncremental();
            if (!innerData) return;
            var runtimeInfo = runtimeCollection._get('runtimeInfo');
            if (!runtimeInfo || !runtimeInfo.radius) return;
            var constantParam = matrixKeeper._getConstantParam();
            var points = [];
            //var max = 0;
            //var min = 4096;
            for (var i = 0; i < innerData.length; i++) {
                for (var j = 0; j < innerData[i].length; j++) {
                    if (innerData[i][j] === constantParam.minValue) continue;
                    //var numData = innerData[i][j];
                    //if (numData <= 2) continue;
                    points.push({
                        x: j * runtimeInfo.radius + runtimeInfo.radius,
                        y: i * runtimeInfo.radius + runtimeInfo.radius,
                        value: innerData[i][j]
                    });
                }
            }

            // heatmap data format
            var data = {
                max: constantParam.maxValue,
                min: constantParam.minValue,
                data: points
            };
            // if you have a set of datapoints always use setData instead of addData
            // for data initialization
            __heatmapInstance__.setData(data);
            heatmapAgent._heatmapRepainted();
            /*
            threeWrapper._render(innerData, calibrationData, radius);
            if (sharingDataSet._get('inGaitFlg')) behavior._recordGait(points.length);
            if (sharingDataSet._get('keepRecord')) behavior._recordKeepRecord();
            if (!sharingDataSet._get('inGaitFlg') && $('.heatmap canvas').length) {
                var canvas = $('.heatmap canvas').get(0);
                var ctx = canvas.getContext("2d");
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                if (!runtimeCollection._get('inEdgeDetectionRange')) {
                    runtimeCollection._set('inEdgeDetectionRange', true);
                    var postData = {};
                    postData.imgData = getBinaryImage(imgData, canvas.width);
                    postData.filterTimes = 0;
                    scaleAnalysisWrapper._postEdgeDetectionData(JSON.stringify(postData));
                }
                if (!runtimeCollection._get('inSkeletonDetectionRange')) {
                    runtimeCollection._set('inSkeletonDetectionRange', true);
                    var postData = {};
                    postData.binaryImg = getBinaryImage(imgData, canvas.width);
                    postData.skeletonLimit = 0;
                    scaleAnalysisWrapper._postSkeletonExtractionData(JSON.stringify(postData));
                }
            }
            if (sharingDataSet._get('levelHighNote'))
                scaleAnalysisWrapper._postlevelHightNote(innerData, calibrationData);
            */
        }
    };

    return heatmapWrapperFactory;
});