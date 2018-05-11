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
})("navMenu", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __activedPage__ = null;

    var __listener__ = { itemChangedListener: [] };

    var registerItemChangedListener = function(func) {
        commonFunc._registerListener(__listener__.itemChangedListener, func);
    };
    var unRegisterItemChangedListener = function(func) {
        commonFunc._unRegisterListener(__listener__.itemChangedListener, func);
    };

    var setWait = function() {
        var activedLang = runtimeCollection._get('activedLanguageList');
        __self__.append($('<li></li>').addClass('disabled').html('<img src="./asset/images/heatmap.png" /><span z-lang="N001">' + activedLang.N001 + '</span>'));
        __self__.append($('<li></li>').addClass('disabled').html('<img src="./asset/images/scale.png" /><span z-lang="N002">' + activedLang.N002 + '</span>'));
        //__self__.append($('<li></li>').addClass('disabled').html('<img src="./asset/images/records.png" /><span>历史</span>'));

        var liItem = document.createElement('li');
        liItem.id = 'left-menu-records';
        liItem = $(liItem);
        liItem.html('<img src="./asset/images/records.png" /><span z-lang="N003">' + activedLang.N003 + '</span>');
        __self__.append(liItem);
        liItem.on('click', contentBody._setWaitAvailableContainer);
        __self__.append($('<li></li>').addClass('disabled').html('<img src="./asset/images/set.png" /><span z-lang="N004">' + activedLang.N004 + '</span>'));
    };

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

    var changeSelectListener = function() {
        var target = arguments[0] || null;
        if (target) target = target.target;
        if (target && !target.id) target = $(target).parents('li').length ? $(target).parents('li').get(0) : target;
        var menu = $('.main-left-menu > li > .left-menu-content > li');
        if (!menu || !menu.length) return;
        var activeId = null;
        menu.each(function(i, n) {
            if (target) activeId = target.id;
            else if ($(n).hasClass('selected')) activeId = n.id;
        });
        if (!activeId) return;
        var activedInfo = runtimeCollection._get('activedInfo');
        if (activedInfo.activedContainer === activeId) return;
        menu.each(function(i, n) {
            $(n).removeClass('selected');
            if (n.id == activeId) $(n).addClass('selected');
        });
        activedInfo.activedContainer = activeId;
        for (var i = 0; i < __listener__.itemChangedListener.length; i++)
            __listener__.itemChangedListener[i]();
        /*
        switch (activeId) {
            case 'left-menu-heatmap':
                break;
            case 'left-menu-scale':
                break;
            case 'left-menu-records':
                break;
            case 'left-menu-set':
                break;
            default:
                break;
        }
        runtimeCollection._set('startTimestamp', 0);
        runtimeCollection._set('finishedTimestamp', 0);
        runtimeCollection._set('canvasData', []);
        sharingDataSet._delete('inGaitFlg');
        pageBuilder._clearContentBody();
        */
    };

    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<ul></ul>').addClass('left-menu-content');
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
        },
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'itemChanged':
                    registerItemChangedListener(func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'itemChanged':
                    unRegisterItemChangedListener(func);
                    break;
                default:
                    break;
            }
        },
        _setProduct: function() {
            var activedInfo = runtimeCollection._get('activedInfo');
            if (!activedInfo || !activedInfo.config) return false;

            try {
                var activedLang = runtimeCollection._get('activedLanguageList');
                clearSelf();

                var liItem = null;
                if (activedInfo.config.features.indexOf('M001') >= 0) {
                    liItem = document.createElement('li');
                    liItem.id = 'left-menu-heatmap';
                    liItem = $(liItem);
                    liItem.html('<img src="./asset/images/heatmap.png" /><span z-lang="N001">' + activedLang.N001 + '</span>');
                    liItem.addClass('selected');
                    __self__.append(liItem);
                    liItem.on('click', changeSelectListener);
                }
                if (activedInfo.config.features.indexOf('M002') >= 0) {
                    liItem = document.createElement('li');
                    liItem.id = 'left-menu-scale';
                    liItem = $(liItem);
                    liItem.html('<img src="./asset/images/scale.png" /><span z-lang="N002">' + activedLang.N002 + '</span>');
                    __self__.append(liItem);
                    liItem.on('click', changeSelectListener);
                }
                if (activedInfo.config.features.indexOf('W003') >= 0 ||
                    activedInfo.config.features.indexOf('W004') >= 0) {
                    liItem = document.createElement('li');
                    liItem.id = 'left-menu-records';
                    liItem = $(liItem);
                    liItem.html('<img src="./asset/images/records.png" /><span z-lang="N003">' + activedLang.N003 + '</span>');
                    __self__.append(liItem);
                    liItem.on('click', changeSelectListener);
                }
                if (activedInfo.config.features.indexOf('M001') >= 0 ||
                    activedInfo.config.features.indexOf('W001') >= 0 ||
                    activedInfo.config.features.indexOf('W004') >= 0 ||
                    activedInfo.config.features.indexOf('W005') >= 0) {
                    liItem = document.createElement('li');
                    liItem.id = 'left-menu-set';
                    liItem = $(liItem);
                    liItem.html('<img src="./asset/images/set.png" /><span z-lang="N004">' + activedLang.N004 + '</span>');
                    __self__.append(liItem);
                    liItem.on('click', changeSelectListener);
                }
                if (activedInfo.config.features.indexOf('P001') >= 0) {
                    liItem = document.createElement('li');
                    liItem.id = 'left-menu-3d';
                    liItem = $(liItem);
                    liItem.html('<img src="./asset/images/alarm.png" /><span z-lang="N005">' + activedLang.N005 + '</span>');
                    __self__.append(liItem);
                    liItem.on('click', changeSelectListener);
                }
                return true;
            } catch (e) {
                console.log(e.message);
                return false;
            }
        }
    };

    return factory;
});