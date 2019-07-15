'use strict';
var privateInfo = {
    checkMatrixCollection: [],
    innerMatrix: null,
    partCollection: null,
    timestampCollection: [],
    started: false
};
var outputCollection = function(id, timestamp) {
    var result = {
        id: id,
        check: true
    };
    result.startTimestamp = privateInfo.timestampCollection.pop();
    privateInfo.timestampCollection.push(timestamp);
    //Output!!!!
    result.matrix = JSON.parse(JSON.stringify(privateInfo.innerMatrix));
    result.partCollection = JSON.parse(JSON.stringify(privateInfo.partCollection));
    privateInfo.checkMatrixCollection.length = 0;
    postMessage(JSON.stringify(result));
};
onmessage = function(event) {
    var message = JSON.parse(event.data);
    var id = message.id;
    var innerData = message.data;
    var noiseFilter = message.noiseFilter ? message.noiseFilter : 0;
    var timestamp = message.timestamp;
    var checkLimit = message.checkLimit || 10;
    if (checkLimit < 3) checkLimit = 3;
    var partInfo = message.partInfo || null;
    var forceStart = message.forceStart || false;
    var forceClear = message.forceClear || false;
    var output = message.output || false;
    var size = message.size || {
        x: 32,
        y: 64
    };
    if (forceClear) {
        privateInfo.checkMatrixCollection.length = 0;
        privateInfo.innerMatrix = null;
        privateInfo.partCollection = null;
        privateInfo.started = false;
        return;
    }
    if (output) {
        outputCollection(id, timestamp);
        return;
    }
    if (forceStart) {
        privateInfo.timestampCollection.push(timestamp);
        privateInfo.innerMatrix = innerData;
        privateInfo.started = true;
        return;
    }
    if (!innerData || !innerData.length || !innerData[0].length) return;
    if (!privateInfo.checkMatrixCollection || !privateInfo.checkMatrixCollection.length) {
        privateInfo.checkMatrixCollection.push(innerData);
        if (output) outputCollection(id, timestamp);
        return;
    }
    if (partInfo && !privateInfo.partCollection) privateInfo.partCollection = partInfo;
    var statisticsVariance = 0;
    privateInfo.checkMatrixCollection.push(innerData);
    if (privateInfo.checkMatrixCollection.length < checkLimit) return;
    var checkMartix = privateInfo.checkMatrixCollection.shift();
    var markMartix = JSON.parse(JSON.stringify(checkMartix));
    //if (!privateInfo.innerMatrix) privateInfo.innerMatrix = JSON.parse(JSON.stringify(checkMartix));
    var checkHasValue = 0;
    for (var i = 0; i < markMartix.length; i++) {
        for (var j = 0; j < markMartix[i].length; j++) {
            if (markMartix[i][j] > noiseFilter) checkHasValue++;
            markMartix[i][j] = {
                avg: 0,
                variance: 0,
                excludeFlg: false,
                weight: 0
            };
            //privateInfo.innerMatrix[i][j] = 0;
        }
    }
    for (var cursor = 0; cursor < privateInfo.checkMatrixCollection.length - 1; cursor++) {
        for (var i = 0; i < checkMartix.length; i++) {
            for (var j = 0; j < checkMartix[i].length; j++) {
                try {
                    var a = (checkMartix[i][j] > noiseFilter ? checkMartix[i][j] : 0);
                    var b = (privateInfo.checkMatrixCollection[cursor][i][j] > noiseFilter ? privateInfo.checkMatrixCollection[cursor][i][j] : 0);
                    var c = (privateInfo.checkMatrixCollection[cursor + 1][i][j] > noiseFilter ? privateInfo.checkMatrixCollection[cursor + 1][i][j] : 0);
                    var sum = a + b + c;
                    var avg = sum / 3;
                    var variance = ((a - avg) * (a - avg) + (b - avg) * (b - avg) + (c - avg) * (c - avg)) / 3;
                    if (markMartix[i][j].variance === 0) markMartix[i][j].variance = variance;
                    else markMartix[i][j].variance = (markMartix[i][j].variance + variance) / 2;
                    if (sum < noiseFilter) {
                        markMartix[i][j].excludeFlg = true;
                        markMartix[i][j].variance *= (cursor + 1) / (checkLimit - 2);
                    }
                    if (!markMartix[i][j].excludeFlg) {
                        if (sum === a || sum === b || sum === c) markMartix[i][j].weight += (1 / (checkLimit - 2)) * (1 / 3);
                        if (sum === (a + b) || sum === (a + c) || sum === (c + b)) markMartix[i][j].weight += (1 / (checkLimit - 2)) * (2 / 3);
                        markMartix[i][j].weight += 1 / (checkLimit - 2);
                    }
                } catch (e) {
                    continue;
                }
            }
        }
    }
    for (var i = 0; i < markMartix.length; i++) {
        for (var j = 0; j < markMartix[i].length; j++) {
            statisticsVariance += markMartix[i][j].variance * markMartix[i][j].weight;
        }
    }
    statisticsVariance /= (size.x * size.y);
    //console.log(statisticsVariance);
    if (statisticsVariance <= 10 && checkHasValue > 8) {
        if (!privateInfo.started) privateInfo.timestampCollection.push(timestamp);
        privateInfo.started = true;
    } else {
        if (privateInfo.started) outputCollection(id, timestamp);
        privateInfo.started = false;
    }
    postMessage(JSON.stringify({
        id: id,
        check: false,
        statisticsVariance: statisticsVariance
    }));
    if (!privateInfo.started) return;
    if (!privateInfo.innerMatrix) privateInfo.innerMatrix = innerData;
    for (var i = 0; i < privateInfo.innerMatrix.length; i++) {
        for (j = 0; j < privateInfo.innerMatrix[i].length; j++) {
            var a = privateInfo.innerMatrix[i][j];
            var b = innerData[i][j];
            a = (a > noiseFilter ? a : 0);
            b = (b > noiseFilter ? b : 0);
            privateInfo.innerMatrix[i][j] = (a + b) / 2;
        }
    }
    if (!privateInfo.partCollection) privateInfo.partCollection = partInfo;
    privateInfo.partCollection.head.max = (privateInfo.partCollection.head.max + partInfo.head.max) / 2;
    privateInfo.partCollection.head.avg = (privateInfo.partCollection.head.avg + partInfo.head.avg) / 2;
    privateInfo.partCollection.head.area = (privateInfo.partCollection.head.area + partInfo.head.area) / 2;
    privateInfo.partCollection.shoulder.max = (privateInfo.partCollection.shoulder.max + partInfo.shoulder.max) / 2;
    privateInfo.partCollection.shoulder.avg = (privateInfo.partCollection.shoulder.avg + partInfo.shoulder.avg) / 2;
    privateInfo.partCollection.shoulder.area = (privateInfo.partCollection.shoulder.area + partInfo.shoulder.area) / 2;
    privateInfo.partCollection.loins.max = (privateInfo.partCollection.loins.max + partInfo.loins.max) / 2;
    privateInfo.partCollection.loins.avg = (privateInfo.partCollection.loins.avg + partInfo.loins.avg) / 2;
    privateInfo.partCollection.loins.area = (privateInfo.partCollection.loins.area + partInfo.loins.area) / 2;
    privateInfo.partCollection.gluteus.max = (privateInfo.partCollection.gluteus.max + partInfo.gluteus.max) / 2;
    privateInfo.partCollection.gluteus.avg = (privateInfo.partCollection.gluteus.avg + partInfo.gluteus.avg) / 2;
    privateInfo.partCollection.gluteus.area = (privateInfo.partCollection.gluteus.area + partInfo.gluteus.area) / 2;
    privateInfo.partCollection.leg.max = (privateInfo.partCollection.leg.max + partInfo.leg.max) / 2;
    privateInfo.partCollection.leg.avg = (privateInfo.partCollection.leg.avg + partInfo.leg.avg) / 2;
    privateInfo.partCollection.leg.area = (privateInfo.partCollection.leg.area + partInfo.leg.area) / 2;
    privateInfo.partCollection.scale = (privateInfo.partCollection.scale + partInfo.scale) / 2;
};