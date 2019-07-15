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
        if (features.indexOf('C001') >= 0) {
            var langList = ['zh-cn', 'en-us'];
            tmpGrpContainer = $('<div></div>').addClass('in-line');
            tmpGrpContainer.append('<i class="fas fa-language fa-lg"></i>').append($('<label z-lang="C013">语言：</label>'));
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
    };
    Configagent.prototype = {
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
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