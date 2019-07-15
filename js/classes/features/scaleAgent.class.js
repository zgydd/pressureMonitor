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
        if (!this.__userConfig__.scale) this.__userConfig__.scale = {};
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
            this.baseScale = 0;
            for (var i = 0; i < this.scaleTable.descriptionItem.length; i++) {
                var item = $('<div></div>').addClass('scale-item');
                item.append($('<label></label>').html(this.scaleTable.descriptionItem[i].title));
                var select = $('<select id="' + this.scaleTable.descriptionItem[i].title + '"></select>');
                var tmpNum = 1;
                for (var j = 0; j < this.scaleTable.descriptionItem[i].items.length; j++) {
                    var html = '<option value="' + this.scaleTable.descriptionItem[i].items[j].value + '" ';
                    if (this.__userConfig__.scale && this.__userConfig__.scale.hasOwnProperty(this.scaleTable.descriptionItem[i].title) && commonFunc._chkEqual(this.scaleTable.descriptionItem[i].items[j].value, this.__userConfig__.scale[this.scaleTable.descriptionItem[i].title])) {
                        tmpNum = commonFunc._toInt(this.scaleTable.descriptionItem[i].items[j].value);
                        html += ' selected ';
                    }
                    html += '>' + this.scaleTable.descriptionItem[i].items[j].description + '</option>';
                    select.append(html);
                }
                this.__userConfig__.scale[this.scaleTable.descriptionItem[i].title] = tmpNum;
                this.baseScale += tmpNum;
                select.on('change', logic._scaleEventListener.bind(this));
                item.append(select);
                this.__DOM__.append(item);
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
            this.scaleDom = $('<span></span>').html(theScale);
            this.__DOM__.append($('<div></div>').addClass('scale-item').append($('<label z-lang="C014">Scale</label>')).append(this.scaleDom));
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
            this.__DOM__.children().each(function(i, n) {
                var ele = $(n);
                if (!ele.hasClass('inline-control-panel')) ele.remove();
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
                    this.controlPanel.children().each(function(i, n) {
                        var ele = $(n);
                        ele.removeClass('active');
                        if (this.tmpTarget === ele.html()) ele.addClass('active');
                    });
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
                this.controlPanel.children().each(function(i, n) {
                    var ele = $(n);
                    ele.removeClass('active');
                    if (this.tmpTarget === ele.html()) ele.addClass('active');
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
            this.scaleDom.html(theScale);
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this.controlPanel.empty();
            this.controlPanel = null;
            this.scaleDom.empty();
            this.scaleDom = null;
            this.__features__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
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