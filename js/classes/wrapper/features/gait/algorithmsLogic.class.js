;
(function(name, context, factory) {
    // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("algorithmsLogic", this, function() {
    'use strict';
    var skeletonWorker = null;
    var stepCollectionWorker = null;
    var drawArrow = function(ctx, cavList, width) {
        var qrtLength = Math.ceil(cavList.length / 4);
        var left = 0;
        var right = 0;
        for (var k = 0; k < qrtLength; k++) {
            var thisStepData = cavList[k].imgData;
            var thisInner = [];
            var row = [];
            for (var i = 0; i < thisStepData.length; i += 4) {
                if (thisStepData[i + 3] > 128) {
                    row.push(1);
                } else {
                    row.push(0);
                }
                if (row.length === width) {
                    thisInner.push(row.slice(0));
                    row.length = 0;
                }
            }
            for (var i = 0; i < thisInner.length; i++) {
                for (var j = 0; j < thisInner[i].length; j++) {
                    if (thisInner[i][j] > 0) {
                        if (j <= (width / 2)) left++;
                        else right++;
                    }
                }
            }
        }
        var toRight = (left > right);
        var arrowLeftX = Math.floor(width / 2) - 10;
        var arrowRightX = Math.floor(width / 2) + 10;
        var arrowY = Math.floor(8 * Math.tan(30 * Math.PI / 180));
        var arrowLineY = arrowY + 10;

        ctx.strokeStyle = "rgba(255,0,0,0.8)";
        ctx.beginPath();
        ctx.moveTo(arrowLeftX, arrowLineY);
        ctx.lineTo(arrowRightX, arrowLineY);
        if (toRight) {
            ctx.moveTo(arrowRightX, arrowLineY);
            ctx.lineTo(arrowRightX - 8, arrowLineY - arrowY);
            ctx.moveTo(arrowRightX, arrowLineY);
            ctx.lineTo(arrowRightX - 8, arrowLineY + arrowY);
        } else {
            ctx.moveTo(arrowLeftX, arrowLineY);
            ctx.lineTo(arrowLeftX + 8, arrowLineY - arrowY);
            ctx.moveTo(arrowLeftX, arrowLineY);
            ctx.lineTo(arrowLeftX + 8, arrowLineY + arrowY);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.save();
        return toRight;
    };
    var getAnalysisReport = function(playground, pathRange, minMiddleLine, maxMiddleLine, stepSkeletonFlg, minXPoint, maxXPoint, toRight) {
        var productSize = sharingDataSet._get('productSize');
        //Test Code
        if (!productSize) productSize = {
            x: 32,
            y: 80
        };
        if (!productSize) return;
        var ratio = {
            x: productSize.x / playground.height,
            y: productSize.y / playground.width
        };
        var resultReport = {
            outerWidth: ((pathRange.max - pathRange.min) * ratio.y).toFixed(2),
            innerWidth: ((maxMiddleLine - minMiddleLine) * ratio.y).toFixed(2)
        };
        if (toRight) {
            if (minXPoint.y > pathRange.min && minXPoint.y < minMiddleLine)
                resultReport.inStep = 'left';
            else resultReport.inStep = 'right';

            if (maxXPoint.y > maxMiddleLine && maxXPoint.y < pathRange.max)
                resultReport.outStep = 'right';
            else resultReport.outStep = 'left';
        } else {
            if (maxXPoint.y > maxMiddleLine && maxXPoint.y < pathRange.max)
                resultReport.inStep = 'right';
            else resultReport.inStep = 'left';

            if (minXPoint.y > pathRange.min && minXPoint.y < minMiddleLine)
                resultReport.outStep = 'left';
            else resultReport.outStep = 'right';
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
        if (resultReport.inStep === 'left') {
            var cycIdx = 0;
            for (cycIdx = 0; cycIdx < Math.min(stepSkeletonFlg.minPathRange.length, stepSkeletonFlg.maxPathRange.length) - 1; cycIdx += 2) {
                var thisStep = {};
                thisStep.from = {
                    x: stepSkeletonFlg.minPathRange[cycIdx].x,
                    y: stepSkeletonFlg.minPathRange[cycIdx].y
                };
                thisStep.to = {
                    x: stepSkeletonFlg.minPathRange[cycIdx + 1].x,
                    y: stepSkeletonFlg.minPathRange[cycIdx + 1].y
                };
                if (thisStep.from.x !== thisStep.to.x) {
                    if (!resultReport.stepProcess.length) thisStep.stepLength = 0;
                    else {
                        var currentStepLength = Math.abs((thisStep.from.x - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.x) * ratio.x); // - (_statData.workingScope.deviation * ratio.x);
                        countStepLength += currentStepLength;
                        thisStep.stepLength = currentStepLength.toFixed(2);
                        objLeft.length += currentStepLength;
                        objLeft.cnt++;
                    }
                    thisStep.angle = Math.atan(Math.abs(thisStep.to.y - thisStep.from.y) / Math.abs(thisStep.to.x - thisStep.from.x)) * 180 / Math.PI;
                    if (thisStep.to.y > thisStep.from.y) thisStep.angle = -thisStep.angle;
                    objLeft.angle += thisStep.angle;
                    objLeft.angleList.push(thisStep.angle);
                    objLeft.cntAngle++;
                    objLeft.maxAngle = Math.max(objLeft.maxAngle, thisStep.angle);
                    objLeft.minAngle = Math.min(objLeft.minAngle, thisStep.angle);
                    resultReport.stepProcess.push(thisStep);
                }
                var nextStep = {};
                nextStep.from = {
                    x: stepSkeletonFlg.maxPathRange[cycIdx].x,
                    y: stepSkeletonFlg.maxPathRange[cycIdx].y
                };
                nextStep.to = {
                    x: stepSkeletonFlg.maxPathRange[cycIdx + 1].x,
                    y: stepSkeletonFlg.maxPathRange[cycIdx + 1].y
                };
                if (nextStep.from.x !== nextStep.to.x) {
                    var currentStepLength2 = Math.abs((nextStep.from.x - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.x) * ratio.x); // - (_statData.workingScope.deviation * ratio.x);
                    countStepLength += currentStepLength2;
                    nextStep.stepLength = currentStepLength2.toFixed(2);
                    objRight.length += currentStepLength2;
                    objRight.cnt++;
                    nextStep.angle = Math.atan(Math.abs(nextStep.to.y - nextStep.from.y) / Math.abs(nextStep.to.x - nextStep.from.x)) * 180 / Math.PI;
                    if (nextStep.to.y < nextStep.from.y) nextStep.angle = -nextStep.angle;
                    objRight.angle += nextStep.angle;
                    objRight.angleList.push(nextStep.angle);
                    objRight.cntAngle++;
                    objRight.maxAngle = Math.max(objRight.maxAngle, nextStep.angle);
                    objRight.minAngle = Math.min(objRight.minAngle, nextStep.angle);
                    resultReport.stepProcess.push(nextStep);
                }
            }
            if (resultReport.inStep === resultReport.outStep && stepSkeletonFlg.minPathRange.length > (cycIdx + 1)) {
                var finalStep = {};
                finalStep.from = {
                    x: stepSkeletonFlg.minPathRange[cycIdx].x,
                    y: stepSkeletonFlg.minPathRange[cycIdx].y
                };
                finalStep.to = {
                    x: stepSkeletonFlg.minPathRange[cycIdx + 1].x,
                    y: stepSkeletonFlg.minPathRange[cycIdx + 1].y
                };
                if (finalStep.from.x !== finalStep.to.x) {
                    if (!resultReport.stepProcess.length) finalStep.stepLength = 0;
                    else {
                        var currentStepLength = Math.abs((finalStep.from.x - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.x) * ratio.x); // - (_statData.workingScope.deviation * ratio.x);
                        countStepLength += currentStepLength;
                        finalStep.stepLength = currentStepLength.toFixed(2);
                        objLeft.length += currentStepLength;
                        objLeft.cnt++;
                    }
                    finalStep.angle = Math.atan(Math.abs(finalStep.to.y - finalStep.from.y) / Math.abs(finalStep.to.x - finalStep.from.x)) * 180 / Math.PI;
                    if (finalStep.to.y > finalStep.from.y) finalStep.angle = -finalStep.angle;
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
            for (cycIdx = 0; cycIdx < Math.min(stepSkeletonFlg.minPathRange.length, stepSkeletonFlg.maxPathRange.length) - 1; cycIdx += 2) {
                var thisStep = {};
                thisStep.from = {
                    x: stepSkeletonFlg.maxPathRange[cycIdx].x,
                    y: stepSkeletonFlg.maxPathRange[cycIdx].y
                };
                thisStep.to = {
                    x: stepSkeletonFlg.maxPathRange[cycIdx + 1].x,
                    y: stepSkeletonFlg.maxPathRange[cycIdx + 1].y
                };
                if (thisStep.from.x !== thisStep.to.x) {
                    if (!resultReport.stepProcess.length) thisStep.stepLength = 0;
                    else {
                        var currentStepLength = Math.abs((thisStep.from.x - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.x) * ratio.x); // - (_statData.workingScope.deviation * ratio.x);
                        countStepLength += currentStepLength;
                        thisStep.stepLength = currentStepLength.toFixed(2);
                        objRight.length += currentStepLength;
                        objRight.cnt++;
                    }
                    thisStep.angle = Math.atan(Math.abs(thisStep.to.y - thisStep.from.y) / Math.abs(thisStep.to.x - thisStep.from.x)) * 180 / Math.PI;
                    if (thisStep.to.y < thisStep.from.y) thisStep.angle = -thisStep.angle;
                    objRight.angle += thisStep.angle;
                    objRight.angleList.push(thisStep.angle);
                    objRight.cntAngle++;
                    objRight.maxAngle = Math.max(objRight.maxAngle, thisStep.angle);
                    objRight.minAngle = Math.min(objRight.minAngle, thisStep.angle);
                    resultReport.stepProcess.push(thisStep);
                }
                var nextStep = {};
                nextStep.from = {
                    x: stepSkeletonFlg.minPathRange[cycIdx].x,
                    y: stepSkeletonFlg.minPathRange[cycIdx].y
                };
                nextStep.to = {
                    x: stepSkeletonFlg.minPathRange[cycIdx + 1].x,
                    y: stepSkeletonFlg.minPathRange[cycIdx + 1].y
                };
                if (nextStep.from.x !== nextStep.to.x) {
                    var currentStepLength2 = Math.abs((nextStep.from.x - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.x) * ratio.x); // - (_statData.workingScope.deviation * ratio.x);
                    countStepLength += currentStepLength2;
                    nextStep.stepLength = currentStepLength2.toFixed(2);
                    objLeft.length += currentStepLength2;
                    objLeft.cnt++;
                    nextStep.angle = Math.atan(Math.abs(nextStep.to.y - nextStep.from.y) / Math.abs(nextStep.to.x - nextStep.from.x)) * 180 / Math.PI;
                    if (nextStep.to.y > nextStep.from.y) nextStep.angle = -nextStep.angle;
                    objLeft.angle += nextStep.angle;
                    objLeft.angleList.push(nextStep.angle);
                    objLeft.cntAngle++;
                    objLeft.maxAngle = Math.max(objLeft.maxAngle, nextStep.angle);
                    objLeft.minAngle = Math.min(objLeft.minAngle, nextStep.angle);
                    resultReport.stepProcess.push(nextStep);
                }
            }
            if (resultReport.inStep === resultReport.outStep && stepSkeletonFlg.maxPathRange.length > (cycIdx + 1)) {
                var finalStep = {};
                finalStep.from = {
                    x: stepSkeletonFlg.maxPathRange[cycIdx].x,
                    y: stepSkeletonFlg.maxPathRange[cycIdx].y
                };
                finalStep.to = {
                    x: stepSkeletonFlg.maxPathRange[cycIdx + 1].x,
                    y: stepSkeletonFlg.maxPathRange[cycIdx + 1].y
                };
                if (finalStep.from.x !== finalStep.to.x) {
                    if (!resultReport.stepProcess.length) finalStep.stepLength = 0;
                    else {
                        var currentStepLength = Math.abs((finalStep.from.x - resultReport.stepProcess[resultReport.stepProcess.length - 1].from.x) * ratio.x); // - (_statData.workingScope.deviation * ratio.x);
                        countStepLength += currentStepLength;
                        finalStep.stepLength = currentStepLength.toFixed(2);
                        objRight.length += currentStepLength;
                        objRight.cnt++;
                    }
                    finalStep.angle = Math.atan(Math.abs(finalStep.to.y - finalStep.from.y) / Math.abs(finalStep.to.x - finalStep.from.x)) * 180 / Math.PI;
                    if (finalStep.to.y < finalStep.from.y) finalStep.angle = -finalStep.angle;
                    objRight.angle += finalStep.angle;
                    objRight.angleList.push(finalStep.angle);
                    objRight.cntAngle++;
                    objRight.maxAngle = Math.max(objRight.maxAngle, finalStep.angle);
                    objRight.minAngle = Math.min(objRight.minAngle, finalStep.angle);
                    resultReport.stepProcess.push(finalStep);
                }
            }
        }
        resultReport.stepCount = resultReport.stepProcess.length;
        resultReport.samplingDist = Math.abs((maxXPoint.x - minXPoint.x) * ratio.x);
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

        resultReport.stepWidth = ((minMiddleLine - pathRange.min) / 2 + (pathRange.max - maxMiddleLine) / 2 + (maxMiddleLine - minMiddleLine)) * ratio.y;

        return resultReport;
    };

    var showBinaryImage = function(cavList, playground) {
        var ctx = playground.getContext("2d");
        ctx.clearRect(0, 0, playground.width, playground.height);
        var ctxData = ctx.getImageData(0, 0, playground.width, playground.height);
        for (var j = 0; j < cavList.length; j++) {
            var tmpCtx = cavList[j].image.getContext("2d");
            var tmpCtxData = tmpCtx.getImageData(0, 0, cavList[j].image.width, cavList[j].image.height);
            for (var i = 0; i < tmpCtxData.data.length; i += 4) {
                if ((i + 3) < ctxData.data.length && tmpCtxData.data[i + 3] > 135 && ctxData.data[i + 3] <= 0) {
                    ctxData.data[i] = 0;
                    ctxData.data[i + 1] = 0;
                    ctxData.data[i + 2] = 0;
                    ctxData.data[i + 3] = 175;
                }
            }
        }
        ctx.putImageData(ctxData, 0, 0);
        return ctxData;
    };
    var getWalkingPath = function(playground, cavList) {
        var ctx = playground.getContext("2d");
        var imgData = ctx.getImageData(0, 0, playground.width, playground.height).data;
        var inner = [];
        var row = [];
        for (var i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] > 0) {
                row.push(1);
            } else {
                row.push(0);
            }
            if (row.length === playground.width) {
                inner.push(row.slice(0));
                row.length = 0;
            }
        }
        var pathRange = {
            min: playground.height,
            max: 0
        };
        for (var i = 0; i < inner.length; i++) {
            for (var j = 0; j < inner[i].length; j++) {
                if (inner[i][j] > 0) {
                    pathRange.min = Math.min(pathRange.min, i);
                    pathRange.max = Math.max(pathRange.max, i);
                }
            }
        }
        ctx.strokeStyle = "rgba(0,0,255,0.8)";
        ctx.beginPath();
        ctx.moveTo(0, pathRange.min);
        ctx.lineTo(playground.width, pathRange.min);
        ctx.moveTo(0, pathRange.max);
        ctx.lineTo(playground.width, pathRange.max);

        var middleLine = pathRange.min + Math.floor((pathRange.max - pathRange.min) / 2);
        var minMiddleLine = Math.floor(middleLine);
        var maxMiddleLine = Math.ceil(middleLine);
        var checked = false;
        for (var idx = middleLine; idx > pathRange.min; idx--) {
            if (checked) break;
            for (var tmp = 0; tmp < inner[idx].length; tmp++) {
                if (inner[idx][tmp] > 0) {
                    minMiddleLine = idx;
                    checked = true;
                    break;
                }
            }
        }
        checked = false;
        for (var idx = middleLine; idx < pathRange.max; idx++) {
            if (checked) break;
            for (var tmp = 0; tmp < inner[idx].length; tmp++) {
                if (inner[idx][tmp] > 0) {
                    maxMiddleLine = idx;
                    checked = true;
                    break;
                }
            }
        }
        if (minMiddleLine + 2 < maxMiddleLine) {
            minMiddleLine++;
            maxMiddleLine--;
        }
        ctx.moveTo(0, minMiddleLine);
        ctx.lineTo(playground.width, minMiddleLine);
        ctx.moveTo(0, maxMiddleLine);
        ctx.lineTo(playground.width, maxMiddleLine);
        ctx.stroke();
        ctx.closePath();
        ctx.save();

        var workingScope = runtimeCollection._get('runtimeInfo').workingScope || {};
        workingScope.toRight = drawArrow(ctx, cavList, playground.width);
        workingScope.ranges = {
            minRange: {
                min: pathRange.min,
                max: minMiddleLine
            },
            maxRange: {
                min: maxMiddleLine,
                max: pathRange.max
            }
        };
        workingScope.pathRange = pathRange;
        workingScope.minMiddleLine = minMiddleLine;
        workingScope.maxMiddleLine = maxMiddleLine;

        var postData = {};
        postData.binaryImg = inner;
        skeletonWorker.postMessage(JSON.stringify(postData));
    };
    var skeletonWorkerCallback = function(event) {
        var dataResult = JSON.parse(event.data);
        if (!dataResult.skeleton) return;
        //var deviation = dataResult.skeletonTimes;
        var workingScope = runtimeCollection._get('runtimeInfo').workingScope || {};

        var cav = $('.popup-layer canvas').get(0);
        var ctx = cav.getContext('2d');
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        for (var i = 0; i < dataResult.skeleton.length; i++) {
            for (var j = 0; j < dataResult.skeleton[i].length; j++) {
                if (dataResult.skeleton[i][j] > 0) ctx.fillRect(i, j, 1, 1);
            }
        }
        var postData = {};
        postData.martixSkeletonImage = dataResult.skeleton;
        postData.toRight = workingScope.toRight;
        postData.pathRange = workingScope.ranges;
        stepCollectionWorker.postMessage(JSON.stringify(postData));
    };
    var stepCollectionWorkerCallback = function(event) {
        var stepSkeletonFlg = JSON.parse(event.data);
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        try {
            var cav = $('.popup-layer canvas').get(0);
            var ctx = cav.getContext('2d');
            ctx.strokeStyle = "rgba(255,255,0,0.8)";
            ctx.beginPath();
            var minXPoint = {
                x: cav.width,
                y: cav.height
            };
            var maxXPoint = {
                x: 0,
                y: 0
            };
            for (var i = 0; i < stepSkeletonFlg.minPathRange.length - 1; i += 2) {
                ctx.moveTo(stepSkeletonFlg.minPathRange[i].x, stepSkeletonFlg.minPathRange[i].y);
                ctx.lineTo(stepSkeletonFlg.minPathRange[i + 1].x, stepSkeletonFlg.minPathRange[i + 1].y);
                if (minXPoint.x > stepSkeletonFlg.minPathRange[i].x) {
                    minXPoint.x = stepSkeletonFlg.minPathRange[i].x;
                    minXPoint.y = stepSkeletonFlg.minPathRange[i].y;
                }
                if (maxXPoint.x < stepSkeletonFlg.minPathRange[i].x) {
                    maxXPoint.x = stepSkeletonFlg.minPathRange[i].x;
                    maxXPoint.y = stepSkeletonFlg.minPathRange[i].y;
                }
            }
            for (var i = 0; i < stepSkeletonFlg.maxPathRange.length - 1; i += 2) {
                ctx.moveTo(stepSkeletonFlg.maxPathRange[i].x, stepSkeletonFlg.maxPathRange[i].y);
                ctx.lineTo(stepSkeletonFlg.maxPathRange[i + 1].x, stepSkeletonFlg.maxPathRange[i + 1].y);
                if (minXPoint.x > stepSkeletonFlg.maxPathRange[i].x) {
                    minXPoint.x = stepSkeletonFlg.maxPathRange[i].x;
                    minXPoint.y = stepSkeletonFlg.maxPathRange[i].y;
                }
                if (maxXPoint.x < stepSkeletonFlg.maxPathRange[i].x) {
                    maxXPoint.x = stepSkeletonFlg.maxPathRange[i].x;
                    maxXPoint.y = stepSkeletonFlg.maxPathRange[i].y;
                }
            }
            ctx.stroke();
            ctx.closePath();
            ctx.save();
            if (stepSkeletonFlg.minPathRange.length > 0 && minXPoint.x > stepSkeletonFlg.minPathRange[stepSkeletonFlg.minPathRange.length - 1].x) {
                minXPoint.x = stepSkeletonFlg.minPathRange[stepSkeletonFlg.minPathRange.length - 1].x;
                minXPoint.y = stepSkeletonFlg.minPathRange[stepSkeletonFlg.minPathRange.length - 1].y;
            }
            if (stepSkeletonFlg.minPathRange.length > 0 && maxXPoint.x < stepSkeletonFlg.minPathRange[stepSkeletonFlg.minPathRange.length - 1].x) {
                maxXPoint.x = stepSkeletonFlg.minPathRange[stepSkeletonFlg.minPathRange.length - 1].x;
                maxXPoint.y = stepSkeletonFlg.minPathRange[stepSkeletonFlg.minPathRange.length - 1].y;
            }
            if (stepSkeletonFlg.maxPathRange.length > 0 && minXPoint.x > stepSkeletonFlg.maxPathRange[stepSkeletonFlg.maxPathRange.length - 1].x) {
                minXPoint.x = stepSkeletonFlg.maxPathRange[stepSkeletonFlg.maxPathRange.length - 1].x;
                minXPoint.y = stepSkeletonFlg.maxPathRange[stepSkeletonFlg.maxPathRange.length - 1].y;
            }
            if (stepSkeletonFlg.maxPathRange.length > 0 && maxXPoint.x < stepSkeletonFlg.maxPathRange[stepSkeletonFlg.maxPathRange.length - 1].x) {
                maxXPoint.x = stepSkeletonFlg.maxPathRange[stepSkeletonFlg.maxPathRange.length - 1].x;
                maxXPoint.y = stepSkeletonFlg.maxPathRange[stepSkeletonFlg.maxPathRange.length - 1].y;
            }
            var analysisReport = getAnalysisReport(cav, runtimeInfo.workingScope.pathRange,
                runtimeInfo.workingScope.minMiddleLine, runtimeInfo.workingScope.maxMiddleLine,
                stepSkeletonFlg, minXPoint, maxXPoint, runtimeInfo.workingScope.toRight);
            if (!analysisReport) {
                runtimeInfo.workingScope = null;
                return;
            }

            ctx.strokeStyle = "rgba(0,255,0,0.8)";
            for (var i = 0; i < analysisReport.stepProcess.length; i++) {
                //var context = 'Step: ' + (i + 1) + '; Length: ' + analysisReport.stepProcess[i].stepLength + '; Angle: ' + analysisReport.stepProcess[i].angle;
                var context = 'Step: ' + (i + 1) + '; Length: ' + analysisReport.stepProcess[i].stepLength + '; Angle: ' + analysisReport.stepProcess[i].angle.toFixed(2);
                if (runtimeInfo.workingScope.toRight)
                    ctx.strokeText(context, analysisReport.stepProcess[i].from.x, analysisReport.stepProcess[i].from.y);
                else
                    ctx.strokeText(context, analysisReport.stepProcess[i].to.x, analysisReport.stepProcess[i].to.y);
            }

            ctx.save();
            $('.popup-layer>div>.button-container').before(formatReport(analysisReport, runtimeInfo.workingScope.keepTimes));
            io._saveReportOverview(analysisReport);
        } catch (e) {
            //var err = (e && e.number) ? (e.number & x0FFFF) : '0000000';
            alert(e.message);
        } finally {
            runtimeInfo.workingScope = null;
            if (skeletonWorker && typeof skeletonWorker.terminate === 'function') {
                skeletonWorker.terminate();
                skeletonWorker = null;
            }
            if (stepCollectionWorker && typeof stepCollectionWorker.terminate === 'function') {
                stepCollectionWorker.terminate();
                stepCollectionWorker = null;
            }
            historyAgent._gaitToReport();
        }

    };
    var formatReport = function(analysisReport, keepTimes) {
        var resultContainer = document.createElement('article');
        var divBody = document.createElement('div');
        var objReference = {
            amplitude: {
                min: 100,
                max: 160
            },
            deviation: {
                min: 0,
                max: 5
            },
            speed: {
                min: 110,
                max: 160
            },
            frequency: {
                min: 95,
                max: 125
            },
            length: {
                min: 50,
                max: 80
            }
        }
        var activedLang = runtimeCollection._get('activedLanguageList');

        var innerHtml = '<table class="popup-report-table">';

        innerHtml += '<tr>';
        innerHtml += '<th></th>';
        innerHtml += '<th z-lang="P013">' + activedLang.P013 + '</th>';
        innerHtml += '<th z-lang="P014">' + activedLang.P014 + '</th>';
        innerHtml += '<th></th>';
        innerHtml += '<th z-lang="P015">' + activedLang.P015 + '</th>';
        innerHtml += '<th z-lang="P016">' + activedLang.P016 + '</th>';
        innerHtml += '<th z-lang="P014">' + activedLang.P014 + '</th>';
        innerHtml += '</tr>';

        innerHtml += '<tr>';
        innerHtml += '<td class="left"><span z-lang="P004">' + activedLang.P004 + '</span></td>';
        var avgStepFrequency = analysisReport.stepCount / (keepTimes / 60000);
        if (objReference.frequency.min <= avgStepFrequency && objReference.frequency.max >= avgStepFrequency)
            innerHtml += '<td class="success">' + avgStepFrequency.toFixed(2) + '</td>';
        else innerHtml += '<td class="danger">' + avgStepFrequency.toFixed(2) + '</td>';
        innerHtml += '<td>' + objReference.frequency.min + '~' + objReference.frequency.max + '</td>';
        innerHtml += '<td class="left midline"><span z-lang="P017">' + activedLang.P017 + '</span></td>';
        if (objReference.length.min <= analysisReport.avgLeftStepLength && objReference.length.max >= analysisReport.avgLeftStepLength)
            innerHtml += '<td class="success">' + analysisReport.avgLeftStepLength.toFixed(2) + '</td>';
        else innerHtml += '<td class="danger">' + analysisReport.avgLeftStepLength.toFixed(2) + '</td>';
        if (objReference.length.min <= analysisReport.avgRightStepLength && objReference.length.max >= analysisReport.avgRightStepLength)
            innerHtml += '<td class="success">' + analysisReport.avgRightStepLength.toFixed(2) + '</td>';
        else innerHtml += '<td class="danger">' + analysisReport.avgRightStepLength.toFixed(2) + '</td>';
        innerHtml += '<td>' + objReference.length.min + '~' + objReference.length.max + '</td>';
        innerHtml += '</tr>';

        innerHtml += '<tr>';
        innerHtml += '<td class="left"><span z-lang="P005">' + activedLang.P005 + '</span></td>';
        if (objReference.amplitude.min <= analysisReport.avgStepLength && objReference.amplitude.max >= analysisReport.avgStepLength)
            innerHtml += '<td class="success">' + analysisReport.avgStepLength.toFixed(2) + '</td>';
        else innerHtml += '<td class="danger">' + analysisReport.avgStepLength.toFixed(2) + '</td>';
        innerHtml += '<td>' + objReference.amplitude.min + '~' + objReference.amplitude.max + '</td>';
        innerHtml += '<td class="left midline"><span z-lang="P018">' + activedLang.P018 + '</span>(&deg;)</td>';
        innerHtml += '<td>' + analysisReport.avgLeftAngle.toFixed(2) + '</td>';
        innerHtml += '<td>' + analysisReport.avgRightAngle.toFixed(2) + '</td>';
        innerHtml += '<td></td>';
        innerHtml += '</tr>';

        innerHtml += '<tr>';
        innerHtml += '<td class="left"><span z-lang="P006">' + activedLang.P006 + '</span></td>';
        var avgStepSpeed = analysisReport.samplingDist / (keepTimes / 1000);
        if (objReference.speed.min <= avgStepSpeed && objReference.speed.max >= avgStepSpeed)
            innerHtml += '<td class="success">' + avgStepSpeed.toFixed(2) + '</td>';
        else innerHtml += '<td class="danger">' + avgStepSpeed.toFixed(2) + '</td>';
        innerHtml += '<td>' + objReference.speed.min + '~' + objReference.speed.max + '</td>';
        innerHtml += '<td class="left midline"><span z-lang="P019">' + activedLang.P019 + '</span>(&deg;)</td>';
        innerHtml += '<td>' + analysisReport.minLeftAngle.toFixed(2) + '</td>';
        innerHtml += '<td>' + analysisReport.minRightAngle.toFixed(2) + '</td>';
        innerHtml += '<td></td>';
        innerHtml += '</tr>';

        innerHtml += '<tr>';
        innerHtml += '<td class="left"><span z-lang="P007">' + activedLang.P007 + '</span></td>';
        if (objReference.deviation.min <= analysisReport.stepLengthDeviation && objReference.deviation.max >= analysisReport.stepLengthDeviation)
            innerHtml += '<td class="success">' + analysisReport.stepLengthDeviation.toFixed(2) + '</td>';
        else innerHtml += '<td class="danger">' + analysisReport.stepLengthDeviation.toFixed(2) + '</td>';
        innerHtml += '<td>' + objReference.deviation.min + '~' + objReference.deviation.max + '</td>';
        innerHtml += '<td class="left midline"><span z-lang="P020">' + activedLang.P020 + '</span>(&deg;)</td>';
        innerHtml += '<td>' + analysisReport.maxLeftAngle.toFixed(2) + '</td>';
        innerHtml += '<td>' + analysisReport.maxRightAngle.toFixed(2) + '</td>';
        innerHtml += '<td></td>';
        innerHtml += '</tr>';

        innerHtml += '<tr>';
        innerHtml += '<td class="left"><span z-lang="P008">' + activedLang.P008 + '</span></td>';
        innerHtml += '<td>' + analysisReport.stepWidth.toFixed(2) + '</td>';
        innerHtml += '<td></td>';
        innerHtml += '<td class="left midline"><span z-lang="P020">' + activedLang.P020 + '</span></td>';
        innerHtml += '<td>' + analysisReport.varianceLeftAngle.toFixed(2) + '</td>';
        innerHtml += '<td>' + analysisReport.varianceRightAngle.toFixed(2) + '</td>';
        innerHtml += '<td></td>';
        innerHtml += '</tr>';

        innerHtml += '</table>';
        divBody.innerHTML = innerHtml;
        resultContainer.appendChild(divBody);
        $(resultContainer).addClass('popup-report-container');
        return resultContainer;
    };
    return {
        _resetAndReportCollection: function(needSave) {
            var canvasData = runtimeCollection._get('canvasData');
            if (!canvasData || !canvasData.length) return;
            if (typeof(Worker) !== undefined) {
                skeletonWorker = new Worker('./js/workers/skeletonExtraction.worker.js');
                skeletonWorker.onmessage = skeletonWorkerCallback;
                stepCollectionWorker = new Worker('./js/workers/stepCollection.worker.js');
                stepCollectionWorker.onmessage = stepCollectionWorkerCallback;
            }
            var runtimeInfo = runtimeCollection._get('runtimeInfo');
            var stepRecord = {};
            stepRecord.canvasData = [];
            var cavSize = {
                width: 0,
                height: 0
            };
            for (var i = 0; i < canvasData.length; i++) {
                var recordImg = {};
                recordImg.timestamp = canvasData[i].timestamp;
                stepRecord.startTimestamp = stepRecord.startTimestamp ? Math.min(stepRecord.startTimestamp, canvasData[i].timestamp) : canvasData[i].timestamp;
                stepRecord.finishedTimestamp = stepRecord.finishedTimestamp ? Math.max(stepRecord.finishedTimestamp, canvasData[i].timestamp) : canvasData[i].timestamp;
                recordImg.image = canvasData[i].image;
                cavSize.width = Math.max(canvasData[i].image.width, cavSize.width);
                cavSize.height = Math.max(canvasData[i].image.height, cavSize.height);
                recordImg.imgData = canvasData[i].imgData;
                stepRecord.canvasData.push(recordImg);
            }
            runtimeInfo.startTimestamp = stepRecord.startTimestamp;
            runtimeInfo.finishedTimestamp = stepRecord.finishedTimestamp;
            //Show Report
            gaitAgent._popupGaitContainer();
            if (!$('.popup-layer canvas').length) return;
            var workingScope = {
                keepTimes: (stepRecord.finishedTimestamp - stepRecord.startTimestamp)
            };
            runtimeInfo.workingScope = workingScope;
            $('.popup-layer>div>.canvas-container').addClass('hidden');
            $('.popup-report-container').removeClass('hidden');
            var playground = $('.popup-layer canvas').get(0);
            if ((!playground.width || !playground.height) &&
                $('.popup-layer canvas').length) {
                var cav = $('.popup-layer canvas').get(0);
                cav.width = cavSize.width;
                cav.height = cavSize.height;
                $('.popup-layer canvas').parent().width(cav.width);
                $('.popup-layer canvas').parent().height(cav.height);
            }
            showBinaryImage(stepRecord.canvasData, playground);
            getWalkingPath(playground, stepRecord.canvasData);
            //Save Report
            if (needSave) io._saveGaitRecord(stepRecord);
        }
    };
});