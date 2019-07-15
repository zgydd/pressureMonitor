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
        excludeElement: ['loading', 'navigation', 'playground', 'recordlist']
    };
    var activePage = function(id) {
        //if (!rootScope._get('_RUNTIME_').inited) return;
        if (!__privateCollection__.hasOwnProperty(id)) {
            for (var ele in __privateCollection__) {
                if (__privateCollection__[ele].dom.hasClass('actived-container')) __privateCollection__[ele].dom.removeClass('actived-container');
                __privateCollection__['navigation'].dom.addClass('actived-container');
            }
            return;
        }
        var comKey = 'default';
        if (__privateConstant__.excludeElement.indexOf(id) < 0) comKey = id;
        var useConfig = rootScope._get('_ENV_').useConfig;
        if (!useConfig || !useConfig.hasOwnProperty(id)) comKey = 'default';
        logic._traverseLocales(__privateCollection__[id].dom, rootScope._get('_ENV_').languageMap[useConfig[comKey].lang], useConfig[comKey].lang);
        for (var ele in __privateCollection__) {
            if (__privateCollection__[ele].dom.hasClass('actived-container')) __privateCollection__[ele].dom.removeClass('actived-container');
            if (ele === id) __privateCollection__[ele].dom.addClass('actived-container');
        }
    };
    var navButtonClick = function(event) {
        event.stopPropagation();
        var id = event.target.id;
        if (!id || typeof id !== 'string') return;
        id = id.replace('nav-btn-', '');
        activePage(id);
    };
    var dualNav = function(id, isInsert) {
        var navContainer = $('main>article.navigation-container>section');
        if (!navContainer || !navContainer.length) return;
        if (isInsert) {
            var dataTag = dataLinks._getTarget(id);
            if (!dataTag || !dataTag.hasOwnProperty('productInfo') || !dataTag.productInfo.hasOwnProperty('type')) return;
            var targetConfig = rootScope._get('_ENV_').systemConfig[dataTag.productInfo.type];
            if (!targetConfig) return;
            var targetBtn = $('<button id="nav-btn-' + id + '"><span id="' + id + '" z-lang="sptitle">' + targetConfig.title['zh-cn'] + '</span><span id="' + id + '">' + id + '</span></button>').addClass('btn');
            targetBtn.on('click', navButtonClick);
            navContainer.append(targetBtn);
        } else {
            $('main>article.navigation-container>section>#nav-btn-' + id).off('click');
            $('main>article.navigation-container>section>#nav-btn-' + id).remove();
        }
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
        else activePage('navigation');
    };
    var insertPage = function(id) {
        var dataTag = dataLinks._getTarget(id);
        if (!dataTag || !dataTag.hasOwnProperty('productInfo')) return;
        if (__privateCollection__.hasOwnProperty(id)) return;
        var useConfig = rootScope._get('_ENV_').useConfig;
        if (!useConfig.hasOwnProperty(id)) useConfig[id] = JSON.parse(JSON.stringify(useConfig.default));
        __privateCollection__[id] = {};
        __privateCollection__[id].instance = new Pagetemplate(dataTag.productInfo, $('main'));
        __privateCollection__[id].dom = __privateCollection__[id].instance._getDom();
        $('main').append(__privateCollection__[id].dom);
        dualNav(id, true);
        checkPageList();
    };
    var removePage = function(id) {
        $('main>#' + id).remove();
        try {
            __privateCollection__[id].instance._destroy();
        } catch (e) {}
        delete __privateCollection__[id];
        dualNav(id, false);
        checkPageList();
    };
    var refresh = function(id) {
        try {
            __privateCollection__[id].instance._refresh();
        } catch (e) {}
    };
    var factory = {
        _init: function() {
            __privateCollection__.loading = {};
            __privateCollection__.loading.instance = null;
            __privateCollection__.loading.dom = $('<article></article>').addClass('loading-container').addClass('actived-container');
            __privateCollection__.loading.dom.append($('<div></div>').addClass('loader-ring').append($('<div></div>').addClass('loader-ring-light')).append($('<div></div>').addClass('loader-ring-track')));
            $('main').append(__privateCollection__.loading.dom);
            __privateCollection__.navigation = {};
            __privateCollection__.navigation.instance = null;
            var aGaitHistory = $('<a z-lang="F-W003">步态分析</a>').addClass('title-link left');
            aGaitHistory.on('click', logic._activeGaitListListener);
            var aKeepHistory = $('<a z-lang="F-W004">持久时间记录</a>').addClass('title-link right');
            aKeepHistory.on('click', logic._activeKeepRecordsListListener);
            var titleContainer = $('<div></div>').append(aGaitHistory).append($('<label z-lang="L016">已发现设备</label>')).append(aKeepHistory);
            __privateCollection__.navigation.dom = $('<article></article>').addClass('navigation-container').append(titleContainer).append($('<section></section>'));
            $('main').append(__privateCollection__.navigation.dom);
            __privateCollection__.playground = {};
            __privateCollection__.playground.instance = new Playground();
            __privateCollection__.playground.dom = __privateCollection__.playground.instance._getDom();
            $('main').append(__privateCollection__.playground.dom);
            __privateCollection__.recordlist = {};
            __privateCollection__.recordlist.instance = new Recordlist();
            __privateCollection__.recordlist.dom = __privateCollection__.recordlist.instance._getDom();
            $('main').append(__privateCollection__.recordlist.dom);
        },
        _insertPage: function(id) {
            insertPage(id);
        },
        _activePage: function(id) {
            activePage(id);
        },
        _activePlayground: function(data, gaitRecord, returnId) {
            __privateCollection__.playground.instance._setGaitData(data, gaitRecord, returnId);
            activePage('playground');
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
        _setGaitList: function(data) {
            __privateCollection__.recordlist.instance._setGaitList(data);
            __privateCollection__.recordlist.instance._gaitListCallback();
        },
        _getGaitRecord: function(data) {
            __privateCollection__.recordlist.instance._setActivedGaitRecord(data);
            __privateCollection__.recordlist.instance._getGaitRecordCallback();
        },
        _registerDataListener: function() {
            dataLinks._registerListener('constructor', 'pageController_insertPage', insertPage);
            dataLinks._registerListener('destructor', 'pageController_removePage', removePage);
            dataLinks._registerListener('runtime', 'pageController_refresh', refresh);
        },
        _infoTarget: function(id) {
            $('main>article.navigation-container>section>#nav-btn-' + id).addClass('arrow_box');
        },
        _removeInfoTarget: function(id) {
            $('main>article.navigation-container>section>#nav-btn-' + id).removeClass('arrow_box');
        },
        _setDefaultScale: function(id, data) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._setDefaultScale(data);
        },
        _setActivedScale: function(id, data) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._setActivedScale(data);
        },
        _setChangedScale: function(id, data) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._setChangedScale(data);
        },
        _setDeterminedScale: function(id, data) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._setDeterminedScale(data);
        },
        _gaitRecordSaved: function(id) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._gaitRecordSaved();
        },
        _keepRecordSaved: function(id) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._keepRecordSaved();
        },
        _saveRecordSaved: function(id) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._saveRecordSaved();
        },
        _outputCSVSaved: function(id) {
            if (!__privateCollection__.hasOwnProperty(id)) return;
            __privateCollection__[id].instance._outputCSVSaved();
        },
        _deletedRecorDeleted: function(type) {
            switch (type) {
                case 'gaitRecord':
                    __privateCollection__.playground._delRecordDeleted(type);
                    break;
                default:
                    __privateCollection__[id].instance._delRecordDeleted(type);
                    break;
            }
        }
    };
    return factory;
});