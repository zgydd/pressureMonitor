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
})("pageController", this, function() {
    'use strict';
    var __privateCollection__ = {};
    var __privateConstant__ = {
        excludeElement: ['loading']
    };
    var activePage = function(id) {
        if (!$('article.over-lay').hasClass('hidden')) $('article.over-lay').addClass('hidden');
        if ($('main>div.left').hasClass('hidden')) $('main>div.left').removeClass('hidden');
        if ($('main>div.right').hasClass('hidden')) $('main>div.right').removeClass('hidden');
        var useConfig = rootScope._get('_ENV_').useConfig;
        if (useConfig.hasOwnProperty('matxTmp')) useConfig = useConfig.matxTmp;
        else useConfig = useConfig.default;
        logic._traverseLocales(__privateCollection__[id].dom, rootScope._get('_ENV_').languageMap[useConfig.lang], useConfig.lang);
    };
    var insertPage = function(id) {
        var dataTag = dataLinks._getTarget(id);
        if (!dataTag || !dataTag.hasOwnProperty('productInfo')) return;
        if (__privateCollection__.hasOwnProperty(id)) return;
        var useConfig = rootScope._get('_ENV_').useConfig;
        if (!useConfig.hasOwnProperty(id)) useConfig[id] = JSON.parse(JSON.stringify(useConfig.default));
        __privateCollection__[id] = {};
        __privateCollection__[id].instance = new Pagetemplate(dataTag.productInfo);
        checkPageList();
    };
    var refresh = function(id) {
        try {
            if (!$('article.over-lay-disconnect').hasClass('hidden')) $('article.over-lay-disconnect').addClass('hidden');
            __privateCollection__[id].instance._refresh();
        } catch (e) {}
    };
    var checkPageList = function() {
        var containerCount = 0;
        var arrTmp = [];
        for (var ele in __privateCollection__) {
            if (__privateConstant__.excludeElement.indexOf(ele) < 0) {
                arrTmp.push(ele);
                containerCount++;
            }
        }
        if (containerCount === 1) activePage(arrTmp[0]);
    };
    var disConnctCallback = function(id) {
        if ($('article.over-lay-disconnect').hasClass('hidden')) $('article.over-lay-disconnect').removeClass('hidden');
    };
    var factory = {
        _init: function() {
            matxAddonPool._registerListener('disConnect', 'pageController_disConnect', disConnctCallback.bind(this));
        },
        _insertPage: function(id) {
            insertPage(id);
        },
        _activePage: function(id) {
            activePage(id);
        },
        _activeNav: function(id) {
            __privateCollection__['matxTmp'].instance._changeNav(id);
        },
        _registerDataListener: function() {
            dataLinks._registerListener('constructor', 'pageController_insertPage', insertPage);
            //dataLinks._registerListener('destructor', removePage);
            dataLinks._registerListener('runtime', 'pageController_refresh', refresh);
        }
    };
    return factory;
});