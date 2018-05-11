'use strict';
var _martix_ = null;
//  p9 p2 p3  
//  p8 p1 p4  
//  p7 p6 p5 
var getAround = function(i, j) {
	var width = _martix_.length;
	var height = _martix_[0].length;
	var result = {};
	result.p4 = (i === width - 1) ? ({
		value: 0,
		x: i + 1,
		y: j
	}) : ({
		value: _martix_[i + 1][j],
		x: i + 1,
		y: j
	});
	result.p8 = (i === 0) ? ({
		value: 0,
		x: i - 1,
		y: j
	}) : ({
		value: _martix_[i - 1][j],
		x: i - 1,
		y: j
	});
	result.p2 = (j === 0) ? ({
		value: 0,
		x: i,
		y: j - 1
	}) : ({
		value: _martix_[i][j - 1],
		x: i,
		y: j - 1
	});
	result.p3 = (i === width - 1 || j === 0) ? ({
		value: 0,
		x: i + 1,
		y: j - 1
	}) : ({
		value: _martix_[i + 1][j - 1],
		x: i + 1,
		y: j - 1
	});
	result.p9 = (i === 0 || j === 0) ? ({
		value: 0,
		x: i - 1,
		y: j - 1
	}) : ({
		value: _martix_[i - 1][j - 1],
		x: i - 1,
		y: j - 1
	});
	result.p6 = (j === height - 1) ? ({
		value: 0,
		x: i,
		y: j + 1
	}) : ({
		value: _martix_[i][j + 1],
		x: i,
		y: j + 1
	});
	result.p5 = (i === width - 1 || j === height - 1) ? ({
		value: 0,
		x: i + 1,
		y: j + 1
	}) : ({
		value: _martix_[i + 1][j + 1],
		x: i + 1,
		y: j + 1
	});
	result.p7 = (i === 0 || j === height - 1) ? ({
		value: 0,
		x: i - 1,
		y: j + 1
	}) : ({
		value: _martix_[i - 1][j + 1],
		x: i - 1,
		y: j + 1
	});
	result.cntAround = result.p4.value + result.p8.value +
		result.p2.value + result.p3.value + result.p9.value +
		result.p6.value + result.p5.value + result.p7.value;
	return result;
};
var findEndpoints = function(pathRange) {
	var endpoints = [];
	for (var i = 0; i < _martix_.length; i++) {
		for (var j = pathRange.min; j <= pathRange.max; j++) {
			if (_martix_[i][j] === 0) continue;
			if ((getAround(i, j)).cntAround === 1) {
				endpoints.push({
					x: i,
					y: j,
					checked: false
				});
			}
		}
	}
	return endpoints;
};
var getHypotenuse = function(edgeA, edgeB) {
	return Math.sqrt(Math.pow(edgeA, 2) + Math.pow(edgeB, 2));
};
/*
var traceTrajectory_2 = function(refResult, startPoint, endPointRange, x, y, excludeX, excludeY) {
	var around = getAround(x, y);
	if (excludeX !== undefined && excludeY !== undefined && around.cntAround === 1) {
		for (var i = 0; i < endPointRange.length; i++) {
			if (x === endPointRange[i].x && y === endPointRange[i].y && !endPointRange[i].checked) {
				endPointRange[i].checked = true;
				for (var j = 0; j < refResult.length; j++) {
					if (refResult[j].pointA.x === startPoint.x && refResult[j].pointA.y === startPoint.y) {
						if (refResult[j].pointB) {
							if (getHypotenuse((startPoint.x - x), (startPoint.y - y)) >
								getHypotenuse((startPoint.x - refResult[j].pointB.x), (startPoint.y - refResult[j].pointB.y))) {
								refResult[j].pointB.x = x;
								refResult[j].pointB.y = y;
							}
						} else {
							refResult[j].pointB = {
								x: x,
								y: y
							};
						}
						break;
					}
				}
				break;
			}
		}
		return;
	}
	if (around.p4.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p4.x === excludeX && around.p4.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p4.x, around.p4.y, x, y);
	if (around.p8.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p8.x === excludeX && around.p8.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p8.x, around.p8.y, x, y);
	if (around.p2.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p2.x === excludeX && around.p2.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p2.x, around.p2.y, x, y);
	if (around.p3.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p3.x === excludeX && around.p3.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p3.x, around.p3.y, x, y);
	if (around.p9.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p9.x === excludeX && around.p9.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p9.x, around.p9.y, x, y);
	if (around.p6.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p6.x === excludeX && around.p6.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p6.x, around.p6.y, x, y);
	if (around.p5.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p5.x === excludeX && around.p5.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p5.x, around.p5.y, x, y);
	if (around.p7.value > 0 &&
		((excludeX === undefined && excludeY === undefined) ||
			!(around.p7.x === excludeX && around.p7.y === excludeY)))
		traceTrajectory_2(refResult, startPoint, endPointRange, around.p7.x, around.p7.y, x, y);
};
var getTrajectory_2 = function(endPointRange) {
	var refResult = [];
	for (var i = 0; i < endPointRange.length; i++) {
		if (endPointRange[i].checked) continue;
		endPointRange[i].checked = true;
		refResult.push({
			pointA: {
				x: endPointRange[i].x,
				y: endPointRange[i].y
			},
			pointB: null
		});
		traceTrajectory_2(refResult, {
			x: endPointRange[i].x,
			y: endPointRange[i].y
		}, endPointRange, endPointRange[i].x, endPointRange[i].y);
	}
	for (var i = refResult.length - 1; i >= 0; i--) {
		if (!refResult[i].pointB) refResult.splice(i, 1);
	}
	return refResult;
};
*/
var traceTrajectory = function(refResult, endPointRange, trajectoryPath, x, y) {
	if (trajectoryPath[x + '-' + y]) return;
	trajectoryPath[x + '-' + y] = true;
	var around = getAround(x, y);
	if (around.cntAround === 1) {
		var oldCheck = true;
		for (var i = 0; i < endPointRange.length; i++) {
			if (endPointRange[i].x === x && endPointRange[i].y === y) {
				oldCheck = endPointRange[i].checked;
				endPointRange[i].checked = true;
				break;
			}
		}
		refResult[refResult.length - 1].push({
			x: x,
			y: y
		});
		if (!oldCheck) return;
	}
	if (around.p4.value > 0 && !trajectoryPath[around.p4.x + '-' + around.p4.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p4.x, around.p4.y);
	if (around.p8.value > 0 && !trajectoryPath[around.p8.x + '-' + around.p8.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p8.x, around.p8.y);
	if (around.p2.value > 0 && !trajectoryPath[around.p2.x + '-' + around.p2.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p2.x, around.p2.y);
	if (around.p3.value > 0 && !trajectoryPath[around.p3.x + '-' + around.p3.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p3.x, around.p3.y);
	if (around.p9.value > 0 && !trajectoryPath[around.p9.x + '-' + around.p9.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p9.x, around.p9.y);
	if (around.p6.value > 0 && !trajectoryPath[around.p6.x + '-' + around.p6.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p6.x, around.p6.y);
	if (around.p5.value > 0 && !trajectoryPath[around.p5.x + '-' + around.p5.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p5.x, around.p5.y);
	if (around.p7.value > 0 && !trajectoryPath[around.p7.x + '-' + around.p7.y])
		traceTrajectory(refResult, endPointRange, trajectoryPath, around.p7.x, around.p7.y);
};
var getTrajectory = function(endPointRange) {
	var refResult = [];
	for (var i = 0; i < endPointRange.length; i++) {
		if (endPointRange[i].checked) continue;
		endPointRange[i].checked = true;
		var trajectoryPath = {};
		refResult.push([]);
		traceTrajectory(refResult, endPointRange, trajectoryPath, endPointRange[i].x, endPointRange[i].y);
	}
	return refResult;
};
var findTrajectory = function(splitedEndpoints) {
	var result = [];
	for (var i = 0; i < splitedEndpoints.length; i++) {
		if (splitedEndpoints[i].length < 2) continue;
		if (splitedEndpoints[i].length === 2) {
			result.push({
				pointA: {
					x: splitedEndpoints[i][0].x,
					y: splitedEndpoints[i][0].y
				},
				pointB: {
					x: splitedEndpoints[i][1].x,
					y: splitedEndpoints[i][1].y
				}
			});
			continue;
		}
		result.push({});
		for (var iterator = 0; iterator < splitedEndpoints[i].length; iterator++) {
			for (var iterator2 = iterator + 1; iterator2 < splitedEndpoints[i].length; iterator2++) {
				if (!result[result.length - 1].pointA && !result[result.length - 1].pointB) {
					if (!result[result.length - 1].pointA) {
						result[result.length - 1].pointA = {
							x: splitedEndpoints[i][iterator].x,
							y: splitedEndpoints[i][iterator].y
						}
					}
					if (!result[result.length - 1].pointB) {
						result[result.length - 1].pointB = {
							x: splitedEndpoints[i][iterator2].x,
							y: splitedEndpoints[i][iterator2].y
						}
					}
					result[result.length - 1].distance = getHypotenuse(
						(result[result.length - 1].pointA.x - result[result.length - 1].pointB.x),
						(result[result.length - 1].pointA.y - result[result.length - 1].pointB.y));
					continue;
				}
				var oldDist = getHypotenuse(
					(result[result.length - 1].pointA.x - result[result.length - 1].pointB.x),
					(result[result.length - 1].pointA.y - result[result.length - 1].pointB.y));
				var distA = getHypotenuse(
					(result[result.length - 1].pointA.x - splitedEndpoints[i][iterator2].x),
					(result[result.length - 1].pointA.y - splitedEndpoints[i][iterator2].y));
				var distB = getHypotenuse(
					(result[result.length - 1].pointB.x - splitedEndpoints[i][iterator2].x),
					(result[result.length - 1].pointB.y - splitedEndpoints[i][iterator2].y));
				switch (true) {
					case (distA > oldDist && distA > distB):
						result[result.length - 1].pointB.x = splitedEndpoints[i][iterator2].x;
						result[result.length - 1].pointB.y = splitedEndpoints[i][iterator2].y;
						result[result.length - 1].distance = distA;
						break;
					case (distB > oldDist && distB > distA):
						result[result.length - 1].pointA.x = splitedEndpoints[i][iterator2].x;
						result[result.length - 1].pointA.y = splitedEndpoints[i][iterator2].y;
						result[result.length - 1].distance = distB;
						break;
					default:
						break;
				}
			}
		}
	}
	return result;
};
onmessage = function(event) {
	var message = JSON.parse(event.data);
	if (!message.martixSkeletonImage || message.toRight === undefined || !message.pathRange) {
		_martix_ = null;
		postMessage(JSON.stringify({
			errMsg: 'lost Param'
		}));
		return;
	}

	_martix_ = message.martixSkeletonImage;
	/*
		var arrTrajectory = getTrajectory_2(findEndpoints({
			min: message.pathRange.minRange.min,
			max: message.pathRange.maxRange.max
		}));
	*/
	var arrTrajectory = findTrajectory(
		getTrajectory(
			findEndpoints({
				min: message.pathRange.minRange.min,
				max: message.pathRange.maxRange.max
			})));
	arrTrajectory.sort(function(a, b) {
		return (b.distance - a.distance);
	});
	var middleNum = arrTrajectory[Math.floor(arrTrajectory.length / 2)].distance;
	for (var i = arrTrajectory.length - 1; i >= 0; i--) {
		for (var j = arrTrajectory.length - 2; j >= 0; j--) {
			var tmpPrecent = (arrTrajectory[j].distance > middleNum) ?
				(middleNum / arrTrajectory[j].distance) : (arrTrajectory[j].distance / middleNum);
			if (tmpPrecent <= 0.1) arrTrajectory.splice(j, 1);
		}
	}

	if (message.toRight) {
		for (var i = 0; i < arrTrajectory.length; i++) {
			if (arrTrajectory[i].pointA.x > arrTrajectory[i].pointB.x) {
				var tmpX = arrTrajectory[i].pointA.x;
				var tmpY = arrTrajectory[i].pointA.y;
				arrTrajectory[i].pointA.x = arrTrajectory[i].pointB.x;
				arrTrajectory[i].pointA.y = arrTrajectory[i].pointB.y;
				arrTrajectory[i].pointB.x = tmpX;
				arrTrajectory[i].pointB.y = tmpY;
			}
		}
		arrTrajectory.sort(function(a, b) {
			return (a.pointA.x - b.pointA.x);
		});
	} else {
		for (var i = 0; i < arrTrajectory.length; i++) {
			if (arrTrajectory[i].pointA.x < arrTrajectory[i].pointB.x) {
				var tmpX = arrTrajectory[i].pointA.x;
				var tmpY = arrTrajectory[i].pointA.y;
				arrTrajectory[i].pointA.x = arrTrajectory[i].pointB.x;
				arrTrajectory[i].pointA.y = arrTrajectory[i].pointB.y;
				arrTrajectory[i].pointB.x = tmpX;
				arrTrajectory[i].pointB.y = tmpY;
			}
		}
		arrTrajectory.sort(function(a, b) {
			return (b.pointA.x - a.pointA.x);
		});
	}
	var result = {
		minPathRange: [],
		maxPathRange: []
	};
	for (var i = 0; i < arrTrajectory.length; i++) {
		if (arrTrajectory[i].pointA.y >= message.pathRange.minRange.min &&
			arrTrajectory[i].pointA.y <= message.pathRange.minRange.max) {
			result.minPathRange.push({
				x: arrTrajectory[i].pointA.x,
				y: arrTrajectory[i].pointA.y
			});
			result.minPathRange.push({
				x: arrTrajectory[i].pointB.x,
				y: arrTrajectory[i].pointB.y
			});
		}
		if (arrTrajectory[i].pointA.y >= message.pathRange.maxRange.min &&
			arrTrajectory[i].pointA.y <= message.pathRange.maxRange.max) {
			result.maxPathRange.push({
				x: arrTrajectory[i].pointA.x,
				y: arrTrajectory[i].pointA.y
			});
			result.maxPathRange.push({
				x: arrTrajectory[i].pointB.x,
				y: arrTrajectory[i].pointB.y
			});
		}
	}
	postMessage(JSON.stringify(result));
	_martix_ = null;
};