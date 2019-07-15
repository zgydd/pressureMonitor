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
})("breathWave", this, function() {
    'use strict';
    var __series__ = [];
    var __dataRange__ = {
        min: 0,
        max: 65535,
        defaultOffeset: 100
    };
    var factory = {
        _init: function() {
            return {
                grid: {
                    x: '10%',
                    y: '8%',
                    x2: '10%',
                    y2: '8%'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: false
                    }
                },
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    data: [],
                    boundaryGap: false
                },
                yAxis: {
                    axisLabel: {
                        show: false
                    },
                    type: 'value',
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    }
                },
                series: [{
                    name: '呼吸波形',
                    type: 'line',
                    lineStyle: {
                        color: '#6495ed'
                    },
                    smooth: true,
                    showSymbol: false,
                    hoverAnimation: false,
                    data: __series__
                }]
            };
        },
        _refreshData: function(data, dateLine, rBreath) {
            var max = __dataRange__.min;
            var min = __dataRange__.max;
            for (var i = 0; i < data.length; i++) {
                //__series__.push(data[i]);
                min = (data[i] > __dataRange__.defaultOffeset) ? Math.min(min, data[i] - __dataRange__.defaultOffeset) : 0;
                max = Math.max(max, data[i] + __dataRange__.defaultOffeset);
            };
            return {
                yAxis: {
                    max: max,
                    min: min
                },
                series: [{
                    data: data
                }]
            };
        }
    };
    return factory;
});