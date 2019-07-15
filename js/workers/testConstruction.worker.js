'use strict';
var preMatrixInfo = {
    timestamp: 0,
    matrix: []
};
var oneSenserArea = (47 / 13) * (47 / 13);
var calcRow = function(T, innerData, noiseFilter, result) {
    var row = [];
    row.push(T);
    var sM = 0;
    var sA = 0;
    var sS = 0;
    var M = 0;
    var A = 0;
    var S = 0;
    var s2A = 0;
    var s2S = 0;
    for (var i = 0; i < innerData.length; i++) {
        for (var j = 0; j < innerData[i].length; j++) {
            if (innerData[i][j] > 31) {
                var value = innerData[i][j];
                s2A += value;
                s2S++;
            }
            if (innerData[i][j] <= noiseFilter) continue;
            var value = innerData[i][j];
            sM = Math.max(M, value);
            sA += value;
            sS++;
            M = Math.max(M, value);
            A += value;
            S += oneSenserArea;
        }
    }
    if (sS > 0) sA /= sS;
    if (s2S > 0) s2A /= s2S;
    if (S > 0) A /= S;
    row.push(M);
    row.push(A);
    row.push(S);
    row.push(sM);
    row.push(sA);
    row.push(sS);
    row.push(oneSenserArea);
    row.push(s2A);
    row.push(s2S);
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
    var noiseFilter = message.noiseFilter ? message.noiseFilter : 0;
    var result = {
        id: id,
        list: []
    };
    clear();
    calcRow(timestamp, innerData, noiseFilter, result);
    if (!preMatrixInfo.timestamp || !preMatrixInfo.matrix || !preMatrixInfo.matrix.length) {
        preMatrixInfo.timestamp = timestamp;
        preMatrixInfo.matrix = innerData;
    }
    postMessage(JSON.stringify(result));
};