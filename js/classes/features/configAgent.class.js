;
var Configagent = (function configagentClosure() {
    'use strict';

    function Configagent(productInfo, features) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        var activedValue = '';
        var innerHtml = '';
        var tmpGrpContainer = null;
        if (features.indexOf('M001') >= 0) {
            tmpGrpContainer = $('<div></div>').addClass('in-line');
            tmpGrpContainer.append($('<label z-lang="P023">低值过滤：</label>'));
            activedValue = commonFunc._toInt(this.__userConfig__.lowerLimit);
            innerHtml = '<select id="lowerLimit">';
            for (var i = 0; i < 50; i += 5) {
                innerHtml += '<option value="' + i + '"';
                if (activedValue === i) innerHtml += ' selected';
                innerHtml += '>' + i + '%</option>';
            }
            innerHtml += '</select>';
            this.instanceFilter = $(innerHtml);
            this.instanceFilter.on('change', logic._configEventListener.bind(this));
            tmpGrpContainer.append(this.instanceFilter);
            this.__DOM__.append(tmpGrpContainer);
        }
        if (features.indexOf('C001') >= 0) {
            var langList = ['zh-cn', 'en-us'];
            tmpGrpContainer = $('<div></div>').addClass('in-line');
            tmpGrpContainer.append($('<label z-lang="C013">语言：</label>'));
            activedValue = this.__userConfig__.lang;
            innerHtml = '<select id="lang">';
            for (var i = 0; i < langList.length; i++) {
                innerHtml += '<option value="' + langList[i] + '"';
                if (activedValue === langList[i]) innerHtml += ' selected';
                innerHtml += ' z-lang="' + langList[i] + '">English</option>';
            }
            innerHtml += '</select>';
            this.instanceLangSelect = $(innerHtml);
            this.instanceLangSelect.on('change', logic._configEventListener.bind(this));
            tmpGrpContainer.append(this.instanceLangSelect);
            this.__DOM__.append(tmpGrpContainer);
        }
        if (features.indexOf('W001') >= 0) {
            tmpGrpContainer = $('<div></div>').addClass('in-line');
            tmpGrpContainer.append($('<label z-lang="P026">计时方式：</label>'));
            innerHtml = '<select id="countDownType">';
            activedValue = this.__userConfig__.countDownType;
            innerHtml += '<option value="0" z-lang="P027"'
            if (activedValue === '0') innerHtml += ' selected';
            innerHtml += '>固定计时</option>';
            if (features.indexOf('M002') >= 0) {
                innerHtml += '<option value="1" z-lang="P028"'
                if (activedValue === '1') innerHtml += ' selected';
                innerHtml += '>动态计时</option>';
            }
            innerHtml += '</select>';
            this.instanceCountDownTypeSelect = $(innerHtml);
            this.instanceCountDownTypeSelect.on('change', logic._configEventListener.bind(this));
            tmpGrpContainer.append(this.instanceCountDownTypeSelect);
            this.__DOM__.append(tmpGrpContainer);
        }
        if (features.indexOf('W005') >= 0) {
            tmpGrpContainer = $('<div></div>').addClass('in-line');
            tmpGrpContainer.append($('<label z-lang="P029">高压表示：</label>'));
            activedValue = commonFunc._toInt(this.__userConfig__.levelHighNote);
            innerHtml = '<select id="levelHighNote">';
            for (var i = 0; i < 3; i++) {
                innerHtml += '<option value="' + i + '"';
                if (activedValue === i) innerHtml += ' selected';
                switch (i) {
                    case 0:
                        innerHtml += ' z-lang="C010">无</option>';
                        break;
                    case 1:
                        innerHtml += ' z-lang="P030">数字式</option>';
                        break;
                    case 2:
                        innerHtml += ' z-lang="P031">图像式</option>';
                        break;
                    default:
                        break;
                }
            }
            innerHtml += '</select>';
            this.instanceLevelHighNoteSelect = $(innerHtml);
            this.instanceLevelHighNoteSelect.on('change', logic._configEventListener.bind(this));
            tmpGrpContainer.append(this.instanceLevelHighNoteSelect);
            this.__DOM__.append(tmpGrpContainer);
        }
        if (features.indexOf('W004') >= 0) {
            tmpGrpContainer = $('<div></div>').addClass('in-line');
            tmpGrpContainer.append($('<label z-lang="P032">持续记录：</label>'));
            innerHtml = '<input class="check-box" type="checkbox" id="keepRecord"';
            activedValue = this.__userConfig__.keepRecord;
            if (activedValue) innerHtml += ' checked';
            innerHtml += '/>';
            this.instanceKeepRecord = $(innerHtml);
            this.instanceKeepRecord.on('click', logic._configEventListener.bind(this));
            tmpGrpContainer.append(this.instanceKeepRecord);
            this.__DOM__.append(tmpGrpContainer);
        }
    };
    Configagent.prototype = {
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this.instanceFilter.off('change');
            this.instanceFilter = null;
            this.instanceLangSelect.off('change');
            this.instanceLangSelect = null;
            this.instanceCountDownTypeSelect.off('change');
            this.instanceCountDownTypeSelect = null;
            this.instanceLevelHighNoteSelect.off('change');
            this.instanceLevelHighNoteSelect = null;
            this.instanceKeepRecord.off('click');
            this.instanceKeepRecord = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
            this.__userConfig__ = null;
        }
    };
    return Configagent;
})();