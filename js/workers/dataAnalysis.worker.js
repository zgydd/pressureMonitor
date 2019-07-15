'use strict';
var delayScaleList = [];

onmessage = function(event) {
    //postMessage(event.data);
    //return;
    var sourceData = JSON.parse(event.data);
    var innerData = sourceData.innerData;
    var maxLimit = sourceData.maxLimit ? sourceData.maxLimit : 4096;
    var cd = sourceData.cd ? sourceData.cd : 0;
    var presureRanges = sourceData.presureRanges;
    var newScale = sourceData.baseScale + presureRanges;
    var pressureScale = sourceData.pressureScale;
    var scaleNum = sourceData.baseScale + pressureScale;
    var delayedSampling = sourceData.delayedSampling ? sourceData.delayedSampling : 21;
    var threshold = sourceData.threshold;

    var thisRange = 0;

    var middData = {};

    //##########Algorithms about times and presure################
    var maxPrecent = 0;
    for (var i = 0; i < innerData.length; i++) {
        for (var j = 0; j < innerData[i].length; j++) {
            if (innerData[i][j] <= 0) continue;
            //var mePrecent = srcDataFlg ? (innerData[i][j] / maxLimit) : innerData[i][j];
            var mePrecent = innerData[i][j];
            maxPrecent = Math.max(maxPrecent, mePrecent);
        }
    }
    if (maxPrecent <= 0) return;

    middData.maxPrecent = maxPrecent;
    middData.maxPrecentBase = ((maxLimit / (presureRanges + 1) * 1) / maxLimit);
    var idxPresureRange = 0;
    for (idxPresureRange = 1; idxPresureRange <= presureRanges; idxPresureRange++) {
        if (maxPrecent <= ((maxLimit / (presureRanges + 1) * idxPresureRange) / maxLimit)) {
            newScale -= idxPresureRange;
            break;
        }
    }
    if (idxPresureRange > presureRanges) newScale -= presureRanges;
    newScale++;

    var newCountDownRange = 0;
    for (var i = 0; i < threshold.length; i++) {
        if (threshold[i].min <= scaleNum && threshold[i].max >= scaleNum) thisRange = threshold[i].rangeTime;
        if (threshold[i].min <= newScale && threshold[i].max >= newScale) newCountDownRange = threshold[i].rangeTime;
    }

    ///*-----------delay recalc
    if (delayScaleList.length < delayedSampling) {
        delayScaleList.push(newCountDownRange);
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

    delayScaleList.length = 0;
    //---------------------------------------*/

    if (newScale !== scaleNum) {
        if (newCountDownRange !== thisRange) cd = (cd / (thisRange * 60)) * (newCountDownRange * 60);
        var analysisResult = {
            cd: cd,
            countDownRange: newCountDownRange,
            scale: newScale,
            middData: middData
        };
        postMessage(JSON.stringify(analysisResult));
    }
};