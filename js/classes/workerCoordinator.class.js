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
})("workerCoordinator", this, function() {
    'use strict';
    var __processPool__ = [];
    var __edgeWorker__ = null;
    var __skeletonWorker__ = null;
    var __bodyPartCollectionWorker__ = null;
    var __gaitAnalysisWorker__ = null;
    var edgeDetectionWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        if (!dataResult.id || !dataResult.matrix) return;
        for (var i = 0; i < __processPool__.length; i++) {
            if (__processPool__[i].id === dataResult.id && __processPool__[i].type === 'edge') {
                __processPool__[i].callback(dataResult);
                break;
            }
        }
    };
    var skeletonExtractionWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        if (!dataResult.id || !dataResult.skeleton) return;
        for (var i = 0; i < __processPool__.length; i++) {
            if (__processPool__[i].id === dataResult.id && __processPool__[i].type === 'skeleton') {
                __processPool__[i].callback(dataResult);
                break;
            }
        }
    };
    var bodyPartCollectionWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        for (var i = 0; i < __processPool__.length; i++) {
            if (__processPool__[i].id === dataResult.id && __processPool__[i].type === 'bodyPartCollection') {
                __processPool__[i].callback(dataResult);
                break;
            }
        }
    };
    var gaitAnalysisWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        for (var i = 0; i < __processPool__.length; i++) {
            if (__processPool__[i].id === dataResult.id && __processPool__[i].type === 'gaitAnalysis') {
                __processPool__[i].callback(dataResult);
                break;
            }
        }
    };
    var factory = {
        _initEdge: function() {
            if (typeof(Worker) === undefined || __edgeWorker__) return;
            __edgeWorker__ = new Worker('./js/workers/edgeDetection.worker.js');
            __edgeWorker__.onmessage = edgeDetectionWorkerCallback;
        },
        _initSkeleton: function() {
            if (typeof(Worker) === undefined || __skeletonWorker__) return;
            __skeletonWorker__ = new Worker('./js/workers/skeletonExtraction.worker.js');
            __skeletonWorker__.onmessage = skeletonExtractionWorkerCallback;
        },
        _initBodyPartDataCollection: function() {
            if (typeof(Worker) === undefined || __bodyPartCollectionWorker__) return;
            __bodyPartCollectionWorker__ = new Worker('./js/workers/bodyPartCollection.worker.js');
            __bodyPartCollectionWorker__.onmessage = bodyPartCollectionWorkerCallback;
        },
        _initGaitAnalysis: function() {
            if (typeof(Worker) === undefined || __gaitAnalysisWorker__) return;
            __gaitAnalysisWorker__ = new Worker('./js/workers/gaitAnalysis.worker.js');
            __gaitAnalysisWorker__.onmessage = gaitAnalysisWorkerCallback;
        },
        _registerWorker: function(id, type, callback) {
            if (typeof callback !== 'function') return;
            var idx = 0;
            for (idx; idx < __processPool__.length; idx++)
                if (__processPool__[idx].id === id && __processPool__[idx].type === type) break;
            if (idx < __processPool__.length) return;
            __processPool__.push({
                id: id,
                type: type,
                callback: callback
            });
        },
        _unRegisterWorker: function(id, type) {
            for (idx; idx < __processPool__.length; idx++) {
                if (__processPool__[idx].id === id && __processPool__[idx].type === type) {
                    __processPool__.splice(i, 1);
                    break;
                }
            }
        },
        _postEdgeMessage: function(postData) {
            __edgeWorker__.postMessage(postData);
        },
        _postSkeletonMessage: function(postData) {
            __skeletonWorker__.postMessage(postData);
        },
        _postBodyPartCollectionMessage: function(postData) {
            __bodyPartCollectionWorker__.postMessage(postData);
        },
        _postGaitAnaylsisMessage: function(postData) {
            __gaitAnalysisWorker__.postMessage(postData);
        },
        _checkCloseWorker: function() {
            var hasEdge = false;
            var hasSkeleton = false;
            var hasBodyPartCollection = false;
            var hasGaitAnalysis = false;
            for (var i = 0; i < __processPool__.length; i++) {
                if (!hasEdge && __processPool__[i].type === 'edge') hasEdge = true;
                if (!hasSkeleton && __processPool__[i].type === 'skeleton') hasSkeleton = true;
                if (!hasBodyPartCollection && __processPool__[i].type === 'bodyPartCollection') hasBodyPartCollection = true;
                if (!hasGaitAnalysis && __processPool__[i].type === 'gaitAnalysis') hasGaitAnalysis = true;
                if (hasEdge && hasSkeleton && hasBodyPartCollection && hasGaitAnalysis) break;
            }
            if (!hasEdge) {
                __edgeWorker__.terminate();
                __edgeWorker__ = null;
            }
            if (!hasSkeleton) {
                __skeletonWorker__.terminate();
                __skeletonWorker__ = null;
            }
            if (!hasBodyPartCollection) {
                __bodyPartCollectionWorker__.terminate();
                __bodyPartCollectionWorker__ = null;
            }
            if (!hasGaitAnalysis) {
                __gaitAnalysisWorker__.terminate();
                __gaitAnalysisWorker__ = null;
            }
        }
    };
    return factory;
});