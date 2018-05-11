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
})("contentBody", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;

    var __maySelfClasses__ = ['disconnect-container', 'base-history-container'];
    var __listener__ = { beforeClearSelf: [] };

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        for (var i = 0; i < __listener__.beforeClearSelf.length; i++)
            __listener__.beforeClearSelf[i]();
        commonFunc._traverseClearEvent(__self__);
        __self__.empty();
        clearMyClass();
    };
    var clearMyClass = function() {
        for (var i = 0; i < __maySelfClasses__.length; i++)
            __self__.removeClass(__maySelfClasses__[i]);
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };
    var setWait = function() {
        if (!__self__.hasClass('disconnect-container'))
            __self__.addClass('disconnect-container');
        __self__.html('<img src="./asset/images/disconnect.png" />');
    };
    var initFeatures = function() {
        var activedInfo = runtimeCollection._get('activedInfo');
        if (!activedInfo || !activedInfo.config) return false;
        historyAgent._init();
        var initedFlg = true;
        if (activedInfo.config.features.indexOf('M001') >= 0) {
            if (typeof heatmapAgent === 'undefined' ||
                typeof heatmapAgent._init !== 'function')
                initedFlg = false;
            else {
                heatmapAgent._link(__self__);
                initedFlg = initedFlg && heatmapAgent._init();
            }
        }
        if (activedInfo.config.features.indexOf('W002') >= 0) {
            if (typeof edgeAgent === 'undefined' ||
                typeof edgeAgent._init !== 'function')
                initedFlg = false;
            else {
                initedFlg = initedFlg && edgeAgent._init();
                edgeAgent._link(__self__);
            }
        }
        if (activedInfo.config.features.indexOf('W002') >= 0 ||
            activedInfo.config.features.indexOf('W003') >= 0) {
            if (typeof skeletonAgent === 'undefined' ||
                typeof skeletonAgent._init !== 'function')
                initedFlg = false;
            else {
                initedFlg = initedFlg && skeletonAgent._init();
                skeletonAgent._link(__self__);
            }
        }
        if (activedInfo.config.features.indexOf('W005') >= 0) {
            if (typeof levelNoteAgent === 'undefined' ||
                typeof levelNoteAgent._init !== 'function')
                initedFlg = false;
            else {
                initedFlg = initedFlg && levelNoteAgent._init();
                levelNoteAgent._link(__self__);
            }
        }
        if (activedInfo.config.features.indexOf('W001') >= 0 ||
            activedInfo.config.features.indexOf('M002') >= 0) {
            if (typeof heatmapInfo === 'undefined' ||
                typeof heatmapInfo._init !== 'function')
                initedFlg = false;
            else {
                initedFlg = initedFlg && heatmapInfo._init();
                heatmapInfo._link(__self__);
            }
        }
        if (activedInfo.config.features.indexOf('W002') >= 0) {
            if (typeof behaviorAgent === 'undefined' ||
                typeof behaviorAgent._init !== 'function')
                initedFlg = false;
            else {
                initedFlg = initedFlg && behaviorAgent._init();
                behaviorAgent._link(__self__);
            }
        }
        if (activedInfo.config.features.indexOf('W003') >= 0) {
            if (typeof gaitAgent === 'undefined' ||
                typeof gaitAgent._init !== 'function')
                initedFlg = false;
            else {
                initedFlg = initedFlg && gaitAgent._init();
                gaitAgent._link(__self__);
            }
        }

        if (activedInfo.config.features.indexOf('M002') >= 0) {
            if (typeof scaleAgent === 'undefined' ||
                typeof scaleAgent._init !== 'function')
                initedFlg = false;
            else initedFlg = initedFlg && scaleAgent._init();
        }

        if (activedInfo.config.features.indexOf('M001') >= 0 ||
            activedInfo.config.features.indexOf('W001') >= 0 ||
            activedInfo.config.features.indexOf('W005') >= 0 ||
            activedInfo.config.features.indexOf('W004') >= 0) {
            if (typeof configAgent === 'undefined' ||
                typeof configAgent._init !== 'function')
                initedFlg = false;
            else initedFlg = initedFlg && configAgent._init();
        }
        if (activedInfo.config.features.indexOf('W004') >= 0) {
            if (typeof keepRecordAgent === 'undefined' ||
                typeof keepRecordAgent._init !== 'function')
                initedFlg = false;
            else initedFlg = initedFlg && keepRecordAgent._init();
        }
        if (activedInfo.config.features.indexOf('W006') >= 0) {
            if (typeof fallbedAgent === 'undefined' ||
                typeof fallbedAgent._init !== 'function')
                initedFlg = false;
            else initedFlg = initedFlg && fallbedAgent._init();
        }
        if (activedInfo.config.features.indexOf('P001') >= 0) {
            if (typeof threeAgent === 'undefined' ||
                typeof threeAgent._init !== 'function')
                initedFlg = false;
            else initedFlg = initedFlg && threeAgent._init();
        }
        return initedFlg;
    };
    var setProduct = function() {
        //try {
        clearSelf();
        return initFeatures();
        //} catch (e) {
        //    console.log(e.message);
        //    return false;
        //}
    };
    var setActivedContainer = function() {
        var activedInfo = runtimeCollection._get('activedInfo');
        if (activedInfo && activedInfo.activedContainer &&
            activedInfo.activedContainer !== 'left-menu-heatmap')
            clearSelf();

        switch (activedInfo.activedContainer) {
            case 'left-menu-heatmap':
                //if (activedInfo.config.features.indexOf('M001') >= 0)
                //    heatmapAgent._link(__self__);
                setProduct();
                break;
            case 'left-menu-scale':
                scaleAgent._link(__self__);
                scaleAgent._registerSelfListener();
                break;
            case 'left-menu-records':
                linkHistory();
                break;
            case 'left-menu-set':
                configAgent._link(__self__);
                configAgent._registerSelfListener();
                break;
            case 'left-menu-3d':
                threeAgent._link();
                break;
            default:
                break;
        }
        logic._traverseLocales();
    };
    var registerbeforeClearListener = function(func) {
        commonFunc._registerListener(__listener__.beforeClearSelf, func);
    };
    var linkHistory = function() {
        __self__.addClass('base-history-container');
        historyAgent._link(__self__);
        //historyAgent._registerSelfListener();
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
        },
        _setProduct: function() {
            return setProduct();
        },
        _getSize: function() {
            return {
                width: __self__.innerWidth(),
                height: __anchor__.innerHeight()
            };
        },
        _setActivedContainer: function() {
            setActivedContainer();
        },
        _subscribeListener: function() {
            var activedInfo = runtimeCollection._get('activedInfo');
            if (!activedInfo || !activedInfo.config ||
                !activedInfo.config.features || !activedInfo.config.features.length)
                return;
            if (activedInfo.config.features.indexOf('M001') >= 0)
                heatmapAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W001') >= 0)
                countDownAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W002') >= 0)
                edgeAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W002') >= 0 ||
                activedInfo.config.features.indexOf('W003') >= 0)
                skeletonAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W005') >= 0)
                levelNoteAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('M002') >= 0)
                scaleAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W002') >= 0)
                behaviorAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W004') >= 0)
                keepRecordAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('W006') >= 0)
                fallbedAgent._subscribeListener();
            if (activedInfo.config.features.indexOf('P001') >= 0)
                threeAgent._subscribeListener();
            navMenu._registerListener('itemChanged', setActivedContainer);
        },
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'beforeClear':
                    registerbeforeClearListener(func);
                    break;
                default:
                    break;
            }
        },
        _setWaitAvailableContainer: function() {
            clearSelf();
            historyAgent._init();
            linkHistory();
        }
    };

    return factory;
});