'use strict';
var oneSenserArea = (385 / 16) * (861 / 32) / 100;
var numToKpa = function(num) {
    return 4 * num / 70.29;
};
onmessage = function(event) {
    var message = JSON.parse(event.data);
    var id = message.id;
    var innerData = message.data;
    var noiseFilter = message.noiseFilter ? message.noiseFilter : 0;
    if (!innerData || !innerData.length || !innerData[0].length) return;
    if (message.size && message.physicalSize && message.size.x && message.size.y && message.physicalSize.x && message.physicalSize.y) oneSenserArea = (message.physicalSize.x / message.size.x) * (message.physicalSize.y / message.size.y);
    var bodypartProportion = message.bodypartProportion;
    var size = message.size || {
        x: 32,
        y: 64
    };
    var result = {
        id: id,
        head: {
            max: 0,
            avg: 0,
            area: 0
        },
        shoulder: {
            max: 0,
            avg: 0,
            area: 0
        },
        loins: {
            max: 0,
            avg: 0,
            area: 0
        },
        gluteus: {
            max: 0,
            avg: 0,
            area: 0
        },
        leg: {
            max: 0,
            avg: 0,
            area: 0
        },
        scale: 0
    }
    var sumNum = 0;
    var sumArea = 0;
    var allCollection = [];
    var allMax = 0;
    var allMin = 99999;
    var partAreaInfo = {
        head: {
            sum: 0,
            cnt: 0,
            avg: 0
        },
        shoulder: {
            sum: 0,
            cnt: 0,
            avg: 0
        },
        loins: {
            sum: 0,
            cnt: 0,
            avg: 0
        },
        gluteus: {
            sum: 0,
            cnt: 0,
            avg: 0
        },
        leg: {
            sum: 0,
            cnt: 0,
            avg: 0
        }
    };
    if (bodypartProportion) {
        var iRange = {
            max: 0,
            min: message.size.x
        };
        var jRange = {
            max: 0,
            min: message.size.y
        };
        for (var i = 0; i < innerData.length; i++) {
            for (var j = 0; j < innerData[i].length; j++) {
                if (innerData[i][j] <= noiseFilter) continue;
                iRange.max = Math.max(iRange.max, i);
                iRange.min = Math.min(iRange.min, i);
                jRange.max = Math.max(jRange.max, j);
                jRange.min = Math.min(jRange.min, j);
            }
        }
        if (iRange.max === 0 || jRange.max === 0) result.direction = 0;
        else result.direction = (jRange.max - jRange.min) - (iRange.max - iRange.min);
        iRange.max++;
        jRange.max++;
        /*
        var minMin = 0;
        var maxMin = 0;
        var minMax = 0;
        var maxMax = 0;
        if (result.direction > 0) {
            minMin = iRange.max - iRange.min;
            maxMin = 0;
            minMax = iRange.max - iRange.min;
            maxMax = 0;
            for (var i = iRange.min; i <= iRange.max; i++) {
                if (innerData[i][jRange.max] > noiseFilter) {
                    minMax = Math.min(minMax, i);
                    maxMax = Math.max(maxMax, i);
                }
                if (innerData[i][jRange.min] > noiseFilter) {
                    minMin = Math.min(minMin, i);
                    maxMin = Math.max(maxMin, i);
                }
            }
        } else {
            minMin = jRange.max - jRange.min;
            maxMin = 0;
            minMax = jRange.max - jRange.min;
            maxMax = 0;
            for (var i = jRange.min; i <= jRange.max; i++) {
                if (innerData[iRange.max][j] > noiseFilter) {
                    minMax = Math.min(minMax, j);
                    maxMax = Math.max(maxMax, j);
                }
                if (innerData[iRange.min][j] > noiseFilter) {
                    minMin = Math.min(minMin, j);
                    maxMin = Math.max(maxMin, j);
                }
            }
        }
        result.headIn = (maxMax - minMax) - (maxMin - minMin);
        */
        var bodyCheckRange = [];
        var line = 0;
        if (result.direction > 0) {
            line = jRange.min + ((jRange.max - jRange.min) * eval(bodypartProportion.head));
            bodyCheckRange.push(line);
            line += ((jRange.max - jRange.min) * eval(bodypartProportion.shoulder));
            bodyCheckRange.push(line);
            line += ((jRange.max - jRange.min) * eval(bodypartProportion.loins));
            bodyCheckRange.push(line);
            line += ((jRange.max - jRange.min) * eval(bodypartProportion.gluteus));
            bodyCheckRange.push(line);
            line += ((jRange.max - jRange.min) * eval(bodypartProportion.leg));
            bodyCheckRange.push(line);
            /*
            if (result.headIn > 0) {
                line = jRange.min + ((jRange.max - jRange.min) * eval(bodypartProportion.head));
                bodyCheckRange.push(line);
                line += ((jRange.max - jRange.min) * eval(bodypartProportion.shoulder));
                bodyCheckRange.push(line);
                line += ((jRange.max - jRange.min) * eval(bodypartProportion.loins));
                bodyCheckRange.push(line);
                line += ((jRange.max - jRange.min) * eval(bodypartProportion.gluteus));
                bodyCheckRange.push(line);
                line += ((jRange.max - jRange.min) * eval(bodypartProportion.leg));
                bodyCheckRange.push(line);
            } else {
                line = jRange.max - ((jRange.max - jRange.min) * eval(bodypartProportion.head));
                bodyCheckRange.push(line);
                line -= ((jRange.max - jRange.min) * eval(bodypartProportion.shoulder));
                bodyCheckRange.unshift(line);
                line -= ((jRange.max - jRange.min) * eval(bodypartProportion.loins));
                bodyCheckRange.unshift(line);
                line -= ((jRange.max - jRange.min) * eval(bodypartProportion.gluteus));
                bodyCheckRange.unshift(line);
                line -= ((jRange.max - jRange.min) * eval(bodypartProportion.leg));
                bodyCheckRange.unshift(line);
            }*/
        } else {
            line = iRange.min + ((iRange.max - iRange.min) * eval(bodypartProportion.head));
            bodyCheckRange.push(line);
            line += ((iRange.max - iRange.min) * eval(bodypartProportion.shoulder));
            bodyCheckRange.push(line);
            line += ((iRange.max - iRange.min) * eval(bodypartProportion.loins));
            bodyCheckRange.push(line);
            line += ((iRange.max - iRange.min) * eval(bodypartProportion.gluteus));
            bodyCheckRange.push(line);
            line += ((iRange.max - iRange.min) * eval(bodypartProportion.leg));
            bodyCheckRange.push(line);
            /*
            if (result.headIn > 0) {
                line = iRange.min + ((iRange.max - iRange.min) * eval(bodypartProportion.head));
                bodyCheckRange.push(line);
                line += ((iRange.max - iRange.min) * eval(bodypartProportion.shoulder));
                bodyCheckRange.push(line);
                line += ((iRange.max - iRange.min) * eval(bodypartProportion.loins));
                bodyCheckRange.push(line);
                line += ((iRange.max - iRange.min) * eval(bodypartProportion.gluteus));
                bodyCheckRange.push(line);
                line += ((iRange.max - iRange.min) * eval(bodypartProportion.leg));
                bodyCheckRange.push(line);
            } else {
                line = iRange.max - ((iRange.max - iRange.min) * eval(bodypartProportion.head));
                bodyCheckRange.push(line);
                line -= ((iRange.max - iRange.min) * eval(bodypartProportion.shoulder));
                bodyCheckRange.unshift(line);
                line -= ((iRange.max - iRange.min) * eval(bodypartProportion.loins));
                bodyCheckRange.unshift(line);
                line -= ((iRange.max - iRange.min) * eval(bodypartProportion.gluteus));
                bodyCheckRange.unshift(line);
                line -= ((iRange.max - iRange.min) * eval(bodypartProportion.leg));
                bodyCheckRange.unshift(line);
            }
            */
        }
        for (var i = iRange.min; i < iRange.max; i++) {
            for (var j = jRange.min; j < jRange.max; j++) {
                if (innerData[i][j] <= noiseFilter) continue;
                allCollection.push(innerData[i][j]);
                allMax = Math.max(allMax, innerData[i][j]);
                allMin = Math.min(allMin, innerData[i][j]);
                if (result.direction > 0) {
                    switch (true) {
                        case (j < bodyCheckRange[0]):
                            result.head.max = Math.max(result.head.max, innerData[i][j]);
                            result.head.avg += innerData[i][j];
                            result.head.area += oneSenserArea;
                            partAreaInfo.head.sum += innerData[i][j];
                            partAreaInfo.head.cnt++;
                            break;
                        case (j < bodyCheckRange[1]):
                            result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                            result.shoulder.avg += innerData[i][j];
                            result.shoulder.area += oneSenserArea;
                            partAreaInfo.shoulder.sum += innerData[i][j];
                            partAreaInfo.shoulder.cnt++;
                            break;
                        case (j < bodyCheckRange[2]):
                            result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                            result.loins.avg += innerData[i][j];
                            result.loins.area += oneSenserArea;
                            partAreaInfo.loins.sum += innerData[i][j];
                            partAreaInfo.loins.cnt++;
                            break;
                        case (j < bodyCheckRange[3]):
                            result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                            result.gluteus.avg += innerData[i][j];
                            result.gluteus.area += oneSenserArea;
                            partAreaInfo.gluteus.sum += innerData[i][j];
                            partAreaInfo.gluteus.cnt++;
                            break;
                        default:
                            result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                            result.leg.avg += innerData[i][j];
                            result.leg.area += oneSenserArea;
                            partAreaInfo.leg.sum += innerData[i][j];
                            partAreaInfo.leg.cnt++;
                            break;
                    }
                    /*
                    if (result.headIn > 0) {
                        switch (true) {
                            case (j < bodyCheckRange[0]):
                                result.head.max = Math.max(result.head.max, innerData[i][j]);
                                result.head.avg += innerData[i][j];
                                result.head.area += oneSenserArea;
                                break;
                            case (j < bodyCheckRange[1]):
                                result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                                result.shoulder.avg += innerData[i][j];
                                result.shoulder.area += oneSenserArea;
                                break;
                            case (j < bodyCheckRange[2]):
                                result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                                result.loins.avg += innerData[i][j];
                                result.loins.area += oneSenserArea;
                                break;
                            case (j < bodyCheckRange[3]):
                                result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                                result.gluteus.avg += innerData[i][j];
                                result.gluteus.area += oneSenserArea;
                                break;
                            default:
                                result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                                result.leg.avg += innerData[i][j];
                                result.leg.area += oneSenserArea;
                                break;
                        }
                    } else {
                        switch (true) {
                            case (j < bodyCheckRange[0]):
                                result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                                result.leg.avg += innerData[i][j];
                                result.leg.area += oneSenserArea;
                                break;
                            case (j < bodyCheckRange[1]):
                                result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                                result.gluteus.avg += innerData[i][j];
                                result.gluteus.area += oneSenserArea;
                                break;
                            case (j < bodyCheckRange[2]):
                                result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                                result.loins.avg += innerData[i][j];
                                result.loins.area += oneSenserArea;
                                break;
                            case (j < bodyCheckRange[3]):
                                result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                                result.shoulder.avg += innerData[i][j];
                                result.shoulder.area += oneSenserArea;
                                break;
                            default:
                                result.head.max = Math.max(result.head.max, innerData[i][j]);
                                result.head.avg += innerData[i][j];
                                result.head.area += oneSenserArea;
                                break;
                        }
                    }
                    */
                } else {
                    switch (true) {
                        case (i < bodyCheckRange[0]):
                            result.head.max = Math.max(result.head.max, innerData[i][j]);
                            result.head.avg += innerData[i][j];
                            result.head.area += oneSenserArea;
                            partAreaInfo.head.sum += innerData[i][j];
                            partAreaInfo.head.cnt++;
                            break;
                        case (i < bodyCheckRange[1]):
                            result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                            result.shoulder.avg += innerData[i][j];
                            result.shoulder.area += oneSenserArea;
                            partAreaInfo.shoulder.sum += innerData[i][j];
                            partAreaInfo.shoulder.cnt++;
                            break;
                        case (i < bodyCheckRange[2]):
                            result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                            result.loins.avg += innerData[i][j];
                            result.loins.area += oneSenserArea;
                            partAreaInfo.loins.sum += innerData[i][j];
                            partAreaInfo.loins.cnt++;
                            break;
                        case (i < bodyCheckRange[3]):
                            result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                            result.gluteus.avg += innerData[i][j];
                            result.gluteus.area += oneSenserArea;
                            partAreaInfo.gluteus.sum += innerData[i][j];
                            partAreaInfo.gluteus.cnt++;
                            break;
                        default:
                            result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                            result.leg.avg += innerData[i][j];
                            result.leg.area += oneSenserArea;
                            partAreaInfo.leg.sum += innerData[i][j];
                            partAreaInfo.leg.cnt++;
                            break;
                    }
                    /*
                    if (result.headIn > 0) {
                        switch (true) {
                            case (i < bodyCheckRange[0]):
                                result.head.max = Math.max(result.head.max, innerData[i][j]);
                                result.head.avg += innerData[i][j];
                                result.head.area += oneSenserArea;
                                break;
                            case (i < bodyCheckRange[1]):
                                result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                                result.shoulder.avg += innerData[i][j];
                                result.shoulder.area += oneSenserArea;
                                break;
                            case (i < bodyCheckRange[2]):
                                result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                                result.loins.avg += innerData[i][j];
                                result.loins.area += oneSenserArea;
                                break;
                            case (i < bodyCheckRange[3]):
                                result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                                result.gluteus.avg += innerData[i][j];
                                result.gluteus.area += oneSenserArea;
                                break;
                            default:
                                result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                                result.leg.avg += innerData[i][j];
                                result.leg.area += oneSenserArea;
                                break;
                        }
                    } else {
                        switch (true) {
                            case (i < bodyCheckRange[0]):
                                result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                                result.leg.avg += innerData[i][j];
                                result.leg.area += oneSenserArea;
                                break;
                            case (i < bodyCheckRange[1]):
                                result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                                result.gluteus.avg += innerData[i][j];
                                result.gluteus.area += oneSenserArea;
                                break;
                            case (i < bodyCheckRange[2]):
                                result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                                result.loins.avg += innerData[i][j];
                                result.loins.area += oneSenserArea;
                                break;
                            case (i < bodyCheckRange[3]):
                                result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                                result.shoulder.avg += innerData[i][j];
                                result.shoulder.area += oneSenserArea;
                                break;
                            default:
                                result.head.max = Math.max(result.head.max, innerData[i][j]);
                                result.head.avg += innerData[i][j];
                                result.head.area += oneSenserArea;
                                break;
                        }
                    }
                    */
                }
                sumNum += innerData[i][j];
                sumArea += oneSenserArea;
            }
        }
    } else {
        for (var i = 0; i < innerData.length; i++) {
            for (var j = 0; j < innerData[i].length; j++) {
                if (innerData[i][j] <= noiseFilter) continue;
                switch (true) {
                    case (j < 10):
                        result.head.max = Math.max(result.head.max, innerData[i][j]);
                        result.head.avg += innerData[i][j];
                        result.head.area += oneSenserArea;
                        partAreaInfo.head.sum += innerData[i][j];
                        partAreaInfo.head.cnt++;
                        break;
                    case (j < 21):
                        result.shoulder.max = Math.max(result.shoulder.max, innerData[i][j]);
                        result.shoulder.avg += innerData[i][j];
                        result.shoulder.area += oneSenserArea;
                        partAreaInfo.shoulder.sum += innerData[i][j];
                        partAreaInfo.shoulder.cnt++;
                        break;
                    case (j < 28):
                        result.loins.max = Math.max(result.loins.max, innerData[i][j]);
                        result.loins.avg += innerData[i][j];
                        result.loins.area += oneSenserArea;
                        partAreaInfo.loins.sum += innerData[i][j];
                        partAreaInfo.loins.cnt++;
                        break;
                    case (j < 44):
                        result.gluteus.max = Math.max(result.gluteus.max, innerData[i][j]);
                        result.gluteus.avg += innerData[i][j];
                        result.gluteus.area += oneSenserArea;
                        partAreaInfo.gluteus.sum += innerData[i][j];
                        partAreaInfo.gluteus.cnt++;
                        break;
                    case (j < 64):
                        result.leg.max = Math.max(result.leg.max, innerData[i][j]);
                        result.leg.avg += innerData[i][j];
                        result.leg.area += oneSenserArea;
                        partAreaInfo.leg.sum += innerData[i][j];
                        partAreaInfo.leg.cnt++;
                        break;
                    default:
                        break;
                }
                sumNum += innerData[i][j];
                sumArea += oneSenserArea;
            }
        }
    }
    partAreaInfo.head.avg = partAreaInfo.head.sum / partAreaInfo.head.cnt;
    partAreaInfo.shoulder.avg = partAreaInfo.shoulder.sum / partAreaInfo.shoulder.cnt;
    partAreaInfo.loins.avg = partAreaInfo.loins.sum / partAreaInfo.loins.cnt;
    partAreaInfo.gluteus.avg = partAreaInfo.gluteus.sum / partAreaInfo.gluteus.cnt;
    partAreaInfo.leg.avg = partAreaInfo.leg.sum / partAreaInfo.leg.cnt;
    //allCollection.sort();
    //var samplingLimint = allCollection[Math.ceil(allCollection.length * 3 / 4)];
    var samplingLimint = Math.ceil((allMax - allMin) / 4);
    var cnt = 0;
    var maxAreaPercent = {
        head: 0,
        shoulder: 0,
        loins: 0,
        gluteus: 0,
        leg: 0
    };
    var partAreaVariance = {
        head: 0,
        shoulder: 0,
        loins: 0,
        gluteus: 0,
        leg: 0
    };
    result.height = 0;
    result.spineLine = [];
    if (result.direction) {
        if (result.direction > 0) {
            result.height = (jRange.max - jRange.min) * (message.physicalSize.y / message.size.y);
            for (var j = jRange.min; j < jRange.max; j++) {
                var maxSpineValue = 0;
                for (var i = iRange.min; i < iRange.max; i++) {
                    if (innerData[i][j] <= noiseFilter) continue;
                    if (innerData[i][j] > samplingLimint) {
                        switch (true) {
                            case (j < bodyCheckRange[0]):
                                maxAreaPercent.head++;
                                partAreaVariance.head += Math.pow(innerData[i][j] - partAreaInfo.head.avg, 2);
                                break;
                            case (j < bodyCheckRange[1]):
                                maxAreaPercent.shoulder++;
                                partAreaVariance.shoulder += Math.pow(innerData[i][j] - partAreaInfo.shoulder.avg, 2);
                                break;
                            case (j < bodyCheckRange[2]):
                                maxAreaPercent.loins++;
                                partAreaVariance.loins += Math.pow(innerData[i][j] - partAreaInfo.loins.avg, 2);
                                break;
                            case (j < bodyCheckRange[3]):
                                maxAreaPercent.gluteus++;
                                partAreaVariance.gluteus += Math.pow(innerData[i][j] - partAreaInfo.gluteus.avg, 2);
                                break;
                            default:
                                maxAreaPercent.leg++;
                                partAreaVariance.leg += Math.pow(innerData[i][j] - partAreaInfo.leg.avg, 2);
                                break;
                        }
                    }
                    cnt++;
                    if (j > jRange.min && j < jRange.max) {
                        maxSpineValue = Math.max(maxSpineValue, innerData[i][j]);
                    }
                }
                if (maxSpineValue > noiseFilter) result.spineLine.push(maxSpineValue);
                else result.spineLine.push(0);
            }
        } else {
            result.height = (iRange.max - iRange.min) * (message.physicalSize.x / message.size.x);
            for (var i = iRange.min; i < iRange.max; i++) {
                var maxSpineValue = 0;
                for (var j = jRange.min; j < jRange.max; j++) {
                    if (innerData[i][j] <= noiseFilter) continue;
                    if (innerData[i][j] > samplingLimint) {
                        switch (true) {
                            case (i < bodyCheckRange[0]):
                                maxAreaPercent.head++;
                                partAreaVariance.head += Math.pow(innerData[i][j] - partAreaInfo.head.avg, 2);
                                break;
                            case (i < bodyCheckRange[1]):
                                maxAreaPercent.shoulder++;
                                partAreaVariance.shoulder += Math.pow(innerData[i][j] - partAreaInfo.shoulder.avg, 2);
                                break;
                            case (i < bodyCheckRange[2]):
                                maxAreaPercent.loins++;
                                partAreaVariance.loins += Math.pow(innerData[i][j] - partAreaInfo.loins.avg, 2);
                                break;
                            case (i < bodyCheckRange[3]):
                                maxAreaPercent.gluteus++;
                                partAreaVariance.gluteus += Math.pow(innerData[i][j] - partAreaInfo.gluteus.avg, 2);
                                break;
                            default:
                                maxAreaPercent.leg++;
                                partAreaVariance.leg += Math.pow(innerData[i][j] - partAreaInfo.leg.avg, 2);
                                break;
                        }
                    }
                    cnt++;
                    if (i > iRange.min && i < iRange.max) {
                        maxSpineValue = Math.max(maxSpineValue, innerData[i][j]);
                    }
                }
                if (maxSpineValue > noiseFilter) result.spineLine.push(maxSpineValue);
                else result.spineLine.push(0);
            }
        }
        result.head.percent = maxAreaPercent.head / cnt * 100;
        result.shoulder.percent = maxAreaPercent.shoulder / cnt * 100;
        result.loins.percent = maxAreaPercent.loins / cnt * 100;
        result.gluteus.percent = maxAreaPercent.gluteus / cnt * 100;
        result.leg.percent = maxAreaPercent.leg / cnt * 100;
        partAreaVariance.head /= partAreaInfo.head.cnt;
        partAreaVariance.shoulder /= partAreaInfo.shoulder.cnt;
        partAreaVariance.loins /= partAreaInfo.loins.cnt;
        partAreaVariance.gluteus /= partAreaInfo.gluteus.cnt;
        partAreaVariance.leg /= partAreaInfo.leg.cnt;
        result.head.areaVariance = partAreaVariance.head;
        result.shoulder.areaVariance = partAreaVariance.shoulder;
        result.loins.areaVariance = partAreaVariance.loins;
        result.gluteus.areaVariance = partAreaVariance.gluteus;
        result.leg.areaVariance = partAreaVariance.leg;
    }
    result.pValue = numToKpa(sumNum) * 1000 / 10000 * oneSenserArea || 0;
    result.head.max = (numToKpa(result.head.max));
    result.shoulder.max = (numToKpa(result.shoulder.max));
    result.loins.max = (numToKpa(result.loins.max));
    result.gluteus.max = (numToKpa(result.gluteus.max));
    result.leg.max = (numToKpa(result.leg.max));
    if (result.head.area > 0) {
        result.head.avg = (numToKpa(result.head.avg) / result.head.area);
        result.head.area = result.head.area;
    }
    if (result.shoulder.area > 0) {
        result.shoulder.avg = (numToKpa(result.shoulder.avg) / result.shoulder.area);
        result.shoulder.area = result.shoulder.area;
    }
    if (result.loins.area > 0) {
        result.loins.avg = (numToKpa(result.loins.avg) / result.loins.area);
        result.loins.area = result.loins.area;
    }
    if (result.gluteus.area > 0) {
        result.gluteus.avg = (numToKpa(result.gluteus.avg) / result.gluteus.area);
        result.gluteus.area = result.gluteus.area;
    }
    if (result.leg.area > 0) {
        result.leg.avg = (numToKpa(result.leg.avg) / result.leg.area);
        result.leg.area = result.leg.area;
    }
    if (sumArea > 0) result.scale = (numToKpa(sumNum) / sumArea);
    result.rangeInfo = {
        iRange: iRange,
        jRange: jRange,
        bodyCheckRange: bodyCheckRange
    }
    postMessage(JSON.stringify(result));
};