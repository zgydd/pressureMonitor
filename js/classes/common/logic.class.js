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
})("logic", this, function() {
    'use strict';
    var getProductSize = function() {
        var productInfo = runtimeCollection._get('productInfo');
        var activedInfo = runtimeCollection._get('activedInfo');
        if (productInfo || activedInfo) {
            if (productInfo && productInfo.size)
                return JSON.parse(JSON.stringify(productInfo.size));
            if (activedInfo && activedInfo.config && activedInfo.config.size)
                return JSON.parse(JSON.stringify(activedInfo.config.size));
        }
        return { x: 0, y: 0 };

    };
    var traverseLocales = function(childElements) {
        childElements.each(function(i, n) {
            var ele = $(n);
            var attr = ele.attr('z-lang');
            if (attr && (runtimeCollection._get('activedLanguageList').hasOwnProperty(attr) ||
                    (attr === 'sptitle') || (attr.indexOf('spproduct') >= 0))) {
                switch (true) {
                    case (attr === 'sptitle'):
                        var title = runtimeCollection._get('activedInfo').config.title;
                        if (typeof title === 'object' && title.hasOwnProperty(sharingDataSet._get('lang')))
                            ele.html(title[sharingDataSet._get('lang')]);
                        break;
                    case (attr.indexOf('spproduct') >= 0):
                        var title = sharingDataSet._get('activedSysConfig')[attr.replace('spproduct', '')].title;
                        if (typeof title === 'object' && title.hasOwnProperty(sharingDataSet._get('lang')))
                            ele.html(title[sharingDataSet._get('lang')]);
                        break;
                    default:
                        ele.html(runtimeCollection._get('activedLanguageList')[attr]);
                        if (ele.attr('title')) ele.attr('title', runtimeCollection._get('activedLanguageList')[attr]);
                        break;
                }
                return;
            }
            if (ele.children().length) {
                traverseLocales(ele.children());
            }
        });
    };
    var factory = {
        _getProductSize: function() {
            return getProductSize();
        },
        _getProductType: function() {
            var productInfo = runtimeCollection._get('productInfo');
            //var activedInfo = runtimeCollection._get('activedInfo');
            if (productInfo && productInfo.type) return productInfo.type;
            return '';
        },
        _getDefaultRadiusCoefficient: function() {
            var result = 1;
            var productInfo = runtimeCollection._get('productInfo');
            switch (productInfo.type) {
                case 'A1':
                    result = 1.5;
                    break;
                case 'A2':
                case 'A4':
                    result = 2.8;
                    break;
                case 'A3':
                    result = 1.9;
                    break;
                default:
                    break;
            }
            return result;
        },
        _getSymbol: function() {
            var activedLang = runtimeCollection._get('activedLanguageList');
            var symbol = $('<ul></ul>').addClass('heatmap-symbol');
            var symbolRange = heatmapWrapper._getGradientRange();
            symbol.append($('<li></li>').html('<span z-lang="C011">' + activedLang.C011 + '</span>'));
            for (var i = symbolRange.length - 1; i >= 0; i--)
                symbol.append($('<li></li>').html('&nbsp;').css('background-color', symbolRange[i]));
            symbol.append($('<li></li>').html('<span z-lang="C012">' + activedLang.C012 + '</span>'));
            return symbol;
        },
        _getOppositePoint: function(flipType, data) {
            var productSize = getProductSize();
            if (data < 0) data = 0;
            if (flipType === 'V') return ((productSize.x >= data) ? (productSize.x - data) : data);
            else return ((productSize.y >= data) ? (productSize.y - data) : data);

        },
        _setLanguageEnv: function() {
            var language = sharingDataSet._get('lang');
            if (!language) language = navigator.language;
            if (!language) language = navigator.systemLanguage;
            if (!language) language = navigator.userLanguage;
            if (!language || typeof language !== 'string') language = 'zh-cn';
            else language = language.toLowerCase();

            var languageList = commonFunc._getJson('./asset/json/language.json');
            sharingDataSet._set('languageList', languageList);
            runtimeCollection._set('activedLanguageList', languageList[language]);
            sharingDataSet._set('lang', language);
        },
        _traverseLocales: function(childElements) {
            var ele = $('body');
            if (childElements && childElements.length) ele = childElements;
            traverseLocales(ele.children());
        }
    };
    return factory;
});