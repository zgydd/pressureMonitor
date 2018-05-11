;
(function(name, context, factory) { // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("pageCoordinator", this, function() {
    'use strict';
    var __pageCoordinator__ = {};
    var __defaultPage__ = 'left-menu-heatmap';

    var initActivedInfo = function() {
        var activedInfo = runtimeCollection._get('activedInfo');
        var productInfo = runtimeCollection._get('productInfo');
        if (!activedInfo || !productInfo || !productInfo.type) return false;
        if (typeof activedInfo.category === 'string' && activedInfo.category !== 'wait')
            return false;
        if (activedInfo.config) return false;
        var sysConfigInfo = sharingDataSet._get('activedSysConfig');

        var analyzedConfig = null;
        if (sysConfigInfo.hasOwnProperty(productInfo.type))
            analyzedConfig = sysConfigInfo[productInfo.type];
        else alert('pageCoordinator - initActivedInfo');
        activedInfo.category = 'product';

        if (!analyzedConfig.radiusCoefficient ||
            typeof analyzedConfig.radiusCoefficient !== 'number')
            analyzedConfig.radiusCoefficient = logic._getDefaultRadiusCoefficient();

        if (analyzedConfig.features.indexOf('W002') >= 0) {
            if (analyzedConfig.features.indexOf('M001') < 0)
                analyzedConfig.features.push('M001');
            if (analyzedConfig.features.indexOf('M002') < 0)
                analyzedConfig.features.push('M002');
        }
        if (analyzedConfig.features.indexOf('M002') >= 0) {
            if (analyzedConfig.features.indexOf('M001') < 0)
                analyzedConfig.features.push('M001');
            if (analyzedConfig.features.indexOf('W001') < 0)
                analyzedConfig.features.push('W001');
            if (analyzedConfig.features.indexOf('W002') < 0)
                analyzedConfig.features.push('W002');
        }
        if (analyzedConfig.features.indexOf('W003') >= 0 && analyzedConfig.features.indexOf('M001') < 0)
            analyzedConfig.features.push('M001');
        if (analyzedConfig.features.indexOf('W004') >= 0) {
            if (analyzedConfig.features.indexOf('M001') < 0)
                analyzedConfig.features.push('M001');
            if (analyzedConfig.features.indexOf('W002') < 0)
                analyzedConfig.features.push('W002');
        }
        if (analyzedConfig.features.indexOf('W005') >= 0 && analyzedConfig.features.indexOf('M001') < 0)
            analyzedConfig.features.push('M001');
        activedInfo.config = analyzedConfig;
        return true;
    };
    var toProduct = function() {
        //navMenu layoutCover
        var activedLang = runtimeCollection._get('activedLanguageList');
        var layoutHead = '<div class="context text-info"><ul>';
        var layoutTail = '</ul></div>';
        var layoutOk = '<li><span z-lang="L016">' + activedLang.L016 + '</span></li>';
        var lauoytIn = '<li><span z-lang="L017">' + activedLang.L017 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
        layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);
        layoutCover._show();

        var setFlg = true;
        setFlg = (setFlg && navMenu._setProduct());
        setFlg = (setFlg && contentHeader._setProduct());
        setFlg = (setFlg && contentBody._setProduct());

        if (setFlg) {
            var activedInfo = runtimeCollection._get('activedInfo');
            activedInfo.activedContainer = __defaultPage__;
            //contentBody._setActivedContainer();
            layoutOk += '<li><span z-lang="L017">' + activedLang.L017 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
            lauoytIn = '<li><span z-lang="L018">' + activedLang.L018 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
            layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);

            contentBody._subscribeListener();
            layoutOk += '<li><span z-lang="L018">' + activedLang.L018 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
            lauoytIn = '<li><span z-lang="L017">' + activedLang.L017 + '</span><span z-lang="C003">' + activedLang.C003 + '</span></li>';
            layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);

            layoutCover._hide();
        } else {
            layoutOk += '<li><span z-lang="L017">' + activedLang.L017 + '</span><span z-lang="C004">' + activedLang.C004 + '</span></li>';
            layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);
            return;
        }
    };
    var analyzeData = function() {
        if (initActivedInfo()) toProduct();
    };

    var factory = {
        _init: function() {
            __pageCoordinator__.logo = $('.main-left-menu > li:first-child > img');
            __pageCoordinator__.leftMenu = $('.main-left-menu > li.left-menu');
            __pageCoordinator__.contentHeader = $('.main-content > .main-header');
            __pageCoordinator__.contentBody = $('.main-content > .main-body');
            if (typeof navMenu === 'undefined' || __pageCoordinator__.leftMenu.length === 0)
                layoutCover._setAErrorMessage('No nav menu --pageCoordinator;');
            if (typeof contentHeader === 'undefined' || __pageCoordinator__.contentHeader.length === 0)
                layoutCover._setAErrorMessage('No content header --pageCoordinator;');
            if (typeof contentBody === 'undefined' || __pageCoordinator__.contentBody.length === 0)
                layoutCover._setAErrorMessage('No content body --pageCoordinator;');
            if (layoutCover._getErrors(1)) {
                layoutCover._show();
                return false;
            }
            return true;
        },
        _findDataMatrix: function() {
            var _ENV_ = runtimeCollection._get('_ENV_');
            if (_ENV_.insideForm) return;
            if (typeof serialCallBackList === 'undefined' || typeof serialCallBackList._callPortHandle !== 'function')
                layoutCover._setAErrorMessage('No serial call back --pageCoordinator;');
            if (typeof nodeSerialport === 'undefined')
                layoutCover._setAErrorMessage('No node serial port --pageCoordinator;');
            if (typeof matrixKeeper === 'undefined')
                layoutCover._setAErrorMessage('No matrix keeper --pageCoordinator;');
            if (layoutCover._getErrors(1)) {
                layoutCover._show();
                return;
            }
            matrixKeeper._registerListener('Modify', analyzeData);
            setTimeout(serialCallBackList._callPortHandle, 500);
        },
        _registerModifyListener: function() {
            matrixKeeper._registerListener('Modify', analyzeData);
        },
        _toWait: function() {
            var activedLang = runtimeCollection._get('activedLanguageList');

            var activedInfo = runtimeCollection._get('activedInfo') || {};
            if (activedInfo.category && activedInfo.category !== 'wait') {
                layoutCover._resetInner('<div class="context text-info"><ul><li z-lang="L019">' + activedLang.L019 + '</li></ul></div>');
                layoutCover._show();
                layoutCover._hide();
            }
            activedInfo.category = 'wait';
            runtimeCollection._set('activedInfo', activedInfo);
            if (typeof navMenu._init !== 'function' || typeof navMenu._link !== 'function')
                layoutCover._setAErrorMessage('Nav menu init fail --pageCoordinator;');
            if (layoutCover._getErrors(1)) {
                layoutCover._show();
                return false;
            }
            navMenu._init();
            navMenu._link(__pageCoordinator__.leftMenu);
            if (typeof contentHeader._init !== 'function' || typeof contentHeader._link !== 'function')
                layoutCover._setAErrorMessage('ContentHeader init fail --pageCoordinator;');
            if (layoutCover._getErrors(1)) {
                layoutCover._show();
                return false;
            }
            contentHeader._init();
            contentHeader._link(__pageCoordinator__.contentHeader);
            if (typeof contentBody._init !== 'function' || typeof contentBody._link !== 'function')
                layoutCover._setAErrorMessage('ContentBody init fail --pageCoordinator;');
            if (layoutCover._getErrors(1)) {
                layoutCover._show();
                return false;
            }
            contentBody._init();
            contentBody._link(__pageCoordinator__.contentBody);
            return true;
        }
    };
    return factory;
});