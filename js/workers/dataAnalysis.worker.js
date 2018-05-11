'use strict';
var delayScaleList = [];
var preInnerData = null;
var preEdgeData = null;
var preSkeletonData = null;

onmessage = function(event) {
    //postMessage(event.data);
    //return;
    var sourceData = JSON.parse(event.data);

    var innerData = sourceData.innerData;
    var calibrationData = sourceData.calibrationData;
    var presureRanges = sourceData.presureRanges;
    var newScale = sourceData.baseScale + presureRanges;
    var threshold = sourceData.threshold;
    var cd = sourceData.cd ? sourceData.cd : 0;
    var delayedSampling = sourceData.delayedSampling ? sourceData.delayedSampling : 21;

    var turnJudge = sourceData.turnJudge ? sourceData.turnJudge : 10;
    var edgeData = sourceData.edgeList ? sourceData.edgeList : null;
    var skeletonData = sourceData.skeletonList ? sourceData.skeletonList : null;

    var middData = {};

    if (preInnerData === null) preInnerData = innerData;

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
            cd: cd,
            middData: {
                newScale: newScale
            },
            leave: true
        };
        postMessage(JSON.stringify(analysisResult));
        return;
    }

    middData.maxPrecent = maxPrecent;
    middData.maxPrecentBase = ((4096 / (presureRanges + 1) * 1) / 4096);

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

    middData.newScale = newScale;
    var newCountDownRange = 0;
    for (var i = 0; i < threshold.length; i++) {
        if (threshold[i].min <= newScale && threshold[i].max >= newScale) {
            newCountDownRange = threshold[i].rangeTime;
            break;
        }
    }
    middData.newCountDownRange = newCountDownRange;

    ///*-----------delay recalc
    if (delayScaleList.length < delayedSampling) {
        delayScaleList.push(newCountDownRange);
        preInnerData = innerData;
        return;
    }
    delayScaleList.sort();

    var tmpIdx = [];
    for (var i = 0; i < delayScaleList.length - 1; i++) {
        if (delayScaleList[i] !== delayScaleList[i + 1]) {
            if (!tmpIdx.length) tmpIdx.push({
                cnt: i + 1,
                value: delayScaleList[i]
            });
            else tmpIdx.push({
                cnt: i + 1 - tmpIdx[tmpIdx.length - 1].cnt,
                value: delayScaleList[i]
            });
        }
    }
    if (!tmpIdx.length) tmpIdx.push({
        cnt: delayScaleList.length,
        value: delayScaleList[delayScaleList.length - 1]
    });
    else tmpIdx.push({
        cnt: delayScaleList.length - tmpIdx[tmpIdx.length - 1].cnt,
        value: delayScaleList[delayScaleList.length - 1]
    });
    middData.tmpIdx = tmpIdx;
    if (tmpIdx.length <= 1) newCountDownRange = delayScaleList[0];
    else {
        var max = 0;
        var maxRange = 0;
        for (var i = 0; i < tmpIdx.length; i++) {
            if (tmpIdx[i].cnt > max) {
                maxRange = tmpIdx[i].value;
                max = tmpIdx[i].cnt;
            }
        }
        if (maxRange !== 0) newCountDownRange = maxRange;
    }
    middData.dualCountDownRange = newCountDownRange;
    delayScaleList.length = 0;
    //---------------------------------------*/

    var analysisResult = {
        cd: cd,
        data: newCountDownRange,
        middData: middData
    };
    if (!edgeData || !edgeData.length) analysisResult.leave = true;

    if (!analysisResult.leave && preSkeletonData && preSkeletonData.length && skeletonData && skeletonData.length &&
        preSkeletonData.length === skeletonData.length && preSkeletonData[0].length === skeletonData[0].length) {
        var cntSameData = 0;
        for (var i = 0; i < preSkeletonData.length; i++) {
            for (var j = 0; j < preSkeletonData[i].length; j++) {
                if (skeletonData[i][j] > 0 && skeletonData[i][j] === preSkeletonData[i][j]) cntSameData++;
            }
        }
        //var comparePrecent = Math.abs(skeletonData.length - preSkeletonData.length) * 2 / (skeletonData.length + preSkeletonData.length);
        switch (true) {
            //case (comparePrecent > 0.3):
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