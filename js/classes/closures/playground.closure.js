;
var Playground = (function playgroundClosure() {
    'use strict';

    function Playground() {
        this.__DOM__ = $('<article></article>').addClass('playground-container');
    };
    Playground.prototype = {
        showAnalysisImage: function() {
            var context = this.canvas.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.fillStyle = 'rgba(200, 200, 200, 0.7)';
            for (var i = 0; i < this.__DATA__.binaryImage.length; i++) {
                for (var j = 0; j < this.__DATA__.binaryImage[i].length; j++) {
                    if (this.__DATA__.binaryImage[i][j] > 0) context.fillRect(i, j, 1, 1);
                }
            }
            context.save();
            context.fillStyle = 'rgb(0, 255, 0)';
            for (var i = 0; i < this.__DATA__.skeleton.length; i++) {
                for (var j = 0; j < this.__DATA__.skeleton[i].length; j++) {
                    if (this.__DATA__.skeleton[i][j] > 0) context.fillRect(i, j, 1, 1);
                }
            }
            context.save();
            context.strokeStyle = "rgb(0, 0, 255)";
            context.beginPath();
            context.moveTo(this.__DATA__.walkPath.minLine, 0);
            context.lineTo(this.__DATA__.walkPath.minLine, this.canvas.height);
            context.moveTo(this.__DATA__.walkPath.minMiddleLine, 0);
            context.lineTo(this.__DATA__.walkPath.minMiddleLine, this.canvas.height);
            context.moveTo(this.__DATA__.walkPath.maxMiddleLine, 0);
            context.lineTo(this.__DATA__.walkPath.maxMiddleLine, this.canvas.height);
            context.moveTo(this.__DATA__.walkPath.maxLine, 0);
            context.lineTo(this.__DATA__.walkPath.maxLine, this.canvas.height);
            context.stroke();
            context.closePath();
            context.save();
            context.strokeStyle = "rgb(255, 0, 0)";
            context.beginPath();
            for (var i = 0; i < this.__DATA__.trajectoryResult.minPathRange.length - 1; i += 2) {
                context.moveTo(this.__DATA__.trajectoryResult.minPathRange[i].x, this.__DATA__.trajectoryResult.minPathRange[i].y);
                context.lineTo(this.__DATA__.trajectoryResult.minPathRange[i + 1].x, this.__DATA__.trajectoryResult.minPathRange[i + 1].y);
            }
            for (var i = 0; i < this.__DATA__.trajectoryResult.maxPathRange.length - 1; i += 2) {
                context.moveTo(this.__DATA__.trajectoryResult.maxPathRange[i].x, this.__DATA__.trajectoryResult.maxPathRange[i].y);
                context.lineTo(this.__DATA__.trajectoryResult.maxPathRange[i + 1].x, this.__DATA__.trajectoryResult.maxPathRange[i + 1].y);
            }
            context.stroke();
            context.closePath();
            context.save();
            /*
            context.strokeStyle = "rgba(0,255,0,0.8)";
            for (var i = 0; i < this.__DATA__.report.stepProcess.length; i++) {
                //var context = 'Step: ' + (i + 1) + '; Length: ' + this.__DATA__.report.stepProcess[i].stepLength + '; Angle: ' + this.__DATA__.report.stepProcess[i].angle;
                var text = 'Step: ' + (i + 1) + '; Length: ' + this.__DATA__.report.stepProcess[i].stepLength + '; Angle: ' + this.__DATA__.report.stepProcess[i].angle.toFixed(2);
                if (this.__DATA__.direction > 0) context.strokeText(text, this.__DATA__.report.stepProcess[i].from.x, this.__DATA__.report.stepProcess[i].from.y);
                else context.strokeText(text, this.__DATA__.report.stepProcess[i].to.x, this.__DATA__.report.stepProcess[i].to.y);
            }
            context.save();
            //*/
        },
        replayGait: function() {
            if (this.__GAITRECORD__.canvasData.length <= 0 || this.__GAITRECORD__.canvasData.length <= this.frameIndex) {
                //this.showAnalysisImage();
                this.tmpFrameCanvas = null;
                this.replayPlayground.empty();
                this.replayPlayground.remove();
                this.replayPlayground = null;
                this.frameIndex = null;
                this.controlBar.children('button.btn').each(function(i, n) {
                    var ele = $(n).removeClass('disabled');
                });
                return;
            }
            var context = this.tmpFrameCanvas.getContext("2d");
            var nextIndex = this.frameIndex + 1;
            var nextTimeout = 1000;
            if (nextIndex < this.__GAITRECORD__.canvasData.length) nextTimeout = this.__GAITRECORD__.canvasData[nextIndex].timestamp - this.__GAITRECORD__.canvasData[this.frameIndex].timestamp;
            var imgData = context.getImageData(0, 0, this.tmpFrameCanvas.width, this.tmpFrameCanvas.height);
            var tmpCtx = this.__GAITRECORD__.canvasData[this.frameIndex].screenShot.getContext("2d");
            var tmpImg = tmpCtx.getImageData(0, 0, this.__GAITRECORD__.canvasData[this.frameIndex].screenShot.width, this.__GAITRECORD__.canvasData[this.frameIndex].screenShot.height);
            for (var i = 0; i < tmpImg.data.length; i++) {
                if (imgData.data.length <= i) break;
                imgData.data[i] = tmpImg.data[i];
            }
            context.putImageData(imgData, 0, 0);
            this.frameIndex = nextIndex;
            setTimeout(this.replayGait.bind(this), nextTimeout);
        },
        clearDom: function() {
            if (this.screenShoot) {
                this.screenShoot.empty();
                this.screenShoot = null;
            }
            if (this.reportTable) {
                this.reportTable.empty();
                this.reportTable = null;
            }
            if (this.controlBar) {
                commonFunc._traverseClearEvent(this.controlBar);
                this.controlBar.empty();
                this.controlBar = null;
            }
        },
        _delRecordDeletedCallback: function() {},
        _setGaitData: function(analysisData, gaitRecord, returnId) {
            this.__DATA__ = logic._formatGaitData(analysisData);
            this.__GAITRECORD__ = gaitRecord;
            this.__returnId__ = returnId ? returnId : this.__DATA__.id;
            this.clearDom();
            this.__DOM__.empty();
            //Controller
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__DATA__.id].lang];
            this.__DOM__.append($('<label z-lang="P009">' + activedLang.P009 + '</label>').addClass('prn-note'));
            this.controlBar = $('<section></section>').addClass('playground-controlbar prn-disabled');
            var btnBack = $('<button z-lang="C018">' + activedLang.C018 + '</button>').addClass('btn');
            btnBack.on('click', logic._returnListener.bind(this));
            var btnReplay = $('<button z-lang="P012">' + activedLang.P012 + '</button>').addClass('btn');
            btnReplay.on('click', logic._replayListener.bind(this));
            var btnPrint = $('<button z-lang="C019">' + activedLang.C019 + '/button>').addClass('btn');
            this.controlBar.append(btnBack).append(btnReplay).append(btnPrint);
            btnPrint.on('click', function() {
                window.print();
            });
            this.__DOM__.append(this.controlBar);
            //Playground
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.__DATA__.binaryImage.length;
            this.canvas.height = this.__DATA__.binaryImage[0].length;
            this.showAnalysisImage();
            this.__DOM__.append($(this.canvas).addClass('playground-canvas'));
            //Report
            if (this.__DATA__.finishedTimestamp && this.__DATA__.startTimestamp && this.__DATA__.report) {
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
                var keepTimes = this.__DATA__.finishedTimestamp - this.__DATA__.startTimestamp;
                this.reportTable = $('<section></section>').addClass('gait-report-container');
                var env = rootScope._get('_ENV_');
                var activedLang = env.languageMap[env.useConfig[this.__DATA__.id].lang];
                var innerHtml = '<table class="gait-report-table">';
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
                var avgStepFrequency = this.__DATA__.report.stepCount / (keepTimes / 60000);
                //if (objReference.frequency.min <= avgStepFrequency && objReference.frequency.max >= avgStepFrequency) innerHtml += '<td class="success">' + commonFunc._toFixed(avgStepFrequency, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(avgStepFrequency, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(avgStepFrequency, 1) + '</td>';
                //innerHtml += '<td>' + objReference.frequency.min + '~' + objReference.frequency.max + '</td>';
                innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P017">' + activedLang.P017 + '</span></td>';
                //if (objReference.length.min <= this.__DATA__.report.avgLeftStepLength && objReference.length.max >= this.__DATA__.report.avgLeftStepLength) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.avgLeftStepLength, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.avgLeftStepLength, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgLeftStepLength, 1) + '</td>';
                //if (objReference.length.min <= this.__DATA__.report.avgRightStepLength && objReference.length.max >= this.__DATA__.report.avgRightStepLength) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.avgRightStepLength, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.avgRightStepLength, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgRightStepLength, 1) + '</td>';
                //innerHtml += '<td>' + objReference.length.min + '~' + objReference.length.max + '</td>';
                innerHtml += '<td>~</td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P005">' + activedLang.P005 + '</span></td>';
                //if (objReference.amplitude.min <= this.__DATA__.report.avgStepLength && objReference.amplitude.max >= this.__DATA__.report.avgStepLength) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.avgStepLength, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.avgStepLength, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgStepLength, 1) + '</td>';
                //innerHtml += '<td>' + objReference.amplitude.min + '~' + objReference.amplitude.max + '</td>';
                innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P018">' + activedLang.P018 + '</span>(&deg;)</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.avgRightAngle, 1) + '</td>';
                innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P006">' + activedLang.P006 + '</span></td>';
                var avgStepSpeed = this.__DATA__.report.samplingDist / (keepTimes / 1000);
                //if (objReference.speed.min <= avgStepSpeed && objReference.speed.max >= avgStepSpeed) innerHtml += '<td class="success">' + commonFunc._toFixed(avgStepSpeed, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(avgStepSpeed, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(avgStepSpeed, 1) + '</td>';
                //innerHtml += '<td>' + objReference.speed.min + '~' + objReference.speed.max + '</td>';
                innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P019">' + activedLang.P019 + '</span>(&deg;)</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.minLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.minRightAngle, 1) + '</td>';
                innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P007">' + activedLang.P007 + '</span></td>';
                //if (objReference.deviation.min <= this.__DATA__.report.stepLengthDeviation && objReference.deviation.max >= this.__DATA__.report.stepLengthDeviation) innerHtml += '<td class="success">' + commonFunc._toFixed(this.__DATA__.report.stepLengthDeviation, 1) + '</td>';
                //else innerHtml += '<td class="danger">' + commonFunc._toFixed(this.__DATA__.report.stepLengthDeviation, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.stepLengthDeviation, 1) + '</td>';
                //innerHtml += '<td>' + objReference.deviation.min + '~' + objReference.deviation.max + '</td>';
                innerHtml += '<td>~</td>';
                innerHtml += '<td class="left midline"><span z-lang="P020">' + activedLang.P020 + '</span>(&deg;)</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.maxLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.maxRightAngle, 1) + '</td>';
                innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '<tr>';
                innerHtml += '<td class="left"><span z-lang="P008">' + activedLang.P008 + '</span></td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.stepWidth, 1) + '</td>';
                innerHtml += '<td></td>';
                innerHtml += '<td class="left midline"><span z-lang="P021">' + activedLang.P021 + '</span></td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.varianceLeftAngle, 1) + '</td>';
                innerHtml += '<td>' + commonFunc._toFixed(this.__DATA__.report.varianceRightAngle, 1) + '</td>';
                innerHtml += '<td></td>';
                innerHtml += '</tr>';
                innerHtml += '</table>';
                this.reportTable.html(innerHtml);
                this.__DOM__.append(this.reportTable);
            }
            //screenshoot
            this.__DOM__.append($('<label></label>').addClass('screen-mark').html((new Date(gaitRecord.startTimestamp)).Format('yyyy-MM-dd hh:mm:ss S')));
            this.screenShoot = $('<section></section>').addClass('gait-report-container screen-container prn-show-all');
            var tmpCav = document.createElement('canvas');
            tmpCav.width = this.canvas.height;
            tmpCav.height = this.canvas.width;
            var tmpCtx = tmpCav.getContext("2d");
            for (var i = 0; i < gaitRecord.canvasData.length; i++) {
                var imgData = tmpCtx.getImageData(0, 0, tmpCav.width, tmpCav.height);
                var tmpScreenCtx = gaitRecord.canvasData[i].screenShot.getContext("2d");
                var tmpScreenImg = tmpScreenCtx.getImageData(0, 0, gaitRecord.canvasData[i].screenShot.width, gaitRecord.canvasData[i].screenShot.height);
                for (var j = 0; j < tmpScreenImg.data.length; j++) {
                    if (imgData.data.length <= j) break;
                    imgData.data[j] = tmpScreenImg.data[j];
                }
                tmpCtx.putImageData(imgData, 0, 0);
                this.screenShoot.append($('<ul class="one-screen"><li><img src="' + tmpCav.toDataURL() + '"></li><li>' + (new Date(gaitRecord.canvasData[i].timestamp)).Format('yyyy-MM-dd hh:mm:ss S') + '</li></ul>'));
            }
            this.__DOM__.append(this.screenShoot);
            this.__DOM__.append($('<label></label>').addClass('screen-mark').html((new Date(gaitRecord.finishedTimestamp)).Format('yyyy-MM-dd hh:mm:ss S')));
        },
        _startReplayGait: function() {
            if (!this.__GAITRECORD__ || !this.__GAITRECORD__.canvasData || !this.__GAITRECORD__.canvasData.length) return;
            this.controlBar.children('button.btn').each(function(i, n) {
                var ele = $(n).addClass('disabled');
            });
            this.frameIndex = 0;
            this.tmpFrameCanvas = document.createElement('canvas');
            this.tmpFrameCanvas.width = this.__DATA__.binaryImage[0].length;
            this.tmpFrameCanvas.height = this.__DATA__.binaryImage.length;
            this.replayPlayground = $('<div></div>').addClass('replay-playground').append(this.tmpFrameCanvas);
            this.__DOM__.append(this.replayPlayground);
            this.replayGait();
        },
        _delRecordDeleted: function() {},
        _getDom: function() {
            return this.__DOM__;
        },
        _returnCallback: function() {
            this.clearDom();
            this.__DOM__.empty();
            this.__GAITRECORD__ = null;
            this.__DATA__ = null;
            this.canvas = null;
            this.__returnId__ = null;
        },
        _destory: function() {
            this.clearDom();
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__GAITRECORD__ = null;
            this.__DATA__ = null;
            this.canvas = null;
            this.__returnId__ = null;
        }
    };
    return Playground;
})();