;
var Bodypartcollectionagent = (function bodypartcollectionagentClosure() {
    'use strict';

    function Bodypartcollectionagent(productInfo, size, features) {
        this.__ID__ = productInfo.com;
        this.bodyPartCollectionCallbackListener = [];
        this.__DOM__ = $('<div></div>').addClass('viewer');
        var cfg = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__noiseFilter__ = 0;
        if (cfg && cfg.autoCalibration && cfg.noiseFilter) this.__noiseFilter__ = commonFunc._toInt(cfg.noiseFilter);
        this.__size__ = (cfg.size ? cfg.size : {
            x: 32,
            y: 64
        });
        this.__physicalSize__ = (cfg.physicalSize ? cfg.physicalSize : {
            x: 77,
            y: 172.2
        });
        this.__viewWeightFormula__ = (cfg.viewWeightFormula ? cfg.viewWeightFormula : '{0} / 9.80665');
        this.__cavBodySplit__ = document.createElement('canvas');
        $(this.__cavBodySplit__).addClass('body-spliter');
        this.__cavBodySplit__.width = size.width;
        this.__cavBodySplit__.height = size.height;
        this.__cavSpine__ = document.createElement('canvas');
        this.__spineSplitView__ = {
            dom: $('<ul></ul>').addClass('spine-split hidden'),
            head: $('<li z-lang="BPC-head-l"></li>'),
            shoulder: $('<li z-lang="BPC-shoulder-l"></li>'),
            loins: $('<li z-lang="BPC-loins-l"></li>'),
            gluteus: $('<li z-lang="BPC-gluteus-l"></li>'),
            leg: $('<li z-lang="BPC-leg-l"></li>')
        };
        this.inSampling = false;
        this.info = {
            suitScale: 0,
            height: 0,
            weight: 0,
            focus: [],
            areaVariance: {
                head: 0,
                shoulder: 0,
                loins: 0,
                gluteus: 0,
                leg: 0
            }
        };
        this.__spineSplitView__.dom.append(this.__spineSplitView__.head).append(this.__spineSplitView__.shoulder).append(this.__spineSplitView__.loins).append(this.__spineSplitView__.gluteus).append(this.__spineSplitView__.leg);
        $(this.__cavSpine__).addClass('body-spine');
        this._CAVCFG = {
            widthRadius: size.width / this.__size__.y,
            heightRadius: size.height / this.__size__.x
        };
        $('#spineSample').width(this._CAVCFG.widthRadius);
        $('#arrowUp').width(this._CAVCFG.widthRadius);
        $('#arrowDown').width(this._CAVCFG.widthRadius);
        this.__bodypartProportion__ = ((cfg && cfg.bodypartProportion) ? cfg.bodypartProportion : {
            head: '1/8',
            shoulder: '1.5/8',
            loins: '1/8',
            gluteus: '1.2/8',
            leg: '3.3/8'
        });
        //this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.__features__ = features;
        this.__shownInfo__ = {
            head: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            shoulder: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            loins: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            gluteus: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            leg: {
                max: $('<label>0</label>'),
                avg: $('<label>0</label>'),
                area: $('<label>0</label>'),
                percent: $('<label>0</label>'),
                areaVariance: $('<label>0</label>')
            },
            scale: $('<label>0</label>'),
            height: $('<label>--</label>'),
            weight: $('<label>--</label>')
        };
        var arrTitle = ['', 'max', 'avg', 'area', 'percent', 'areaVariance'];
        var arrShown = ['head', 'shoulder', 'loins', 'gluteus', 'leg'];
        var lstShown = $('<ul></ul>').addClass('bpc-shower');
        var lstTitle = $('<ul></ul>');
        for (var i = 0; i < arrTitle.length; i++) {
            lstTitle.append($('<li></li>').append('<label z-lang="BPC-T-' + arrTitle[i] + '">' + arrTitle[i] + '</label>'));
        }
        //lstShown.append($('<li></li>').append(lstTitle));
        for (var i = 0; i < arrShown.length; i++) {
            var lstRow = $('<ul></ul>');
            //lstRow.append($('<li></li>').append('<label z-lang="BPC-' + arrShown[i] + '">' + arrShown[i] + '</label>'));
            for (var j = 1; j < arrTitle.length; j++) {
                lstRow.append($('<li></li>').append(this.__shownInfo__[arrShown[i]][arrTitle[j]]));
            }
            lstShown.append($('<li></li>').append(lstRow));
        }
        lstShown.append($('<li></li>').append($('<ul></ul>') /*.append($('<li z-lang="BPC-scale">SCALE</li>'))*/ .append($('<li></li>').append(this.__shownInfo__.scale))));
        lstShown.append($('<li></li>').append($('<ul></ul>') /*.append($('<li z-lang="C043">Height</li>'))*/ .append($('<li></li>').append(this.__shownInfo__.height)) /*.append($('<li z-lang="C044" style="font-weight: bolder;">Weight</li>'))*/ .append($('<li></li>').append(this.__shownInfo__.weight))));
        this.__DOM__.append(lstShown);
        workerCoordinator._registerWorker(this.__ID__, 'bodyPartCollection', this.bodyPartCollectionCallback.bind(this));
        dataLinks._registerListener('runtime', 'bodyPartCollection_refresh' + this.__ID__, this._refreshData.bind(this));
    };
    Bodypartcollectionagent.prototype = {
        bodyPartCollectionCallback: function(data) {
            try {
                var that = this;
                for (var ele in this.__shownInfo__) {
                    if (!data.hasOwnProperty(ele)) continue;
                    if (typeof data[ele] !== 'object') {
                        if (this.__shownInfo__.hasOwnProperty(ele)) this.__shownInfo__[ele].html(data[ele].toFixed(2));
                        continue;
                    }
                    for (var e in this.__shownInfo__[ele]) {
                        if (!data[ele].hasOwnProperty(e)) continue;
                        this.__shownInfo__[ele][e].html(commonFunc._toFloat(data[ele][e]).toFixed(2));
                    }
                }
                this.info.focus.length = 0;
                $('main>div.right>article.focus-container>div>div').each(function(i, n) {
                    $(n).removeClass('actived');
                    var target = $(n).attr('class');
                    if (data.hasOwnProperty(target) && data[target].percent > 25) {
                        $(n).addClass('actived');
                        that.info.focus.push(target);
                    }
                });
                this.info.areaVariance.head = data.head.areaVariance;
                this.info.areaVariance.shoulder = data.shoulder.areaVariance;
                this.info.areaVariance.loins = data.loins.areaVariance;
                this.info.areaVariance.gluteus = data.gluteus.areaVariance;
                this.info.areaVariance.leg = data.leg.areaVariance;
                //if (data.head.areaVariance > 30) $()
                if (data.hasOwnProperty('height') && data.height) this.info.height = data.height;
                if (data.hasOwnProperty('pValue')) {
                    this.__shownInfo__.weight.html(commonFunc._toFloat(eval(this.__viewWeightFormula__.format(data.pValue))).toFixed(2));
                    this.info.weight = data.pValue;
                }
                var context = this.__cavBodySplit__.getContext('2d');
                context.clearRect(0, 0, this.__cavBodySplit__.width, this.__cavBodySplit__.height);
                if (data.direction !== 0 && data.rangeInfo) {
                    context.strokeStyle = 'rgb(255,0,0)';
                    context.fillStyle = 'rgb(255,0,0)';
                    context.beginPath();
                    context.moveTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                    context.lineTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.iRange.max * this._CAVCFG.heightRadius);
                    context.lineTo(data.rangeInfo.jRange.max * this._CAVCFG.widthRadius, data.rangeInfo.iRange.max * this._CAVCFG.heightRadius);
                    context.lineTo(data.rangeInfo.jRange.max * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                    context.lineTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                    context.stroke();
                    context.closePath();
                    context.save();
                    context.beginPath();
                    if (data.direction > 0) {
                        if (data.rangeInfo.jRange.max - data.rangeInfo.jRange.min < this.__size__.y / 2) this.__spineSplitView__.dom.addClass('hidden');
                        else this.__spineSplitView__.dom.removeClass('hidden');
                        var leftCursor = data.rangeInfo.jRange.min * this._CAVCFG.widthRadius;
                        this.__spineSplitView__.dom.css('margin-left', leftCursor);
                        $(this.__cavSpine__).css('margin-left', leftCursor + this._CAVCFG.widthRadius / 2);
                        for (var i = 0; i < data.rangeInfo.bodyCheckRange.length - 1; i++) {
                            context.moveTo(data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius, data.rangeInfo.iRange.min * this._CAVCFG.heightRadius);
                            context.lineTo(data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius, data.rangeInfo.iRange.max * this._CAVCFG.heightRadius);
                            switch (i) {
                                case 0:
                                    this.__spineSplitView__.head.css('width', data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius - leftCursor);
                                    leftCursor = data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius;
                                    break;
                                case 1:
                                    this.__spineSplitView__.shoulder.css('width', data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius - leftCursor);
                                    leftCursor = data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius;
                                    break;
                                case 2:
                                    this.__spineSplitView__.loins.css('width', data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius - leftCursor);
                                    leftCursor = data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius;
                                    break;
                                case 3:
                                    this.__spineSplitView__.gluteus.css('width', data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius - leftCursor);
                                    leftCursor = data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.widthRadius;
                                    break;
                                default:
                                    break;
                            }
                        }
                        this.__spineSplitView__.leg.css('width', data.rangeInfo.jRange.max * this._CAVCFG.widthRadius - leftCursor);
                    } else {
                        if (data.rangeInfo.iRange.max - data.rangeInfo.iRange.min < this.__size__.x / 2) this.__spineSplitView__.dom.addClass('hidden');
                        else this.__spineSplitView__.dom.removeClass('hidden');
                        this.__spineSplitView__.dom.css('margin-top', data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.heightRadius);
                        for (var i = 0; i < data.rangeInfo.bodyCheckRange.length - 1; i++) {
                            context.moveTo(data.rangeInfo.jRange.min * this._CAVCFG.widthRadius, data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.heightRadius);
                            context.lineTo(data.rangeInfo.jRange.max * this._CAVCFG.widthRadius, data.rangeInfo.bodyCheckRange[i] * this._CAVCFG.heightRadius);
                        }
                    }
                    context.stroke();
                    context.closePath();
                    context.save();
                }
                //console.log(data.spineLine);
                if (data.spineLine && data.spineLine.length) {
                    var spineRange = [99999, 0];
                    var spineAvgLine = 0;
                    var cnt = 0;
                    var spineCavHeight = 150;
                    var midLine = 80;
                    for (var i = 0; i < data.spineLine.length; i++) {
                        spineRange[0] = Math.min(spineRange[0], data.spineLine[i]);
                        spineRange[1] = Math.max(spineRange[1], data.spineLine[i]);
                        if (i > data.rangeInfo.bodyCheckRange[0] - 1 && i < data.rangeInfo.bodyCheckRange[3] - 1) {
                            spineAvgLine += data.spineLine[i];
                            cnt++;
                        }
                    }
                    if (spineAvgLine && cnt) spineAvgLine /= cnt;
                    if (data.direction > 0) {
                        this.__cavSpine__.width = (data.rangeInfo.jRange.max - data.rangeInfo.jRange.min) * this._CAVCFG.widthRadius;
                        $('main>div.left>article.heatmap-container>.human>.spine').width(this.__cavSpine__.width);
                        $('main>div.left>article.heatmap-container>.human>.spine').css('margin-left', data.rangeInfo.jRange.min * this._CAVCFG.widthRadius);
                        $('main>div.left>article.heatmap-container>.human>.spine>canvas').get(0).width = (data.rangeInfo.bodyCheckRange[3] - data.rangeInfo.bodyCheckRange[0] + 1) * this._CAVCFG.widthRadius;
                        $('main>div.left>article.heatmap-container>.human>.spine>canvas').get(0).height = spineCavHeight;
                        $('main>div.left>article.heatmap-container>.human>.spine>canvas').css('margin-left', (data.rangeInfo.bodyCheckRange[0] - data.rangeInfo.jRange.min) * this._CAVCFG.widthRadius)
                        this.__cavSpine__.height = 50;
                    }
                    context = this.__cavSpine__.getContext('2d');
                    context.clearRect(0, 0, this.__cavSpine__.width, this.__cavSpine__.height);
                    context.strokeStyle = 'rgb(129,80,30)';
                    context.lineWidth = 3;
                    var stepWidth = this.__cavSpine__.width / data.spineLine.length;
                    var stepHeight = this.__cavSpine__.height * 0.6 / (spineRange[1] - spineRange[0]);
                    var rangeLeft = 0;
                    var rangeTop = this.__cavSpine__.height * 0.2;
                    /*
                    for (var i = 0; i < data.spineLine.length - 1; i++) {
                        var start = [rangeLeft + i * stepWidth, rangeTop + (data.spineLine[i] - spineRange[0]) * stepHeight];
                        var end = [rangeLeft + (i + 1) * stepWidth, rangeTop + (data.spineLine[i + 1] - spineRange[0]) * stepHeight];
                        var cp = [
                            (start[0] + end[0]) / 2 + (start[1] - end[1]) * 0.3, (start[1] + end[1]) / 2 + (end[0] - start[0]) * 0.3
                        ];
                        context.beginPath();
                        context.moveTo(start[0], start[1]);
                        context.quadraticCurveTo(cp[0], cp[1], end[0], end[1]);
                        context.stroke();
                        context.closePath();
                    }
                    */
                    var img = document.getElementById("spineSample");
                    var imgUp = document.getElementById("arrowUp");
                    var imgDown = document.getElementById("arrowDown");
                    var spineAvg = 0;
                    var spineCheck = {
                        shoulder: [],
                        loins: [],
                        gluteus: []
                    };
                    var ctx = $('main>div.left>article.heatmap-container>.human>.spine>canvas').get(0).getContext('2d');
                    for (var i = 0; i < data.spineLine.length - 2; i += 2) {
                        var start = [rangeLeft + i * stepWidth, rangeTop + (data.spineLine[i] - spineRange[0]) * stepHeight];
                        var end = [rangeLeft + (i + 2) * stepWidth, rangeTop + (data.spineLine[i + 2] - spineRange[0]) * stepHeight];
                        var cp = [rangeLeft + (i + 1) * stepWidth, rangeTop + (data.spineLine[i + 1] - spineRange[0]) * stepHeight];
                        context.beginPath();
                        context.moveTo(start[0], start[1]);
                        context.quadraticCurveTo(cp[0], cp[1], end[0], end[1]);
                        context.stroke();
                        context.closePath();
                        if (i > data.rangeInfo.bodyCheckRange[0] - 1 && i < data.rangeInfo.bodyCheckRange[3] - 1) {
                            var offset = (data.spineLine[i] - spineAvgLine);
                            if (offset > 0) offset *= ((midLine - this._CAVCFG.widthRadius * 2) / (spineRange[1] - spineRange[0]));
                            else offset *= ((spineCavHeight - midLine - this._CAVCFG.widthRadius * 2) / (spineRange[1] - spineRange[0]));
                            ctx.drawImage(img, (i - data.rangeInfo.bodyCheckRange[0]) * this._CAVCFG.widthRadius, midLine + offset, this._CAVCFG.widthRadius, this._CAVCFG.widthRadius);
                            if (offset > 0) ctx.drawImage(imgDown, (i - data.rangeInfo.bodyCheckRange[0]) * this._CAVCFG.widthRadius, midLine + offset + this._CAVCFG.widthRadius + 2, this._CAVCFG.widthRadius, this._CAVCFG.widthRadius);
                            else ctx.drawImage(imgUp, (i - data.rangeInfo.bodyCheckRange[0]) * this._CAVCFG.widthRadius, midLine + offset - this._CAVCFG.widthRadius - 2, this._CAVCFG.widthRadius, this._CAVCFG.widthRadius);
                            offset = (data.spineLine[i + 1] - spineAvgLine);
                            if (offset > 0) offset *= ((midLine - this._CAVCFG.widthRadius * 2) / (spineRange[1] - spineRange[0]));
                            else offset *= ((spineCavHeight - midLine - this._CAVCFG.widthRadius * 2) / (spineRange[1] - spineRange[0]));
                            ctx.drawImage(img, (i - data.rangeInfo.bodyCheckRange[0] + 1) * this._CAVCFG.widthRadius, midLine + offset, this._CAVCFG.widthRadius, this._CAVCFG.widthRadius);
                            if (offset > 0) ctx.drawImage(imgDown, (i - data.rangeInfo.bodyCheckRange[0] + 1) * this._CAVCFG.widthRadius, midLine + offset + this._CAVCFG.widthRadius + 2, this._CAVCFG.widthRadius, this._CAVCFG.widthRadius);
                            else ctx.drawImage(imgUp, (i - data.rangeInfo.bodyCheckRange[0] + 1) * this._CAVCFG.widthRadius, midLine + offset - this._CAVCFG.widthRadius - 2, this._CAVCFG.widthRadius, this._CAVCFG.widthRadius);
                        }
                    }
                    for (var i = Math.ceil(data.rangeInfo.bodyCheckRange[0] - 1); i < data.rangeInfo.bodyCheckRange[3]; i++) {
                        if (spineAvg <= 0) spineAvg = data.spineLine[i];
                        else spineAvg = (spineAvg + data.spineLine[i]) / 2;
                        switch (true) {
                            case (i < data.rangeInfo.bodyCheckRange[1]):
                                if (data.spineLine[i]) spineCheck.shoulder.push(data.spineLine[i]);
                                break;
                            case (i < data.rangeInfo.bodyCheckRange[2]):
                                if (data.spineLine[i]) spineCheck.loins.push(data.spineLine[i]);
                                break;
                            default:
                                if (data.spineLine[i]) spineCheck.gluteus.push(data.spineLine[i]);
                                break;
                        }
                    }
                    var spineScale = 0;
                    var avgShoulder = 0;
                    var avgLoins = 0;
                    var avgGluteus = 0;
                    if (spineCheck.shoulder.length) avgShoulder = eval(spineCheck.shoulder.join('+')) / spineCheck.shoulder.length;
                    if (spineCheck.loins.length) avgLoins = eval(spineCheck.loins.join('+')) / spineCheck.loins.length;
                    if (spineCheck.gluteus.length) avgGluteus = eval(spineCheck.gluteus.join('+')) / spineCheck.gluteus.length;
                    if (avgShoulder > spineAvg) spineScale++;
                    if (avgLoins < spineAvg) spineScale++;
                    if (avgGluteus > spineAvg) spineScale++;
                    if (avgGluteus > avgShoulder) spineScale++;
                    if (Math.max.apply(null, spineCheck.shoulder) > Math.max.apply(null, spineCheck.loins) && Math.max.apply(null, spineCheck.gluteus) > Math.max.apply(null, spineCheck.loins) && Math.max.apply(null, spineCheck.gluteus) > Math.max.apply(null, spineCheck.shoulder)) spineScale++;
                    if (data.shoulder.percent > data.loins.percent && data.gluteus.percent > data.loins.percent && data.gluteus.percent > data.shoulder.percent) spineScale++;
                    var tmpAvg = (data.shoulder.percent + data.loins.percent + data.gluteus.percent) / 3;
                    if (data.shoulder.percent > tmpAvg) spineScale++;
                    if (data.loins.percent < tmpAvg) spineScale++;
                    if (data.gluteus.percent > tmpAvg) spineScale++;
                    if (data.gluteus.percent > data.shoulder.percent) spineScale++;
                    if (spineScale < 1) spineScale = 1;
                    $('#levelScale').removeClass('bad').removeClass('normal').removeClass('good');
                    if (spineScale < 4) $('#levelScale').addClass('bad');
                    else if (spineScale < 7) $('#levelScale').addClass('normal');
                    else $('#levelScale').addClass('good');
                    $('#levelScale').css('width', spineScale * 10 + '%');
                    $('main>div.right>article.level-container>div.scale').html(spineScale);
                    this.info.suitScale = spineScale;
                }
                for (var i = 0; i < this.bodyPartCollectionCallbackListener.length; i++) this.bodyPartCollectionCallbackListener[i].func((this.tmpMatrix ? this.tmpMatrix.clone() : []), data);
                this.__inCollectionRange__ = false;
                this.tmpMatrix = null;
            } catch (e) {
                console.log(e);
            }
        },
        _refreshData: function(id) {
            if (id !== this.__ID__) return;
            if (!this.inSampling) return;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            if (!this.__inCollectionRange__) {
                this.tmpMatrix = dataCollection.matrix.clone();
                this.__inCollectionRange__ = true;
                workerCoordinator._postBodyPartCollectionMessage(JSON.stringify({
                    id: this.__ID__,
                    size: this.__size__,
                    physicalSize: this.__physicalSize__,
                    data: this.tmpMatrix,
                    noiseFilter: this.__noiseFilter__,
                    bodypartProportion: this.__bodypartProportion__
                }));
            }
        },
        _registerListener: function(key, func) {
            commonFunc._registerClosureListener(this.bodyPartCollectionCallbackListener, key, func);
        },
        _unRegisterListener: function(key) {
            commonFunc._unRegisterClosureListener(this.bodyPartCollectionCallbackListener, key);
        },
        _startSampling: function() {
            this.inSampling = true;
        },
        _stopSampling: function() {
            this.inSampling = false;
            $('main>div.right>article.suggest-container>div').fadeOut(800);
            var that = this;
            setTimeout(function() {
                var env = rootScope._get('_ENV_');
                var user = rootScope._get('_USER_');
                var activedLang = env.languageMap[env.useConfig[that.__ID__].lang];
                $('main>div.right>article.suggest-container>div').empty();
                var suggestHtml = '';
                var height = 0;
                var weight = 0;
                var sureFlg = false;
                if (user.height && user.weight) {
                    height = user.height;
                    weight = user.weight;
                    sureFlg = true;
                } else {
                    height = that.info.height;
                    weight = that.info.weight;
                }
                var tmp = '';
                switch (true) {
                    case (height < 155):
                        if (weight < 45) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 60) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 160):
                        if (weight < 45) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 65) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 165):
                        if (weight < 50) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 65) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 170):
                        if (weight < 50) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 70) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 175):
                        if (weight < 55) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 75) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 180):
                        if (weight < 55) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 80) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 185):
                        if (weight < 60) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 85) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 190):
                        if (weight < 65) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 90) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    case (height < 195):
                        if (weight < 70) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 95) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                    default:
                        if (weight < 70) tmp = activedLang['SBM-note-suggest-n2-1'];
                        else if (weight < 100) tmp = activedLang['SBM-note-suggest-n2-2'];
                        else tmp = activedLang['SBM-note-suggest-n2-3'];
                        break;
                }
                if (sureFlg) suggestHtml += activedLang['SBM-note-suggest-n1'].format(tmp);
                else suggestHtml += activedLang['SBM-note-suggest-n1-1'].format(tmp);
                suggestHtml += activedLang['SBM-note-suggest-n3'].format(that.info.suitScale);
                if (!that.info.focus.length) suggestHtml += activedLang['SBM-note-suggest-n4-1'];
                else {
                    suggestHtml += activedLang['SBM-note-suggest-n4-2'];
                    if (that.info.focus.length === 1) suggestHtml += activedLang['BPC-' + that.info.focus[0]];
                    else {
                        for (var i = 0; i < that.info.focus.length - 2; i++) {
                            suggestHtml += activedLang['BPC-' + that.info.focus[i]] + activedLang['SBM-note-suggest-n4-4'];
                        }
                        suggestHtml += activedLang['BPC-' + that.info.focus[that.info.focus.length - 2]] + activedLang['SBM-note-suggest-n4-3'] + activedLang['BPC-' + that.info.focus[that.info.focus.length - 1]];
                    }
                    suggestHtml += activedLang['SBM-note-suggest-n4-5'];
                }
                tmp = [];
                if (that.info.areaVariance.head > 40) tmp.push('head');
                if (that.info.areaVariance.shoulder > 40) tmp.push('shoulder');
                if (that.info.areaVariance.loins > 40) tmp.push('loins');
                if (that.info.areaVariance.gluteus > 40) tmp.push('gluteus');
                if (that.info.areaVariance.leg > 40) tmp.push('leg');
                if (!tmp.length) suggestHtml += activedLang['SBM-note-suggest-n5-1'];
                else {
                    if (tmp.length === 1) suggestHtml += activedLang['BPC-' + tmp[0]];
                    else {
                        for (var i = 0; i < tmp.length - 2; i++) {
                            suggestHtml += activedLang['BPC-' + tmp[i]] + activedLang['SBM-note-suggest-n4-4'];
                        }
                        suggestHtml += activedLang['BPC-' + tmp[tmp.length - 2]] + activedLang['SBM-note-suggest-n4-3'] + activedLang['BPC-' + tmp[tmp.length - 1]];
                    }
                    suggestHtml += activedLang['SBM-note-suggest-n5-2'];
                }
                $('main>div.right>article.suggest-container>div').addClass('sug-note').html(suggestHtml);
                $('main>div.right>article.suggest-container>div').fadeIn(1000);
                user.id = commonFunc._getRandomKey(10);
                user.height = 0;
                user.weight = 0;
            }, 800);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _getCanvas: function() {
            return this.__cavBodySplit__;
        },
        _getSpine: function() {
            return this.__cavSpine__;
        },
        _getSpineView: function() {
            return this.__spineSplitView__.dom;
        },
        _destroy: function() {
            dataLinks._unRegisterListener('runtime', 'bodyPartCollection_refresh' + this.__ID__);
            workerCoordinator._unRegisterWorker(this.__ID__, 'bodyPartCollection');
            this.__shownInfo__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__cavBodySplit__ = null;
            this.__cavSpine__ = null;
            this.__spineSplitView__.dom.empty();
            this.__spineSplitView__ = null;
            this._CAVCFG = null;
            this.__bodypartProportion__ = null;
            this.__features__ = null;
            this.__size__ = null;
            this.__physicalSize__ = null;
            this.__viewWeightFormula__ = null;
            this.__ID__ = null;
            this.tmpMatrix = null;
            this.bodyPartCollectionCallbackListener.length = 0;
            this.bodyPartCollectionCallbackListener = null;
        }
    };
    return Bodypartcollectionagent;
})();