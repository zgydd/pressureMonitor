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
})("edgeAgent", this, function() {
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
    var edgeDetectionWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        if (!dataResult.matrix || !__self__.length) return;
        var cav = __self__.get(0);
        var context = cav.getContext('2d');
        context.clearRect(0, 0, cav.width, cav.height);
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (var i = 0; i < dataResult.matrix.length; i++) {
            for (var j = 0; j < dataResult.matrix[i].length; j++) {
                if (dataResult.matrix[i][j] > dataResult.maxValue * (68 / 100))
                    context.fillRect(i, j, 1, 1);
            }
        }
        runtimeCollection._get('runtimeInfo').inEdgeDetectionRange = false;
    };
    var postMapResource = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        if (runtimeInfo.inEdgeDetectionRange) return;
        var canvas = $('.heatmap canvas');
        if (canvas.length <= 0) return;
        runtimeInfo.inEdgeDetectionRange = true;
        canvas = canvas.get(0);
        var ctx = canvas.getContext("2d");
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        var postData = {};
        postData.imgData = commonFunc._getBinaryImage(imgData, canvas.width);
        postData.filterTimes = 0;
        __privateParams__.worker.postMessage(JSON.stringify(postData));
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();
            if (!__self__ || !__self__.length) __self__ = $('<canvas id="edgeCav"></canvas>');

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
                __privateParams__.worker = new Worker('./js/workers/edgeDetection.worker.js');
                __privateParams__.worker.onmessage = edgeDetectionWorkerCallback;
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
        },
        _clearCanvas: function() {
            var cav = __self__.get(0);
            var context = cav.getContext('2d');
            context.clearRect(0, 0, cav.width, cav.height);
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