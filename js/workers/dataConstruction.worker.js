'use strict';
var preMatrixInfo = {
    timestamp: 0,
    matrix: []
};
var oneSenserArea = (47 / 13) * (47 / 13);
var calcRow = function(T, innerData, noiseFilter, result) {
    var row = [];
    row.push(T);
    var M = 0;
    var A = 0;
    var S = 0;
    for (var i = 0; i < innerData.length; i++) {
        for (var j = 0; j < innerData[i].length; j++) {
            if (innerData[i][j] <= noiseFilter) continue;
            var value = innerData[i][j];
            if (preMatrixInfo.matrix && preMatrixInfo.matrix.length && preMatrixInfo.matrix.length >= i && preMatrixInfo.matrix[i].length && preMatrixInfo.matrix[i].length >= j) {
                var from = Math.min(value, preMatrixInfo.matrix[i][j]);
                var to = Math.max(value, preMatrixInfo.matrix[i][j]);
                var c = from - to + 1;
                value = Math.random() * c + to;
            }
            M = Math.max(M, value);
            A += value;
            S += oneSenserArea;
        }
    }
    if (S > 0) A /= S;
    row.push(M);
    row.push(A);
    row.push(S);
    result.list.push(row);
};
var clear = function() {
    preMatrixInfo.timestamp = 0;
    preMatrixInfo.matrix.length = 0;
};
onmessage = function(event) {
    //postMessage(event.data);
    //return;
    var message = JSON.parse(event.data);
    var id = message.id;
    if (message.clear) {
        clear();
        return;
    }
    var innerData = message.data;
    if (message.size && message.physicalSize && message.size.x && message.size.y && message.physicalSize.x && message.physicalSize.y) oneSenserArea = (message.physicalSize.x / message.size.x) * (message.physicalSize.y / message.size.y);
    if (!innerData || !innerData.length || !innerData[0].length) return;
    var timestamp = message.timeStamp ? message.timeStamp : (new Date()).getTime();
    var splitTimes = message.splitTimes ? message.splitTimes : 1;
    var noiseFilter = message.noiseFilter ? message.noiseFilter : 0;
    var result = {
        id: id,
        list: []
    };
    if (preMatrixInfo.timestamp && preMatrixInfo.timestamp < timestamp && splitTimes > 1) {
        var timeStep = Math.floor((timestamp - preMatrixInfo.timestamp) / splitTimes);
        if (timeStep < 1) timeStep = 1;
        var idxStep = preMatrixInfo.timestamp + timeStep;
        for (idxStep; idxStep < timestamp - timeStep; idxStep += timeStep) {
            calcRow(idxStep, innerData, noiseFilter, result);
        }
        preMatrixInfo.timestamp = idxStep;
    } else {
        clear();
        calcRow(timestamp, innerData, noiseFilter, result);
    }
    if (!preMatrixInfo.timestamp || !preMatrixInfo.matrix || !preMatrixInfo.matrix.length) {
        preMatrixInfo.timestamp = timestamp;
        preMatrixInfo.matrix = innerData;
    }
    postMessage(JSON.stringify(result));
};