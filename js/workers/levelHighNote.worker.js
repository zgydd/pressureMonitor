'use strict';
var dualResult = [];

onmessage = function(event) {
    var message = JSON.parse(event.data);
    if (!message || !message.length || !message[0].length) return;
    var result = [];
    var innerMatrix = [];
    for (var i = 0; i < message.length; i++) {
        var innerMatrixRow = [];
        for (var j = 0; j < message[i].length; j++) {
            if (message[i][j] < 0.7) {
                innerMatrixRow.push(0);
                continue;
            }
            //result.push({ x: i, y: j, timestamp: (new Date()).getTime() });
            var k = 0;
            for (k = 0; k < dualResult.length; k++) {
                if (parseInt(dualResult[k].x) === i && parseInt(dualResult[k].y) === j) {
                    result.push(JSON.parse(JSON.stringify(dualResult[k])));
                    innerMatrixRow.push(dualResult[k].timestamp);
                    break;
                }
            }
            if (k >= dualResult.length) {
                var tmpStamp = (new Date()).getTime();
                result.push({
                    x: i,
                    y: j,
                    timestamp: tmpStamp
                });
                innerMatrixRow.push(tmpStamp);
            }
        }
        innerMatrix.push(innerMatrixRow);
    }
    dualResult.length = 0;
    dualResult = JSON.parse(JSON.stringify(result));
    if (!result.length) postMessage(JSON.stringify([]));
    var tmpScan = [];
    for (var i = 0; i < innerMatrix.length; i++) {
        var lineRecord = {};
        for (var j = 0; j < innerMatrix[i].length; j++) {
            if (innerMatrix[i][j] > 0) {
                lineRecord.idxTmp = i;
                if (j === 0 || innerMatrix[i][j - 1] <= 0) {
                    lineRecord.Sy = j;
                    lineRecord.timestamp = innerMatrix[i][j];
                }
                if (j > 0 && j < innerMatrix[i].length - 1 &&
                    innerMatrix[i][j - 1] > 0 && innerMatrix[i][j + 1] > 0) {
                    lineRecord.timestamp = Math.min(lineRecord.timestamp, innerMatrix[i][j]);
                }
                if (j === innerMatrix[i].length - 1 || innerMatrix[i][j + 1] <= 0) {
                    lineRecord.Ey = j;
                    lineRecord.timestamp = Math.min(lineRecord.timestamp, innerMatrix[i][j]);
                    tmpScan.push(JSON.parse(JSON.stringify(lineRecord)));
                    lineRecord = {};
                }
            }
        }
    }
    var groupNum = 0;
    for (var i = 0; i < tmpScan.length; i++) {
        for (var j = 0; j < tmpScan.length; j++) {
            if (Math.abs(tmpScan[i].idxTmp - tmpScan[j].idxTmp) === 1 &&
                (((tmpScan[i].Sy >= tmpScan[j].Sy - 1 && tmpScan[i].Sy <= tmpScan[j].Ey + 1) ||
                        (tmpScan[i].Ey >= tmpScan[j].Sy - 1 && tmpScan[i].Sy <= tmpScan[j].Ey + 1)) ||
                    ((tmpScan[j].Sy >= tmpScan[i].Sy - 1 && tmpScan[j].Sy <= tmpScan[i].Ey + 1) ||
                        (tmpScan[j].Ey >= tmpScan[i].Sy - 1 && tmpScan[j].Sy <= tmpScan[i].Ey + 1)))
            ) {
                switch (true) {
                    case (tmpScan[i].group === undefined && tmpScan[j].group === undefined):
                        tmpScan[i].group = groupNum;
                        tmpScan[j].group = groupNum;
                        groupNum++;
                        tmpScan[i].minX = (tmpScan[i].minX === undefined) ?
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[i].minX);
                        tmpScan[i].maxX = (tmpScan[i].maxX === undefined) ?
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[i].maxX);
                        tmpScan[j].minX = (tmpScan[j].minX === undefined) ?
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[j].minX);
                        tmpScan[j].maxX = (tmpScan[j].maxX === undefined) ?
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[j].maxX);
                        break;
                    case (tmpScan[i].group === undefined):
                        tmpScan[i].group = tmpScan[j].group;
                        tmpScan[i].minX = (tmpScan[i].minX === undefined) ?
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[i].minX);
                        tmpScan[i].maxX = (tmpScan[i].maxX === undefined) ?
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[i].maxX);
                        break;
                    case (tmpScan[j].group === undefined):
                        tmpScan[j].group = tmpScan[i].group;
                        tmpScan[j].minX = (tmpScan[j].minX === undefined) ?
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.min(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[j].minX);
                        tmpScan[j].maxX = (tmpScan[j].maxX === undefined) ?
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp) :
                            Math.max(tmpScan[i].idxTmp, tmpScan[j].idxTmp, tmpScan[j].maxX);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    for (var i = 0; i < tmpScan.length; i++) {
        if (tmpScan[i].group === undefined) tmpScan[i].group = -1;
    }
    tmpScan.sort(function(a, b) {
        return b.group - a.group;
    });
    var postData = [];
    var grpIdx = -1;
    for (var i = tmpScan.length - 1; i >= 0; i--) {
        if (tmpScan[i].group === -1) {
            postData.push(tmpScan.splice(i, 1));
            continue;
        }
        if (grpIdx === -1) grpIdx = i;
        if (i === 0 || tmpScan[i].group != tmpScan[i - 1].group) {
            if (grpIdx === -1) tmpScan.splice(i, 1);
            else postData.push(tmpScan.splice(i, grpIdx - i + 1));
        }
    }
    postMessage(JSON.stringify(postData));
};