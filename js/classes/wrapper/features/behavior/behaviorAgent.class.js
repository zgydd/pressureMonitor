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
})("behaviorAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __items__ = {
        leave: {
            mark: $('<label z-lang="P035">离开次数：</label>'),
            html: $('<span></span>')
        },
        back: {
            mark: $('<label z-lang="P036">返回次数：</label>'),
            html: $('<span></span>')
        },
        turn: {
            mark: $('<label z-lang="P037">翻身次数：</label>'),
            html: $('<span></span>')
        }
    };

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        __self__.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };
    var initItems = function() {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        var activedLang = runtimeCollection._get('activedLanguageList');
        __items__.leave.mark.html(activedLang.P035);
        __items__.back.mark.html(activedLang.P036);
        __items__.turn.mark.html(activedLang.P037);
        if (typeof runtimeInfo.leaveCounter === 'undefined') {
            runtimeInfo.leaveCounter = -1;
            __items__.leave.html.html('0');
        } else __items__.leave.html.html(runtimeInfo.leaveCounter);
        if (typeof runtimeInfo.backCounter === 'undefined') {
            runtimeInfo.backCounter = 0;
            __items__.back.html.html('0');
        } else __items__.back.html.html(runtimeInfo.backCounter);
        if (typeof runtimeInfo.turnCounter === 'undefined') {
            runtimeInfo.turnCounter = 0;
            __items__.turn.html.html('0');
        } else __items__.turn.html.html(runtimeInfo.turnCounter);
        __self__.append($('<li></li>').append(__items__.leave.mark).append(__items__.leave.html));
        __self__.append($('<li></li>').append(__items__.back.mark).append(__items__.back.html));
        __self__.append($('<li></li>').append(__items__.turn.mark).append(__items__.turn.html));
    };
    var countPlus = function(flg) {
        var runtimeInfo = runtimeCollection._get('runtimeInfo');
        switch (flg) {
            case 'leave':
                __items__.leave.html.html(++runtimeInfo.leaveCounter);
                break;
            case 'back':
                __items__.back.html.html(++runtimeInfo.backCounter);
                break;
            case 'turn':
                __items__.turn.html.html(++runtimeInfo.turnCounter);
                break;
            default:
                break;
        }
    };
    var factory = {
        _init: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return false;
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<ul></ul>').addClass('detail-container');
            initItems();
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _subscribeListener: function() {
            scaleAgent._registerListener('leave', countPlus);
            scaleAgent._registerListener('turn', countPlus);
            scaleAgent._registerListener('back', countPlus);
        }
    };

    return factory;
});