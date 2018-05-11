'use strict';
var tmpBuffer = [];
var innerData = null;

var combineNumData = function(chars) {
    var result = 0;
    for (var i = 0; i < chars.length; i++) {
        result += parseInt(String.fromCharCode(chars[i])) * Math.pow(10, (chars.length - (i + 1)));
    }
    return result;
};
var lineFilter = function() {
    if (!innerData || !innerData.length || !innerData[0].length) return;
    for (var i = 0; i < innerData[0].length; i++) {
        var thisLineSum = 0;
        for (var j = 0; j < innerData.length; j++) {
            if (innerData[j][i] >= 750) thisLineSum += innerData[j][i];
        }
        thisLineSum = thisLineSum * 0.08;
        for (var j = 0; j < innerData.length; j++) {
            if (innerData[j][i] <= thisLineSum) innerData[j][i] = 0;
        }
    }
};
var _formatABufferData = function(record) {
    if (record.indexOf(95) <= 0 || record.indexOf(95) === record.lastIndexOf(95)) return;
    var idx = 0;
    var chrX = [];
    for (idx; idx < record.indexOf(95); idx++) {
        chrX.push(record[idx]);
    }
    var x = combineNumData(chrX);
    idx++;
    var chrY = [];
    for (idx; idx < record.lastIndexOf(95); idx++) {
        chrY.push(record[idx]);
    }
    var y = combineNumData(chrY);
    idx++;
    var chrData = [];
    for (idx; idx < record.length; idx++) {
        chrData.push(record[idx]);
    }
    var data = combineNumData(chrData);
    if (!innerData.length || innerData.length <= x) return;
    if (innerData[x] === undefined || !innerData[x].length || innerData[x].length <= y) return;
    innerData[x][y] = data;
};
onmessage = function(event) {
    var message = JSON.parse(event.data);
    if (!innerData && message.innerData) innerData = message.innerData;
    var buffer = message.data.data;
    if (!buffer || !buffer.length) return;
    tmpBuffer = tmpBuffer.concat(buffer);

    if (buffer.indexOf(69) >= 0) {
        if (tmpBuffer.indexOf(83) !== 0 || tmpBuffer.indexOf(70) <= 0 ||
            tmpBuffer.indexOf(95) <= 1) {
            tmpBuffer = [];
            return;
        }
        var size = {};
        var arrHead = tmpBuffer.slice(tmpBuffer.indexOf(83) + 1, tmpBuffer.indexOf(70));
        var arrData = tmpBuffer.slice(tmpBuffer.indexOf(70) + 1, tmpBuffer.indexOf(69));

        //---------------------------------------------------------
        var chrX = [];
        var idx = 0;
        var productType = '';
        if ((arrHead[idx] >= 65 && arrHead[idx] <= 90) ||
            (arrHead[idx] >= 97 && arrHead[idx] <= 122)) {
            for (idx; idx < 2; idx++)
                productType += String.fromCharCode(arrHead[idx]);
        } else productType = 'A3';
        //productType = 'A3';
        for (idx; idx < arrHead.indexOf(95); idx++) {
            chrX.push(arrHead[idx]);
        }
        if (!chrX.length) {
            tmpBuffer = [];
            return;
        }
        size.x = combineNumData(chrX);
        idx++;
        var chrY = [];
        for (idx; idx < arrHead.length; idx++) {
            chrY.push(arrHead[idx]);
        }
        if (!chrY.length) {
            tmpBuffer = [];
            return;
        }
        size.y = combineNumData(chrY);
        if (!size.x || !size.y) {
            tmpBuffer = [];
            return;
        }
        //-----------------

        if (!innerData || !innerData.length || !innerData[0].length ||
            innerData.length !== size.x || innerData[0].length !== size.y) {
            innerData = [];
            for (var i = 0; i < size.x; i++) {
                var row = [];
                for (var j = 0; j < size.y; j++) {
                    row.push(0);
                }
                innerData.push(row);
            }
        }

        idx = 0;
        var oneRecord = [];
        for (idx; idx < arrData.length; idx++) {
            if (arrData[idx] === 65) {
                if (!oneRecord.length) continue;
                _formatABufferData(oneRecord);
                oneRecord.length = 0;
                continue;
            }
            oneRecord.push(arrData[idx]);
        }
        lineFilter();
        var result = {
            type: productType,
            size: size,
            data: innerData
        };
        if (innerData && innerData.length && innerData[0].length &&
            innerData.length !== size.x || innerData[0].length !== size.y)
            innerData = result.data = null;
        postMessage(JSON.stringify(result));
        tmpBuffer = [];
    }
};