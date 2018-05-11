'use strict';
var maxSize = {
    x: 0,
    y: 0,
    map: {}
};
var splitPoint = null;
var innerData = null;
var callbackFlg = false;

var combineNumData = function(chars) {
    var result = 0;
    for (var i = 0; i < chars.length; i++) {
        result += parseInt(String.fromCharCode(chars[i])) * Math.pow(10, (chars.length - (i + 1)));
    }
    return result;
};

var _formatABufferData = function(startIdx, endIdx, bufferData) {
    if (endIdx - startIdx < 5) return;
    var oneRecord = bufferData.slice(startIdx, endIdx + 1);
    var cursorFlg = 0;
    var tmpRecord = [];
    var x, y, numData;
    for (var i = 0; i < oneRecord.length; i++) {
        if (oneRecord[i] === 32) {
            if (tmpRecord.length < 1) continue;
            switch (cursorFlg) {
                case 0:
                    x = combineNumData(tmpRecord);
                    break;
                case 1:
                    y = combineNumData(tmpRecord);
                    break;
                default:
                    break;
            }
            tmpRecord.length = 0;
            cursorFlg++;
            continue;
        }
        if (oneRecord[i] === 65) {
            numData = combineNumData(tmpRecord);
            break;
        }
        tmpRecord.push(oneRecord[i]);
    }
    if (x === undefined || y === undefined || numData === undefined ||
        isNaN(x) || isNaN(y) || isNaN(numData)) return;

    if (x + 1 > maxSize.x) maxSize.x = x + 1;
    if (y + 1 > maxSize.y) maxSize.y = y + 1;
    if (innerData && (x >= innerData.length || y >= innerData[0].length)) return;

    if (!innerData) {
        maxSize.map[x + '-' + y] = numData;
    } else if (innerData[x][y] != numData) {
        innerData[x][y] = numData;
    }

    if (!splitPoint) splitPoint = {
        x: x,
        y: y
    }
    else if (splitPoint.x === x && splitPoint.y === y) {
        if (!innerData) {
            innerData = [];
            for (var i = 0; i < maxSize.x; i++) {
                var inLine = [];
                for (var j = 0; j < maxSize.y; j++) {
                    inLine.push(-1);
                }
                innerData.push(inLine);
            }
            for (var ele in maxSize.map) {
                var tmpArr = ele.split('-');
                if (tmpArr.length !== 2) continue;
                if (tmpArr[0] < 0 || tmpArr[1] < 0 ||
                    tmpArr[0] >= maxSize.x || tmpArr[1] >= maxSize.y)
                    continue;
                innerData[tmpArr[0]][tmpArr[1]] = maxSize.map[ele];
            }
        }
        callbackFlg = true;
    }
};

onmessage = function(event) {
    var message = JSON.parse(event.data);
    if (!innerData && message.innerData) innerData = message.innerData;
    var startPos = 0;
    var buffer = message.data.data;
    for (startPos = 0; startPos < buffer.length; startPos++) {
        if (buffer[startPos] === 65) break;
    }
    if (startPos >= buffer.length) return;
    var startIdx = startPos + 1;
    for (var i = startPos + 1; i < buffer.length; i++) {

        if (buffer[i] === 65) {
            _formatABufferData(startIdx, i, buffer);
            startIdx = i + 1;
        }
    }

    if (callbackFlg) {
        if (innerData.length && innerData[0].length) {
            for (var i = 0; i < innerData[0].length; i++) {
                var thisLineSum = 0;
                for (var j = 0; j < innerData.length; j++) {
                    if (innerData[j][i] >= 800) thisLineSum += innerData[j][i];
                }
                thisLineSum = thisLineSum * 0.07;
                for (var j = 0; j < innerData.length; j++) {
                    if (innerData[j][i] <= thisLineSum) innerData[j][i] = 0;
                }
            }
        }
        var result = {
            size: {
                x: maxSize.x,
                y: maxSize.y
            },
            data: innerData
        };
        if (innerData && innerData.length && innerData[0].length &&
            innerData.length !== maxSize.x || innerData[0].length !== maxSize.y)
            innerData = result.data = null;
        postMessage(JSON.stringify(result));
        splitPoint = null;
        callbackFlg = false;
    }
};
/*** old version
var maxSize = {
	x: 0,
	y: 0,
	map: {}
};
var splitPoint = null;
var innerData = null;
var callbackFlg = false;

var _hex2char = function(data) {
	var a = data.toString().trim();
	switch (a.length) {
		case 1:
			a = '%u000' + a;
			break;
		case 2:
			a = '%u00' + a;
			break;
		case 3:
			a = '%u0' + a;
			break;
		case 4:
			a = '%u' + a;
			break;
		default:
			break;
	}
	return unescape(a);
};
var _formatABufferData = function(startIdx, endIdx, bufferData) {
	if (endIdx - startIdx !== 5) return;
	var x = parseInt(bufferData[startIdx]);
	var y = parseInt(bufferData[startIdx + 1]);
	if (x + 1 > maxSize.x) maxSize.x = x + 1;
	if (y + 1 > maxSize.y) maxSize.y = y + 1;
	if (innerData && (x >= innerData.length || y >= innerData[0].length)) return;

	var recordData = [];
	for (var i = startIdx + 2; i < endIdx; i++) {
		recordData.push(_hex2char(bufferData[i].toString(16)));
	}
	var numData = parseInt(new String(recordData[0] + recordData[1] + recordData[2]), 16);
	if (!innerData) {
		maxSize.map[x + '-' + y] = numData;
	} else if (innerData[x][y] != numData) {
		innerData[x][y] = numData;
	}

	if (!splitPoint) splitPoint = {
		x: x,
		y: y
	}
	else if (splitPoint.x === x && splitPoint.y === y) {
		if (!innerData) {
			innerData = [];
			for (var i = 0; i < maxSize.x; i++) {
				var inLine = [];
				for (var j = 0; j < maxSize.y; j++) {
					inLine.push(-1);
				}
				innerData.push(inLine);
			}
			for (var ele in maxSize.map) {
				var tmpArr = ele.split('-');
				if (tmpArr.length !== 2) continue;
				if (tmpArr[0] < 0 || tmpArr[1] < 0 ||
					tmpArr[0] >= maxSize.x || tmpArr[1] >= maxSize.y)
					continue;
				innerData[tmpArr[0]][tmpArr[1]] = maxSize.map[ele];
			}
		}
		callbackFlg = true;
	}
};

onmessage = function(event) {
	var message = JSON.parse(event.data);
	if (!innerData && message.innerData) innerData = message.innerData;
	var startPos = 0;
	var buffer = message.data.data;
	for (startPos = 0; startPos < buffer.length; startPos++) {
		if (buffer[startPos] === 255) break;
	}
	if (startPos >= buffer.length) return;
	var startIdx = startPos + 1;
	for (var i = startPos + 1; i < buffer.length; i++) {

		if (buffer[i] === 255) {
			_formatABufferData(startIdx, i, buffer);
			startIdx = i + 1;
		}
	}

	if (callbackFlg) {
		var result = {
			size: {
				x: maxSize.x,
				y: maxSize.y
			},
			data: innerData
		};
		if (innerData && innerData.length && innerData[0].length &&
			innerData.length !== maxSize.x || innerData[0].length !== maxSize.y)
			innerData = result.data = null;
		postMessage(JSON.stringify(result));
		splitPoint = null;
		callbackFlg = false;
	}
};
*/