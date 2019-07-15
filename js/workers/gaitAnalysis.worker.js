'use strict';
//  p9 p2 p3  
//  p8 p1 p4  
//  p7 p6 p5  
var _thinImage = function(matrix, skeletonLimit) {
    if (!matrix || !matrix.length || !matrix[0].length) return matrix;
    var ite = (!skeletonLimit || isNaN(parseInt(skeletonLimit))) ? 0 : parseInt(skeletonLimit);
    var width = matrix.length;
    var height = matrix[0].length;
    var count = 0;
    while (true) {
        count++;
        if (ite && count > ite) break;
        var delMark = [];
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var p1 = matrix[i][j];
                if (p1 !== 1) continue;
                var p4 = (j === height - 1) ? 0 : matrix[i][j + 1];
                var p8 = (j === 0) ? 0 : matrix[i][j - 1];
                var p2 = (i === 0) ? 0 : matrix[i - 1][j];
                var p3 = (i === 0 || j === height - 1) ? 0 : matrix[i - 1][j + 1];
                var p9 = (i === 0 || j === 0) ? 0 : matrix[i - 1][j - 1];
                var p6 = (i === width - 1) ? 0 : matrix[i + 1][j];
                var p5 = (i === width - 1 || j === height - 1) ? 0 : matrix[i + 1][j + 1];
                var p7 = (i === width - 1 || j === 0) ? 0 : matrix[i + 1][j - 1];
                if ((p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) >= 2 && (p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) <= 6) {
                    var ap = 0;
                    if (p2 === 0 && p3 === 1) ++ap;
                    if (p3 === 0 && p4 === 1) ++ap;
                    if (p4 === 0 && p5 === 1) ++ap;
                    if (p5 === 0 && p6 === 1) ++ap;
                    if (p6 === 0 && p7 === 1) ++ap;
                    if (p7 === 0 && p8 === 1) ++ap;
                    if (p8 === 0 && p9 === 1) ++ap;
                    if (p9 === 0 && p2 === 1) ++ap;
                    if (ap === 1 && p2 * p4 * p6 === 0 && p4 * p6 * p8 === 0) delMark.push({
                        x: i,
                        y: j
                    });
                }
            }
        }
        if (delMark.length <= 0) break;
        else {
            for (var i = 0; i < delMark.length; i++) {
                matrix[delMark[i].x][delMark[i].y] = 0;
            }
        }
        delMark.length = 0;
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var p1 = matrix[i][j];
                if (p1 !== 1) continue;
                var p4 = (j === height - 1) ? 0 : matrix[i][j + 1];
                var p8 = (j === 0) ? 0 : matrix[i][j - 1];
                var p2 = (i === 0) ? 0 : matrix[i - 1][j];
                var p3 = (i === 0 || j === height - 1) ? 0 : matrix[i - 1][j + 1];
                var p9 = (i === 0 || j === 0) ? 0 : matrix[i - 1][j - 1];
                var p6 = (i === width - 1) ? 0 : matrix[i + 1][j];
                var p5 = (i === width - 1 || j === height - 1) ? 0 : matrix[i + 1][j + 1];
                var p7 = (i === width - 1 || j === 0) ? 0 : matrix[i + 1][j - 1];
                if ((p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) >= 2 && (p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) <= 6) {
                    var ap = 0;
                    if (p2 === 0 && p3 === 1) ++ap;
                    if (p3 === 0 && p4 === 1) ++ap;
                    if (p4 === 0 && p5 === 1) ++ap;
                    if (p5 === 0 && p6 === 1) ++ap;
                    if (p6 === 0 && p7 === 1) ++ap;
                    if (p7 === 0 && p8 === 1) ++ap;
                    if (p8 === 0 && p9 === 1) ++ap;
                    if (p9 === 0 && p2 === 1) ++ap;
                    if (ap === 1 && p2 * p4 * p8 === 0 && p2 * p6 * p8 === 0) delMark.push({
                        x: i,
                        y: j
                    });
                }
            }
        }
        if (delMark.length <= 0) break;
        else {
            for (var i = 0; i < delMark.length; i++) {
                matrix[delMark[i].x][delMark[i].y] = 0;
            }
        }
        delMark.length = 0;
    }
    return count;
};
//  p9 p2 p3  
//  p8 p1 p4  
//  p7 p6 p5 
var getAround = function(martix, i, j) {
    var width = martix.length;
    var height = martix[0].length;
    var result = {};
    result.p4 = (i === width - 1) ? ({
        value: 0,
        x: i + 1,
        y: j
    }) : ({
        value: martix[i + 1][j],
        x: i + 1,
        y: j
    });
    result.p8 = (i === 0) ? ({
        value: 0,
        x: i - 1,
        y: j
    }) : ({
        value: martix[i - 1][j],
        x: i - 1,
        y: j
    });
    result.p2 = (j === 0) ? ({
        value: 0,
        x: i,
        y: j - 1
    }) : ({
        value: martix[i][j - 1],
        x: i,
        y: j - 1
    });
    result.p3 = (i === width - 1 || j === 0) ? ({
        value: 0,
        x: i + 1,
        y: j - 1
    }) : ({
        value: martix[i + 1][j - 1],
        x: i + 1,
        y: j - 1
    });
    result.p9 = (i === 0 || j === 0) ? ({
        value: 0,
        x: i - 1,
        y: j - 1
    }) : ({
        value: martix[i - 1][j - 1],
        x: i - 1,
        y: j - 1
    });
    result.p6 = (j === height - 1) ? ({
        value: 0,
        x: i,
        y: j + 1
    }) : ({
        value: martix[i][j + 1],
        x: i,
        y: j + 1
    });
    result.p5 = (i === width - 1 || j === height - 1) ? ({
        value: 0,
        x: i + 1,
        y: j + 1
    }) : ({
        value: martix[i + 1][j + 1],
        x: i + 1,
        y: j + 1
    });
    result.p7 = (i === 0 || j === height - 1) ? ({
        value: 0,
        x: i - 1,
        y: j + 1
    }) : ({
        value: martix[i - 1][j + 1],
        x: i - 1,
        y: j + 1
    });
    result.cntAround = result.p4.value + result.p8.value + result.p2.value + result.p3.value + result.p9.value + result.p6.value + result.p5.value + result.p7.value;
    return result;
};
var findEndpoints = function(viewInfo) {
    var endpoints = [];
    for (var i = viewInfo.min; i <= viewInfo.max; i++) {
        for (var j = 0; j < viewInfo.martix[i].length; j++) {
            if (viewInfo.martix[i][j] === 0) continue;
            if ((getAround(viewInfo.martix, i, j)).cntAround === 1) {
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
var traceTrajectory = function(refResult, endPointRange, trajectoryPath, x, y, martix) {
    if (trajectoryPath[x + '-' + y]) return;
    trajectoryPath[x + '-' + y] = true;
    var around = getAround(martix, x, y);
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
    if (around.p4.value > 0 && !trajectoryPath[around.p4.x + '-' + around.p4.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p4.x, around.p4.y, martix);
    if (around.p8.value > 0 && !trajectoryPath[around.p8.x + '-' + around.p8.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p8.x, around.p8.y, martix);
    if (around.p2.value > 0 && !trajectoryPath[around.p2.x + '-' + around.p2.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p2.x, around.p2.y, martix);
    if (around.p3.value > 0 && !trajectoryPath[around.p3.x + '-' + around.p3.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p3.x, around.p3.y, martix);
    if (around.p9.value > 0 && !trajectoryPath[around.p9.x + '-' + around.p9.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p9.x, around.p9.y, martix);
    if (around.p6.value > 0 && !trajectoryPath[around.p6.x + '-' + around.p6.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p6.x, around.p6.y, martix);
    if (around.p5.value > 0 && !trajectoryPath[around.p5.x + '-' + around.p5.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p5.x, around.p5.y, martix);
    if (around.p7.value > 0 && !trajectoryPath[around.p7.x + '-' + around.p7.y]) traceTrajectory(refResult, endPointRange, trajectoryPath, around.p7.x, around.p7.y, martix);
};
var getTrajectory = function(endPointRange, martix) {
    var refResult = [];
    for (var i = 0; i < endPointRange.length; i++) {
        if (endPointRange[i].checked) continue;
        endPointRange[i].checked = true;
        var trajectoryPath = {};
        refResult.push([]);
        traceTrajectory(refResult, endPointRange, trajectoryPath, endPointRange[i].x, endPointRange[i].y, martix);
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
                },
                distance: getHypotenuse((splitedEndpoints[i][0].x - splitedEndpoints[i][1].x), (splitedEndpoints[i][0].y - splitedEndpoints[i][1].y))
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
                        (result[result.length - 1].pointA.x - result[result.length - 1].pointB.x), (result[result.length - 1].pointA.y - result[result.length - 1].pointB.y));
                    continue;
                }
                var oldDist = getHypotenuse(
                    (result[result.length - 1].pointA.x - result[result.length - 1].pointB.x), (result[result.length - 1].pointA.y - result[result.length - 1].pointB.y));
                var distA = getHypotenuse(
                    (result[result.length - 1].pointA.x - splitedEndpoints[i][iterator2].x), (result[result.length - 1].pointA.y - splitedEndpoints[i][iterator2].y));
                var distB = getHypotenuse(
                    (result[result.length - 1].pointB.x - splitedEndpoints[i][iterator2].x), (result[result.length - 1].pointB.y - splitedEndpoints[i][iterator2].y));
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
//playground, pathRange, minMiddleLine, maxMiddleLine, skelton..., minXPoint, maxXPoint, toRight
var getAnalysisReport = function(width, height, size, walkPath, trajectoryResult, minXPoint, maxXPoint, direction, physicalSize, yRange) {
    var ratio = {
        x: (physicalSize.x / width),
        y: (physicalSize.y / height)
    };
    var resultReport = {
        outerWidth: ((walkPath.maxLine - walkPath.minLine) * ratio.x).toFixed(2),
        innerWidth: ((walkPath.maxMiddleLine - walkPath.minMiddleLine) * ratio.x).toFixed(2)
    };
    if (direction > 0) {
        if (minXPoint.x > walkPath.minLine && minXPoint.x < walkPath.minMiddleLine) resultReport.inStep = 'left';
        else resultReport.inStep = 'right';
        if (maxXPoint.x > walkPath.maxMiddleLine && maxXPoint.x < walkPath.maxLine) resultReport.outStep = 'right';
        else resultReport.outStep = 'left';
    } else {
        if (maxXPoint.x > walkPath.maxMiddleLine && maxXPoint.x < walkPath.maxLine) resultReport.inStep = 'left';
        else resultReport.inStep = 'right';
        if (minXPoint.x > walkPath.minLine && minXPoint.x < walkPath.minMiddleLine) resultReport.outStep = 'right';
        else resultReport.outStep = 'left';
    }
    resultReport.stepProcess = [];
    var countStepLength = 0;
    var objLeft = {
        length: 0,
        cnt: 0,
        angle: 0,
        cntAngle: 0,
        maxAngle: -90,
        minAngle: 90,
        angleList: []
    };
    var objRight = {
        length: 0,
        cnt: 0,
        angle: 0,
        cntAngle: 0,
        maxAngle: -90,
        minAngle: 90,
        angleList: []
    };
    //console.log(trajectoryResult);
    var checkPathRange = null;
    if (resultReport.inStep === 'left') {
        var cycIdx = 0;
        if (direction > 0) checkPathRange = ['minPathRange', 'maxPathRange'];
        else checkPathRange = ['maxPathRange', 'minPathRange'];
        for (cycIdx = 0; cycIdx < Math.min(trajectoryResult.minPathRange.length, trajectoryResult.maxPathRange.length) - 1; cycIdx += 2) {
            var thisStep = {};
            thisStep.from = {
                x: trajectoryResult[checkPathRange[0]][cycIdx].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx].y
            };
            thisStep.to = {
                x: trajectoryResult[checkPathRange[0]][cycIdx + 1].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx + 1].y
            };
            if (thisStep.from.y !== thisStep.to.y) {
                if (!resultReport.stepProcess.length) thisStep.stepLength = 0;
                else {
                    var currentStepLength = Math.abs((thisStep.from.y - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.y) * ratio.y); // - (_statData.workingScope.deviation * ratio.y);
                    countStepLength += currentStepLength;
                    thisStep.stepLength = currentStepLength.toFixed(2);
                    objLeft.length += currentStepLength;
                    objLeft.cnt++;
                }
                thisStep.angle = Math.atan(Math.abs(thisStep.to.x - thisStep.from.x) / Math.abs(thisStep.to.y - thisStep.from.y)) * 180 / Math.PI;
                if (thisStep.to.x > thisStep.from.x) thisStep.angle = -thisStep.angle;
                if (direction < 0) thisStep.angle = -thisStep.angle;
                objLeft.angle += thisStep.angle;
                objLeft.angleList.push(thisStep.angle);
                objLeft.cntAngle++;
                objLeft.maxAngle = Math.max(objLeft.maxAngle, thisStep.angle);
                objLeft.minAngle = Math.min(objLeft.minAngle, thisStep.angle);
                resultReport.stepProcess.push(thisStep);
            }
            var nextStep = {};
            nextStep.from = {
                x: trajectoryResult[checkPathRange[1]][cycIdx].x,
                y: trajectoryResult[checkPathRange[1]][cycIdx].y
            };
            nextStep.to = {
                x: trajectoryResult[checkPathRange[1]][cycIdx + 1].x,
                y: trajectoryResult[checkPathRange[1]][cycIdx + 1].y
            };
            if (nextStep.from.y !== nextStep.to.y) {
                var currentStepLength2 = Math.abs((nextStep.from.y - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.y) * ratio.y); // - (_statData.workingScope.deviation * ratio.x);
                countStepLength += currentStepLength2;
                nextStep.stepLength = currentStepLength2.toFixed(2);
                objRight.length += currentStepLength2;
                objRight.cnt++;
                nextStep.angle = Math.atan(Math.abs(nextStep.to.x - nextStep.from.x) / Math.abs(nextStep.to.y - nextStep.from.y)) * 180 / Math.PI;
                if (nextStep.to.x < nextStep.from.x) nextStep.angle = -nextStep.angle;
                if (direction < 0) nextStep.angle = -nextStep.angle;
                objRight.angle += nextStep.angle;
                objRight.angleList.push(nextStep.angle);
                objRight.cntAngle++;
                objRight.maxAngle = Math.max(objRight.maxAngle, nextStep.angle);
                objRight.minAngle = Math.min(objRight.minAngle, nextStep.angle);
                resultReport.stepProcess.push(nextStep);
            }
        }
        if (resultReport.inStep === resultReport.outStep && trajectoryResult[checkPathRange[0]].length > (cycIdx + 1)) {
            var finalStep = {};
            finalStep.from = {
                x: trajectoryResult[checkPathRange[0]][cycIdx].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx].y
            };
            finalStep.to = {
                x: trajectoryResult[checkPathRange[0]][cycIdx + 1].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx + 1].y
            };
            if (finalStep.from.y !== finalStep.to.y) {
                if (!resultReport.stepProcess.length) finalStep.stepLength = 0;
                else {
                    var currentStepLength = Math.abs((finalStep.from.y - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.y) * ratio.y); // - (_statData.workingScope.deviation * ratio.x);
                    countStepLength += currentStepLength;
                    finalStep.stepLength = currentStepLength.toFixed(2);
                    objLeft.length += currentStepLength;
                    objLeft.cnt++;
                }
                finalStep.angle = Math.atan(Math.abs(finalStep.to.x - finalStep.from.x) / Math.abs(finalStep.to.y - finalStep.from.y)) * 180 / Math.PI;
                if (finalStep.to.x > finalStep.from.x) finalStep.angle = -finalStep.angle;
                if (direction < 0) finalStep.angle = -finalStep.angle;
                objLeft.angle += finalStep.angle;
                objLeft.angleList.push(finalStep.angle);
                objLeft.cntAngle++;
                objLeft.maxAngle = Math.max(objLeft.maxAngle, finalStep.angle);
                objLeft.minAngle = Math.min(objLeft.minAngle, finalStep.angle);
                resultReport.stepProcess.push(finalStep);
            }
        }
    } else {
        var cycIdx = 0;
        if (direction > 0) checkPathRange = ['maxPathRange', 'minPathRange'];
        else checkPathRange = ['minPathRange', 'maxPathRange'];
        for (cycIdx = 0; cycIdx < Math.min(trajectoryResult.minPathRange.length, trajectoryResult.maxPathRange.length) - 1; cycIdx += 2) {
            var thisStep = {};
            thisStep.from = {
                x: trajectoryResult[checkPathRange[0]][cycIdx].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx].y
            };
            thisStep.to = {
                x: trajectoryResult[checkPathRange[0]][cycIdx + 1].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx + 1].y
            };
            if (thisStep.from.y !== thisStep.to.y) {
                if (!resultReport.stepProcess.length) thisStep.stepLength = 0;
                else {
                    var currentStepLength = Math.abs((thisStep.from.y - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.y) * ratio.y); // - (_statData.workingScope.deviation * ratio.x);
                    countStepLength += currentStepLength;
                    thisStep.stepLength = currentStepLength.toFixed(2);
                    objRight.length += currentStepLength;
                    objRight.cnt++;
                }
                thisStep.angle = Math.atan(Math.abs(thisStep.to.x - thisStep.from.x) / Math.abs(thisStep.to.y - thisStep.from.y)) * 180 / Math.PI;
                if (thisStep.to.x < thisStep.from.x) thisStep.angle = -thisStep.angle;
                if (direction < 0) thisStep.angle = -thisStep.angle;
                objRight.angle += thisStep.angle;
                objRight.angleList.push(thisStep.angle);
                objRight.cntAngle++;
                objRight.maxAngle = Math.max(objRight.maxAngle, thisStep.angle);
                objRight.minAngle = Math.min(objRight.minAngle, thisStep.angle);
                resultReport.stepProcess.push(thisStep);
            }
            var nextStep = {};
            nextStep.from = {
                x: trajectoryResult[checkPathRange[1]][cycIdx].x,
                y: trajectoryResult[checkPathRange[1]][cycIdx].y
            };
            nextStep.to = {
                x: trajectoryResult[checkPathRange[1]][cycIdx + 1].x,
                y: trajectoryResult[checkPathRange[1]][cycIdx + 1].y
            };
            if (nextStep.from.x !== nextStep.to.x) {
                var currentStepLength2 = Math.abs((nextStep.from.y - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.y) * ratio.y); // - (_statData.workingScope.deviation * ratio.x);
                countStepLength += currentStepLength2;
                nextStep.stepLength = currentStepLength2.toFixed(2);
                objLeft.length += currentStepLength2;
                objLeft.cnt++;
                nextStep.angle = Math.atan(Math.abs(nextStep.to.x - nextStep.from.x) / Math.abs(nextStep.to.y - nextStep.from.y)) * 180 / Math.PI;
                if (nextStep.to.x > nextStep.from.x) nextStep.angle = -nextStep.angle;
                if (direction < 0) nextStep.angle = -nextStep.angle;
                objLeft.angle += nextStep.angle;
                objLeft.angleList.push(nextStep.angle);
                objLeft.cntAngle++;
                objLeft.maxAngle = Math.max(objLeft.maxAngle, nextStep.angle);
                objLeft.minAngle = Math.min(objLeft.minAngle, nextStep.angle);
                resultReport.stepProcess.push(nextStep);
            }
        }
        if (resultReport.inStep === resultReport.outStep && trajectoryResult[checkPathRange[0]].length > (cycIdx + 1)) {
            var finalStep = {};
            finalStep.from = {
                x: trajectoryResult[checkPathRange[0]][cycIdx].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx].y
            };
            finalStep.to = {
                x: trajectoryResult[checkPathRange[0]][cycIdx + 1].x,
                y: trajectoryResult[checkPathRange[0]][cycIdx + 1].y
            };
            if (finalStep.from.x !== finalStep.to.x) {
                if (!resultReport.stepProcess.length) finalStep.stepLength = 0;
                else {
                    var currentStepLength = Math.abs((finalStep.from.y - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.y) * ratio.y); // - (_statData.workingScope.deviation * ratio.x);
                    countStepLength += currentStepLength;
                    finalStep.stepLength = currentStepLength.toFixed(2);
                    objRight.length += currentStepLength;
                    objRight.cnt++;
                }
                finalStep.angle = Math.atan(Math.abs(finalStep.to.x - finalStep.from.x) / Math.abs(finalStep.to.y - finalStep.from.y)) * 180 / Math.PI;
                if (finalStep.to.x < finalStep.from.x) finalStep.angle = -finalStep.angle;
                if (direction < 0) finalStep.angle = -finalStep.angle;
                objRight.angle += finalStep.angle;
                objRight.angleList.push(finalStep.angle);
                objRight.cntAngle++;
                objRight.maxAngle = Math.max(objRight.maxAngle, finalStep.angle);
                objRight.minAngle = Math.min(objRight.minAngle, finalStep.angle);
                resultReport.stepProcess.push(finalStep);
            }
        }
    }
    //console.log(objLeft);
    //console.log(objRight);
    resultReport.stepCount = resultReport.stepProcess.length;
    resultReport.samplingDist = Math.abs((yRange.max - yRange.min) * ratio.y);
    //resultReport.avgStepLength = (countStepLength / (resultReport.stepCount - 1));
    resultReport.avgLeftStepLength = objLeft.length / objLeft.cnt;
    resultReport.avgLeftAngle = objLeft.angle / objLeft.cntAngle;
    resultReport.minLeftAngle = objLeft.minAngle;
    resultReport.maxLeftAngle = objLeft.maxAngle;
    var tmp = 0;
    if (objLeft.angleList.length) {
        for (var i = 0; i < objLeft.angleList.length; i++) {
            tmp += Math.pow((objLeft.angleList[i] - resultReport.avgLeftAngle), 2);
        }
        resultReport.varianceLeftAngle = tmp / objLeft.angleList.length;
    } else resultReport.varianceLeftAngle = -1;
    resultReport.avgRightStepLength = objRight.length / objRight.cnt;
    resultReport.avgRightAngle = objRight.angle / objRight.cntAngle;
    resultReport.minRightAngle = objRight.minAngle;
    resultReport.maxRightAngle = objRight.maxAngle;
    tmp = 0;
    if (objRight.angleList.length) {
        for (var i = 0; i < objRight.angleList.length; i++) {
            tmp += Math.pow((objRight.angleList[i] - resultReport.avgRightAngle), 2);
        }
        resultReport.varianceRightAngle = tmp / objRight.angleList.length;
    } else resultReport.varianceRightAngle = -1;
    resultReport.avgStepLength = (objLeft.length / objLeft.cnt) + (objRight.length / objRight.cnt);
    resultReport.stepLengthDeviation = Math.abs((objLeft.length / objLeft.cnt) - (objRight.length / objRight.cnt));
    resultReport.stepWidth = ((walkPath.minMiddleLine - walkPath.minLine) / 2 + (walkPath.maxLine - walkPath.maxMiddleLine) / 2 + (walkPath.maxMiddleLine - walkPath.minMiddleLine)) * ratio.x;
    console.log(resultReport);
    return resultReport;
};
/*
*Message:
id
size
    x
    y
    physicalSize
    x
    y
startTimestamp
finishedTimestamp
canvasData
    timestamp
    binaryImage
*/
onmessage = function(event) {
    var message = JSON.parse(event.data);
    if (!message.startTimestamp || !message.finishedTimestamp || !message.canvasData || !message.canvasData.length || !message.id) return;
    //message.size
    var analysisData = {
        id: message.id
    };
    //Merge binary image
    analysisData.binaryImage = JSON.parse(JSON.stringify(message.canvasData[0].binaryImage));
    analysisData.startTimestamp = Math.max(message.startTimestamp, message.canvasData[0].timestamp);
    analysisData.finishedTimestamp = Math.min(message.finishedTimestamp, message.canvasData[message.canvasData.length - 1].timestamp);
    for (var i = 1; i < message.canvasData.length; i++) {
        analysisData.startTimestamp = Math.min(analysisData.startTimestamp, message.canvasData[i].timestamp);
        analysisData.finishedTimestamp = Math.max(analysisData.finishedTimestamp, message.canvasData[i].timestamp);
        for (var x = 0; x < analysisData.binaryImage.length; x++) {
            for (var y = 0; y < analysisData.binaryImage[x].length; y++) {
                analysisData.binaryImage[x][y] = analysisData.binaryImage[x][y] || message.canvasData[i].binaryImage[x][y];
            }
        }
    }
    /*For unsorted array(may no need)
    message.canvasData.sort(function(a, b) {
        return a.timestamp - b.timestamp;
    });
    */
    if (analysisData.binaryImage) {
        //Get skeleton
        analysisData.skeleton = JSON.parse(JSON.stringify(analysisData.binaryImage));
        analysisData.skeletonTimes = _thinImage(analysisData.skeleton, 0);
        //Get walk path range
        analysisData.walkPath = {
            minLine: analysisData.binaryImage.length,
            maxLine: 0
        };
        analysisData.yRange = {
            min: analysisData.binaryImage.length,
            max: 0
        };
        for (var i = 0; i < analysisData.binaryImage.length; i++) {
            for (var j = 0; j < analysisData.binaryImage[i].length; j++) {
                if (analysisData.binaryImage[i][j] > 0) {
                    analysisData.walkPath.minLine = Math.min(analysisData.walkPath.minLine, i);
                    analysisData.walkPath.maxLine = Math.max(analysisData.walkPath.maxLine, i);
                    analysisData.yRange.min = Math.min(analysisData.yRange.min, j);
                    analysisData.yRange.max = Math.max(analysisData.yRange.max, j);
                }
            }
        }
        //Get parts walk path range
        analysisData.walkPath.middleLine = analysisData.walkPath.minLine + (analysisData.walkPath.maxLine - analysisData.walkPath.minLine) / 2;
        analysisData.walkPath.minMiddleLine = Math.floor(analysisData.walkPath.middleLine);
        analysisData.walkPath.maxMiddleLine = Math.ceil(analysisData.walkPath.middleLine);
        var hitFlg = false;
        for (var i = Math.floor(analysisData.walkPath.middleLine); i >= analysisData.walkPath.minLine; i--) {
            if (hitFlg) break;
            for (var j = 0; j < analysisData.binaryImage[i].length; j++) {
                if (analysisData.binaryImage[i][j] > 0) {
                    analysisData.walkPath.minMiddleLine = i;
                    hitFlg = true;
                    break;
                }
            }
        }
        hitFlg = false;
        for (var i = Math.ceil(analysisData.walkPath.middleLine); i <= analysisData.walkPath.maxLine; i++) {
            if (hitFlg) break;
            for (var j = 0; j < analysisData.binaryImage[i].length; j++) {
                if (analysisData.binaryImage[i][j] > 0) {
                    analysisData.walkPath.maxMiddleLine = i;
                    hitFlg = true;
                    break;
                }
            }
        }
        //Get direction of movement
        var qrtLength = Math.ceil(message.canvasData.length / 4);
        var min = 0;
        var max = 0;
        for (var k = 0; k < qrtLength; k++) {
            for (var i = 0; i < message.canvasData[k].binaryImage.length; i++) {
                var tmpRange = message.canvasData[k].binaryImage[i].length;
                for (var j = 0; j < tmpRange; j++) {
                    if (message.canvasData[k].binaryImage[i][j] > 0) {
                        if (j <= tmpRange / 2) min++;
                        else max++;
                    }
                }
            }
        }
        analysisData.direction = min - max;
        try {
            var arrTrajectory = findTrajectory(getTrajectory(findEndpoints({
                martix: analysisData.skeleton,
                min: analysisData.walkPath.minLine,
                max: analysisData.walkPath.maxLine
            }), analysisData.skeleton));
            //var tmpArr = JSON.parse(JSON.stringify(arrTrajectory));
            arrTrajectory.sort(function(a, b) {
                return (b.distance - a.distance);
            });
            var middleNum = arrTrajectory[Math.floor(arrTrajectory.length / 2)].distance;
            for (var i = arrTrajectory.length - 1; i >= 0; i--) {
                for (var j = arrTrajectory.length - 2; j >= 0; j--) {
                    var tmpPrecent = (arrTrajectory[j].distance > middleNum) ? (middleNum / arrTrajectory[j].distance) : (arrTrajectory[j].distance / middleNum);
                    if (tmpPrecent <= 0.3) {
                        arrTrajectory.splice(j, 1);
                        console.log('tmpPrecent=' + tmpPrecent);
                    }
                }
            }
            if (analysisData.direction > 0) {
                for (var i = 0; i < arrTrajectory.length; i++) {
                    if (arrTrajectory[i].pointA.y > arrTrajectory[i].pointB.y) {
                        var tmpX = arrTrajectory[i].pointA.x;
                        var tmpY = arrTrajectory[i].pointA.y;
                        arrTrajectory[i].pointA.x = arrTrajectory[i].pointB.x;
                        arrTrajectory[i].pointA.y = arrTrajectory[i].pointB.y;
                        arrTrajectory[i].pointB.x = tmpX;
                        arrTrajectory[i].pointB.y = tmpY;
                    }
                }
                arrTrajectory.sort(function(a, b) {
                    return (a.pointA.y - b.pointA.y);
                });
            } else {
                for (var i = 0; i < arrTrajectory.length; i++) {
                    if (arrTrajectory[i].pointA.y < arrTrajectory[i].pointB.y) {
                        var tmpX = arrTrajectory[i].pointA.x;
                        var tmpY = arrTrajectory[i].pointA.y;
                        arrTrajectory[i].pointA.x = arrTrajectory[i].pointB.x;
                        arrTrajectory[i].pointA.y = arrTrajectory[i].pointB.y;
                        arrTrajectory[i].pointB.x = tmpX;
                        arrTrajectory[i].pointB.y = tmpY;
                    }
                }
                arrTrajectory.sort(function(a, b) {
                    return (b.pointA.y - a.pointA.y);
                });
            }
            analysisData.trajectoryResult = {
                minPathRange: [],
                maxPathRange: []
            };
            for (var i = 0; i < arrTrajectory.length; i++) {
                if (arrTrajectory[i].pointA.x >= analysisData.walkPath.minLine && arrTrajectory[i].pointA.x <= analysisData.walkPath.minMiddleLine) {
                    analysisData.trajectoryResult.minPathRange.push({
                        x: arrTrajectory[i].pointA.x,
                        y: arrTrajectory[i].pointA.y
                    });
                    analysisData.trajectoryResult.minPathRange.push({
                        x: arrTrajectory[i].pointB.x,
                        y: arrTrajectory[i].pointB.y
                    });
                }
                if (arrTrajectory[i].pointA.x >= analysisData.walkPath.maxMiddleLine && arrTrajectory[i].pointA.x <= analysisData.walkPath.maxLine) {
                    analysisData.trajectoryResult.maxPathRange.push({
                        x: arrTrajectory[i].pointA.x,
                        y: arrTrajectory[i].pointA.y
                    });
                    analysisData.trajectoryResult.maxPathRange.push({
                        x: arrTrajectory[i].pointB.x,
                        y: arrTrajectory[i].pointB.y
                    });
                }
            }
            if (analysisData.direction > 0) {
                analysisData.trajectoryResult.minPathRange.sort(function(a, b) {
                    return (a.y - b.y);
                });
                analysisData.trajectoryResult.maxPathRange.sort(function(a, b) {
                    return (a.y - b.y);
                });
            } else {
                analysisData.trajectoryResult.minPathRange.sort(function(a, b) {
                    return (b.y - a.y);
                });
                analysisData.trajectoryResult.maxPathRange.sort(function(a, b) {
                    return (b.y - a.y);
                });
            }
            var minXPoint = {
                x: analysisData.binaryImage.length,
                y: analysisData.binaryImage[0].length
            };
            var maxXPoint = {
                x: 0,
                y: 0
            };
            for (var i = 0; i < analysisData.trajectoryResult.minPathRange.length - 1; i += 2) {
                if (minXPoint.y > analysisData.trajectoryResult.minPathRange[i].y) {
                    minXPoint.x = analysisData.trajectoryResult.minPathRange[i].x;
                    minXPoint.y = analysisData.trajectoryResult.minPathRange[i].y;
                }
                if (maxXPoint.y < analysisData.trajectoryResult.minPathRange[i].y) {
                    maxXPoint.x = analysisData.trajectoryResult.minPathRange[i].x;
                    maxXPoint.y = analysisData.trajectoryResult.minPathRange[i].y;
                }
            }
            for (var i = 0; i < analysisData.trajectoryResult.maxPathRange.length - 1; i += 2) {
                if (minXPoint.y > analysisData.trajectoryResult.maxPathRange[i].y) {
                    minXPoint.x = analysisData.trajectoryResult.maxPathRange[i].x;
                    minXPoint.y = analysisData.trajectoryResult.maxPathRange[i].y;
                }
                if (maxXPoint.y < analysisData.trajectoryResult.maxPathRange[i].y) {
                    maxXPoint.x = analysisData.trajectoryResult.maxPathRange[i].x;
                    maxXPoint.y = analysisData.trajectoryResult.maxPathRange[i].y;
                }
            }
            if (analysisData.trajectoryResult.minPathRange.length > 0 && minXPoint.y > analysisData.trajectoryResult.minPathRange[analysisData.trajectoryResult.minPathRange.length - 1].y) {
                minXPoint.x = analysisData.trajectoryResult.minPathRange[analysisData.trajectoryResult.minPathRange.length - 1].x;
                minXPoint.y = analysisData.trajectoryResult.minPathRange[analysisData.trajectoryResult.minPathRange.length - 1].y;
            }
            if (analysisData.trajectoryResult.minPathRange.length > 0 && maxXPoint.y < analysisData.trajectoryResult.minPathRange[analysisData.trajectoryResult.minPathRange.length - 1].y) {
                maxXPoint.x = analysisData.trajectoryResult.minPathRange[analysisData.trajectoryResult.minPathRange.length - 1].x;
                maxXPoint.y = analysisData.trajectoryResult.minPathRange[analysisData.trajectoryResult.minPathRange.length - 1].y;
            }
            if (analysisData.trajectoryResult.maxPathRange.length > 0 && minXPoint.y > analysisData.trajectoryResult.maxPathRange[analysisData.trajectoryResult.maxPathRange.length - 1].y) {
                minXPoint.x = analysisData.trajectoryResult.maxPathRange[analysisData.trajectoryResult.maxPathRange.length - 1].x;
                minXPoint.y = analysisData.trajectoryResult.maxPathRange[analysisData.trajectoryResult.maxPathRange.length - 1].y;
            }
            if (analysisData.trajectoryResult.maxPathRange.length > 0 && maxXPoint.y < analysisData.trajectoryResult.maxPathRange[analysisData.trajectoryResult.maxPathRange.length - 1].y) {
                maxXPoint.x = analysisData.trajectoryResult.maxPathRange[analysisData.trajectoryResult.maxPathRange.length - 1].x;
                maxXPoint.y = analysisData.trajectoryResult.maxPathRange[analysisData.trajectoryResult.maxPathRange.length - 1].y;
            }
            analysisData.report = getAnalysisReport(analysisData.binaryImage.length, analysisData.binaryImage[0].length, message.size, analysisData.walkPath, analysisData.trajectoryResult, minXPoint, maxXPoint, analysisData.direction, message.physicalSize, analysisData.yRange);
            //-------------------------------Break Point----------------------------------------
            analysisData.binaryImage = null;
            analysisData.skeleton = null;
            postMessage(JSON.stringify(analysisData));
        } catch (e) {
            postMessage(JSON.stringify({
                id: message.id,
                errMsg: 'Trajectory error:' + e.message
            }));
        }
    } else {
        postMessage(JSON.stringify({
            id: message.id,
            errMsg: 'lost binary image'
        }));
    }
};
/*
*analysisData:
id
startTimestamp
finishedTimestamp
binaryImage
skeleton
skeletonTimes
walkPath
    minLine
    maxLine
    middleLine
    minMiddleLine
    maxMiddleLine
direction           //<0: max to min; >0: min to max; =0: unknown
trajectoryResult
report
*/