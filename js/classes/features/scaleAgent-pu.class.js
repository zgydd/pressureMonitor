;
var Scaleagent = (function scaleagentClosure() {
    'use strict';

    function Scaleagent(productInfo, features) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__features__ = features;
        this.__scaleList__ = rootScope._get('_ENV_').scaleList;
        this.scaleTableFlg = 0;
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this._homeScaleHock_ = $('#homeScaleNumber');
        if (!this.__userConfig__.scale) this.__userConfig__.scale = {};
        this.__DOM__.append('<label class="note" z-lang="N002"></label>');
        this.controlPanel = $('<div></div>').addClass('inline-control-panel');
        this.__DOM__.append(this.controlPanel);
        var env = rootScope._get('_ENV_');
        if (!this.__userConfig__.defaultScale || !this.__scaleList__.length || this.__scaleList__.indexOf(this.__userConfig__.defaultScale) < 0) {
            if (!env.testMode) {
                logic._interfaceConnecter('scaleRoot1', this, env);
            } else {
                this.scaleTable = commonFunc._getJson('./assets/jsons/MTS_0' + this.__userConfig__.lang + '.scale');
                this._defaultScaleTableCallback();
            }
        } else {
            if (!env.testMode) {
                logic._interfaceConnecter('scaleRoot2', this, env);
            } else {
                this.scaleTable = io._getScaleTable(this.__userConfig__.defaultScale);
                this._activedScaleTableCallback();
            }
            this.scaleTableFlg++;
        }
    };
    Scaleagent.prototype = {
        createScaleDom: function() {
            $('#homeScaleTableName').html(this.scaleTable.title);
            var tmpStack = rootScope._get('_STACK_') || {};
            tmpStack.scaleTableName = this.scaleTable.title;
            rootScope._set('_STACK_', tmpStack);
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__ID__].lang];
            this.baseScale = 0;
            var itemScaleList = [];
            for (var i = 0; i < this.scaleTable.descriptionItem.length; i++) {
                for (var j = 0; j < this.scaleTable.descriptionItem[i].items.length; j++) {
                    var value = commonFunc._toInt(this.scaleTable.descriptionItem[i].items[j].value);
                    if (itemScaleList.indexOf(value) >= 0) continue;
                    itemScaleList.push(value);
                }
            }
            itemScaleList.sort();
            var html = '<table><thead>';
            html += '<th z-lang="M002-item">' + activedLang['M002-item'] + '</th>';
            for (var i = 0; i < itemScaleList.length; i++) html += '<th>' + itemScaleList[i] + '</th>';
            html += '</thead>';
            for (var i = 0; i < this.scaleTable.descriptionItem.length; i++) {
                var tmpNum = 1;
                html += '<tr>';
                html += '<td>' + this.scaleTable.descriptionItem[i].title + '</td>';
                for (var j = 0; j < this.scaleTable.descriptionItem[i].items.length; j++) {
                    for (var k = j; k < itemScaleList.length; k++) {
                        if (commonFunc._toInt(this.scaleTable.descriptionItem[i].items[j].value) === itemScaleList[k]) {
                            html += '<td><input item="' + this.scaleTable.descriptionItem[i].title + '" type="radio" name="feRow_' + i + '" value=' + itemScaleList[k];
                            if (this.__userConfig__.scale && this.__userConfig__.scale.hasOwnProperty(this.scaleTable.descriptionItem[i].title) && commonFunc._chkEqual(this.scaleTable.descriptionItem[i].items[j].value, this.__userConfig__.scale[this.scaleTable.descriptionItem[i].title])) {
                                tmpNum = commonFunc._toInt(this.scaleTable.descriptionItem[i].items[j].value);
                                html += ' checked ';
                            }
                            html += ' />' + this.scaleTable.descriptionItem[i].items[j].description + '</td>';
                            break;
                        } else {
                            html += '<td></td>';
                        }
                    }
                }
                html += '</tr>';
                this.__userConfig__.scale[this.scaleTable.descriptionItem[i].title] = tmpNum;
                this.baseScale += tmpNum;
            }
            if (this.scaleTable.presureRange) this.pressureScale = commonFunc._toInt(this.scaleTable.presureRange);
            var theScale = this.baseScale + this.pressureScale;
            if (this.scaleTable.threshold && this.scaleTable.threshold.length) {
                for (var i = 0; i < this.scaleTable.threshold.length; i++) {
                    if (this.scaleTable.threshold[i].min <= theScale && this.scaleTable.threshold[i].max >= theScale) {
                        this.activedCountDown = this.scaleTable.threshold[i].rangeTime * 60;
                        break;
                    }
                }
            }
            html += '</table>';
            this.__DOM__.append($('<div></div>').addClass('scale-table').append(html));
            this.scaleDom = $('<span></span>');
            this.timeDom = $('<span></span>');
            this.__DOM__.append($('<div></div>').addClass('scale-desc').append($('<label z-lang="C014">' + activedLang.C014 + '</label>')).append(this.scaleDom).append($('<label z-lang="M002-scale-time">' + activedLang['M002-scale-time'] + '</label>')).append(this.timeDom));
            var that = this;
            setTimeout(function() {
                that.setScaleDesc(theScale);
                $('div.scale-table td>input').on('click', that.scaleEventListener.bind(that));
            }, 0);
        },
        setScaleDesc: function(scale) {
            this.scaleDom.html(scale);
            this._homeScaleHock_.html(scale);
            if (this.scaleTable && commonFunc._isArray(this.scaleTable.threshold)) {
                var env = rootScope._get('_ENV_');
                var activedLang = env.languageMap[env.useConfig[this.__ID__].lang];
                for (var i = 0; i < this.scaleTable.threshold.length; i++) {
                    if (scale <= this.scaleTable.threshold[i].max && scale >= this.scaleTable.threshold[i].min) {
                        this.timeDom.html(this.scaleTable.threshold[i].description + '&nbsp;' + this.scaleTable.threshold[i].rangeTime + '<span z-lang="C008">' + activedLang.C008 + '</span>');
                        switch (true) {
                            case (i / this.scaleTable.threshold.length < 0.25):
                                this.timeDom.removeClass('text-warning text-info text-success');
                                this.scaleDom.removeClass('text-warning text-info text-success');
                                this.timeDom.addClass('text-danger');
                                this.scaleDom.addClass('text-danger');
                                break;
                            case (i / this.scaleTable.threshold.length < 0.5):
                                this.timeDom.removeClass('text-danger text-info text-success');
                                this.scaleDom.removeClass('text-danger text-info text-success');
                                this.timeDom.addClass('text-warning');
                                this.scaleDom.addClass('text-warning');
                                break;
                            case (i / this.scaleTable.threshold.length < 0.75):
                                this.timeDom.removeClass('text-danger text-warning text-success');
                                this.scaleDom.removeClass('text-danger text-warning text-success');
                                this.timeDom.addClass('text-info');
                                this.scaleDom.addClass('text-info');
                                break;
                            default:
                                this.timeDom.removeClass('text-danger text-warning text-info');
                                this.scaleDom.removeClass('text-danger text-warning text-info');
                                this.timeDom.addClass('text-success');
                                this.scaleDom.addClass('text-success');
                                break;
                        }
                        break;
                    }
                }
            }
        },
        scaleEventListener: function(event) {
            var target = rootScope._get('_ENV_').useConfig[this.__ID__];
            if (!target) return;
            if (!target.scale) target.scale = {};
            target.scale[$(event.target).attr('item')] = commonFunc._toFloat($("input[name='" + $(event.target).attr('name') + "']:checked").val());
            this._refreshScale();
        },
        _setScaleTable: function(data) {
            this.scaleTable = data;
        },
        _defaultScaleTableCallback: function() {
            if (!this.scaleTable || !commonFunc._isArray(this.scaleTable.descriptionItem) || !commonFunc._isArray(this.scaleTable.threshold)) {
                var env = rootScope._get('_ENV_');
                this.scaleTableFlg--;
                if (!env.testMode) {
                    logic._interfaceConnecter('scaleDefaultScaleTable', this, env);
                } else {
                    this.scaleTable = commonFunc._getJson('./assets/jsons/MTS_0' + this.__userConfig__.lang + '.scale');
                    this._activedScaleTableCallback();
                }
            } else this._activedScaleTableCallback();
        },
        _activedScaleTableCallback: function() {
            if (!this.__scaleList__.length) this.controlPanel.append($('<button z-lang="C015">内置</button>').addClass('btn active'));
            else {
                for (var i = 0; i < this.__scaleList__.length; i++) {
                    var tmpBtn = $('<button>' + this.__scaleList__[i] + '</button>').addClass('btn');
                    if (this.scaleTableFlg > 0 && this.__userConfig__.defaultScale === this.__scaleList__[i]) tmpBtn.addClass('active');
                    tmpBtn.on('click', this._changeScaleTable.bind(this));
                    this.controlPanel.append(tmpBtn);
                }
            }
            this._changeScaleTable();
        },
        _changeScaleTable: function(event) {
            if (event && event.target && this.__userConfig__.defaultScale === $(event.target).html()) return;
            this.__DOM__.children().each(function(i, n) {
                var ele = $(n);
                if (!ele.hasClass('inline-control-panel') && !ele.hasClass('note')) {
                    commonFunc._traverseClearEvent(ele);
                    ele.remove();
                }
            });
            this.tmpTarget = this.__userConfig__.defaultScale;
            if (event && event.target) {
                this.tmpTarget = $(event.target).html();
                var env = rootScope._get('_ENV_');
                if (!env.testMode) {
                    logic._interfaceConnecter('scaleChangedScaleTable', this, env);
                } else {
                    this.scaleTable = io._getScaleTable(this.tmpTarget);
                    this._changedScaleTableCallback();
                }
            } else {
                if (this.tmpTarget) {
                    var that = this;
                    this.controlPanel.children().each(function(i, n) {
                        var ele = $(n);
                        ele.removeClass('active');
                        if (that.tmpTarget === ele.html()) {
                            ele.addClass('active');
                            that.hasActived = true;
                        }
                    });
                    if (!that.hasActived) $(this.controlPanel.children('button').get(0)).addClass('active');
                }
                this.__userConfig__.defaultScale = this.tmpTarget;
                this.tmpTarget = null;
                this.createScaleDom();
            }
        },
        _changedScaleTableCallback: function() {
            if (!this.scaleTable) {
                this.tmpTarget = 0;
                var env = rootScope._get('_ENV_');
                if (!env.testMode) {
                    logic._interfaceConnecter('scaleDeterminedScaleTable', this, env);
                } else {
                    this.scaleTable = commonFunc._getJson('./assets/jsons/MTS_0' + this.__userConfig__.lang + '.scale');
                    this._determinedScaleTableCallback();
                }
            } else this._determinedScaleTableCallback();
        },
        _determinedScaleTableCallback: function() {
            if (this.tmpTarget) {
                var that = this;
                this.controlPanel.children().each(function(i, n) {
                    var ele = $(n);
                    ele.removeClass('active');
                    if (that.tmpTarget === ele.html()) ele.addClass('active');
                });
            }
            this.__userConfig__.defaultScale = this.tmpTarget;
            this.tmpTarget = null;
            this.createScaleDom();
        },
        _refreshScale: function() {
            this.baseScale = 0;
            for (var i = 0; i < this.scaleTable.descriptionItem.length; i++) {
                if (this.__userConfig__.scale.hasOwnProperty(this.scaleTable.descriptionItem[i].title)) this.baseScale += commonFunc._toInt(this.__userConfig__.scale[this.scaleTable.descriptionItem[i].title]);
                else this.baseScale += 1;
            }
            var theScale = this.baseScale + this.pressureScale;
            if (this.scaleTable.threshold && this.scaleTable.threshold.length) {
                for (var i = 0; i < this.scaleTable.threshold.length; i++) {
                    if (this.scaleTable.threshold[i].min <= theScale && this.scaleTable.threshold[i].max >= theScale) {
                        this.activedCountDown = this.scaleTable.threshold[i].rangeTime * 60;
                        this.needReset = true;
                        break;
                    }
                }
            }
            this.setScaleDesc(theScale);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this.controlPanel.empty();
            this.controlPanel = null;
            this.scaleDom.empty();
            this.scaleDom = null;
            this.timeDom.empty();
            this.timeDom = null;
            this.__features__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this._homeScaleHock_ = null;
            this.__ID__ = null;
            this.__scaleList__ = null;
            this.__userConfig__ = null;
            this.scaleTable = null;
            this.baseScale = null;
            this.pressureScale = null;
            this.activedCountDown = null;
            this.needReset = null;
        }
    };
    return Scaleagent;
})();