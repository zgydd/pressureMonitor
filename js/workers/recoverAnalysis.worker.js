'use strict';
var preInnerData = null;
var preEdgeData = null;
var preSkeletonData = null;

onmessage = function(event) {
    var sourceData = JSON.parse(event.data);

    var innerData = sourceData.innerData;
    var calibrationData = sourceData.calibrationData;
    var presureRanges = sourceData.presureRanges;
    var newScale = sourceData.baseScale + presureRanges;
    var threshold = sourceData.threshold;

    var leaveJudge = sourceData.leaveJudge ? sourceData.leaveJudge : 10;
    var turnJudge = sourceData.turnJudge ? sourceData.turnJudge : 50;
    var edgeData = sourceData.edgeList ? sourceData.edgeList : null;
    var skeletonData = sourceData.skeletonList ? sourceData.skeletonList : null;

    var isInit = false;
    if (preInnerData === null) {
        preInnerData = innerData;
        isInit = true;
    }
    if (preEdgeData === null) {
        preEdgeData = edgeData;
        isInit = true;
    }
    if (preSkeletonData === null) {
        preSkeletonData = skeletonData;
        isInit = true;
    }
    if (isInit) {
        postMessage(JSON.stringify({}));
        return;
    }

    //##########Algorithms about times and presure################
    var maxPrecent = 0;
    //var cntChangedPoint = 0;
    for (var i = 0; i < innerData.length; i++) {
        for (var j = 0; j < innerData[i].length; j++) {
            if (innerData[i][j] === 0 || innerData[i][j] <= calibrationData[i][j]) continue;
            var mePrecent = (innerData[i][j] - calibrationData[i][j]) / (4096 - calibrationData[i][j]);
            maxPrecent = Math.max(maxPrecent, mePrecent);
        }
    }
    if (maxPrecent <= 0) {
        preInnerData = innerData;
        var analysisResult = {
            leave: true
        };
        postMessage(JSON.stringify(analysisResult));
        return;
    }

    var forceback = false;
    var idxPresureRange = 0;
    for (idxPresureRange = 1; idxPresureRange <= presureRanges; idxPresureRange++) {
        if (maxPrecent <= ((4096 / (presureRanges + 1) * idxPresureRange) / 4096)) {
            newScale -= idxPresureRange;
            break;
        }
    }
    if (idxPresureRange > presureRanges) newScale -= presureRanges;
    newScale++;
    var newCountDownRange = 0;
    for (var i = 0; i < threshold.length; i++) {
        if (threshold[i].min <= newScale && threshold[i].max >= newScale) {
            newCountDownRange = threshold[i].rangeTime;
            break;
        }
    }

    var analysisResult = {
        data: newCountDownRange
    };
    if (!edgeData || !edgeData.length) analysisResult.leave = true;

    if (!analysisResult.leave && preSkeletonData && preSkeletonData.length && skeletonData && skeletonData.length) {
        var cntSameData = 0;
        for (var i = 0; i < preSkeletonData.length; i++) {
            for (var j = 0; j < skeletonData.length; j++) {
                if (preSkeletonData[i] === skeletonData[j]) cntSameData++;
            }
        }
        //var comparePrecent = (skeletonData.length > preSkeletonData.length) ? ((skeletonData.length - preSkeletonData.length) / (skeletonData.length + preSkeletonData.length)) : ((preSkeletonData.length - skeletonData.length) / (skeletonData.length + preSkeletonData.length));
        switch (true) {
            //case (comparePrecent > 0.3 || comparePrecent > 0.3):
            case (cntSameData === 0):
            case (cntSameData < preSkeletonData.length && (cntSameData / preSkeletonData.length) < (turnJudge / 100)):
                analysisResult.forceback = true;
                break;
            default:
                break;
        }
    }
    preInnerData = innerData;
    preEdgeData = edgeData;
    preSkeletonData = skeletonData;
    postMessage(JSON.stringify(analysisResult));
};