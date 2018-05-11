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
})("contentHeader", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        commonFunc._traverseClearEvent(__self__);
        __self__.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };
    var getLocalizeCtrl = function() {
        var activedInfo = runtimeCollection._get('activedInfo') || null;
        if (!activedInfo) return '';
        if (!activedInfo || !activedInfo.config || !activedInfo.config.features || !commonFunc._isArray(activedInfo.config.features)) return '';
        if (activedInfo.category !== 'wait' && (!activedInfo.config || !activedInfo.config.features || !commonFunc._isArray(activedInfo.config.features)))
            return '';
        if (activedInfo.category !== 'wait' && activedInfo.config.features.indexOf('C001') < 0) return '';
        var supportedLangs = sharingDataSet._get('languageList');
        if (!supportedLangs) return '';
        var language = sharingDataSet._get('lang') || 'zh-cn';
        var activedLang = runtimeCollection._get('activedLanguageList');
        var html = '<ul id="languageController"><i class="fa icon-globe"></i><span z-lang="C013">' + activedLang.C013 + '</span>';
        for (var ele in supportedLangs) {
            html += '<li id="' + ele + '" class="localize-item hidden">' + activedLang[ele] + '</li>';
        }
        html += '</ul>';
        return html;
    };
    var registerLocalizeEventListener = function() {
        $('#languageController').on('click', function(event) {
            event.stopPropagation();
            if ($('#languageController>li.localize-item').hasClass('hidden'))
                $('#languageController>li.localize-item').removeClass('hidden');
            else $('#languageController>li.localize-item').addClass('hidden');
        });
        $('body').on('click', function() {
            $('#languageController>li.localize-item').addClass('hidden');
        });
        $('#languageController>li.localize-item').on('click', function(event) {
            event.stopPropagation();
            if (sharingDataSet._get('lang') !== event.target.id) {
                sharingDataSet._set('lang', event.target.id);
                runtimeCollection._set('activedLanguageList', sharingDataSet._get('languageList')[event.target.id]);
                logic._traverseLocales();
            }
            $('#languageController>li.localize-item').addClass('hidden');
        });
    };
    var setWait = function() {
        var activedLang = runtimeCollection._get('activedLanguageList');
        var html = '<div class="main-header-left"><span z-lang="C005">' + activedLang.C005 + '</span></div><div class="main-header-right">';
        html += getLocalizeCtrl();
        html += '<img src="./asset/images/offline.png" /></div>';
        __self__.html(html);
        registerLocalizeEventListener();
    };
    var setProduct = function(title) {
        var showTitle = '';
        if (typeof title === 'string') showTitle = title;
        else showTitle = title[sharingDataSet._get('lang')];
        var html = '<div class="main-header-left"><span z-lang="sptitle">' + showTitle + '</span></div><div class="main-header-right">';
        html += getLocalizeCtrl();
        html += '<img src="./asset/images/online.png" /></div>';
        __self__.html(html);
        registerLocalizeEventListener();
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>');
            switch (activedInfo.category) {
                case 'wait':
                    setWait();
                    break;
                default:
                    break;
            }
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
            registerLocalizeEventListener();
        },
        _setProduct: function() {
            var activedInfo = runtimeCollection._get('activedInfo');
            if (!activedInfo || !activedInfo.config) return false;

            try {
                clearSelf();
                setProduct((activedInfo.config.title || 'UNKNOWN'));
                return true;
            } catch (e) {
                console.log(e.message);
                return false;
            }
        }
    };

    return factory;
});