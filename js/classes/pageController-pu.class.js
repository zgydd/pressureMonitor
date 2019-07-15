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
        excludeElement: ['loading', 'playground', 'recordlist']
    };
    var activePage = function(id) {
        if (!$('article.over-lay').hasClass('hidden')) $('article.over-lay').addClass('hidden');
        var useConfig = rootScope._get('_ENV_').useConfig;
        if (useConfig.hasOwnProperty('matxTmp')) useConfig = useConfig.matxTmp;
        else useConfig = useConfig.default;
        logic._traverseLocales(__privateCollection__[id].dom, rootScope._get('_ENV_').languageMap[useConfig.lang], useConfig.lang);
        switch (id) {
            case 'playground':
                $('main>.main-container>.playground-container').show();
                $('main>.main-container>.heatmap-container').hide();
                $('main>.main-container>.record-list-container').hide();
                $('main>.main-container>.scale-container').hide();
                break;
            case 'recordlist':
                navController._resetNav('nav-history');
                $('main>.main-container>.playground-container').hide();
                $('main>.main-container>.heatmap-container').hide();
                $('main>.main-container>.record-list-container').show();
                $('main>.main-container>.scale-container').hide();
                break;
            case 'matxTmp':
                $('main>.main-container>.playground-container').hide();
                $('main>.main-container>.heatmap-container').show();
                $('main>.main-container>.record-list-container').hide();
                $('main>.main-container>.scale-container').hide();
                break;
            default:
                break;
        }
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
            linkWidget._actived();
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
            navController._init($('div.nav-container'));
            linkWidget._init($('main>.main-container>.title>div.right'));
            __privateCollection__.playground = {};
            __privateCollection__.playground.instance = new Playground();
            __privateCollection__.playground.dom = __privateCollection__.playground.instance._getDom();
            $('main>.main-container').append(__privateCollection__.playground.dom);
            __privateCollection__.recordlist = {};
            __privateCollection__.recordlist.instance = new Recordlist();
            __privateCollection__.recordlist.dom = __privateCollection__.recordlist.instance._getDom();
            $('main>.main-container').append(__privateCollection__.recordlist.dom);
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
        _activeRecordList: function(type) {
            switch (type) {
                case 'gait':
                    __privateCollection__.recordlist.instance._initGaitList();
                    break;
                case 'keep':
                    __privateCollection__.recordlist.instance._initKeepList();
                    break;
                default:
                    break;
            }
        },
        _activePlayground: function(data, returnId) {
            __privateCollection__.playground.instance._setKeepData(data, returnId);
            activePage('playground');
        },
        _setKeepList: function(data) {
            __privateCollection__.recordlist.instance._setKeepList(data);
            __privateCollection__.recordlist.instance._keepRecordListCallback();
        },
        _getKeepRecord: function(data) {
            __privateCollection__.recordlist.instance._setActivedKeepRecord(data);
            __privateCollection__.recordlist.instance._getKeepRecordCallback();
        },
        _registerDataListener: function() {
            dataLinks._registerListener('constructor', 'pageController_insertPage', insertPage);
            //dataLinks._registerListener('destructor', removePage);
            dataLinks._registerListener('runtime', 'pageController_refresh', refresh);
        },
        _refreshRecordList: function() {
            if (!__privateCollection__.hasOwnProperty('recordlist')) return;
            __privateCollection__.recordlist.instance._initKeepList();
        },
        _deletedRecorDeleted: function(type) {
            switch (type) {
                case 'keepRecord':
                    __privateCollection__.playground._deletedRecorDeleted(type);
                    break;
                default:
                    break;
            }
        }
    };
    return factory;
});