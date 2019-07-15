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
})("matxAddonPool", this, function() {
    'use strict';
    var __privateCollection__ = {
        defaultId: '',
        mainBridge: null,
        loopInterval: 0,
        refindTimeHandle: -1,
        lostWaitTimes: 0,
        findWaitTimes: 0,
        dataPool: {},
        listeners: {
            receiveListener: [],
            disConnectListener: []
        }
    };
    var messageHandle = function() {
        try {
            var status = __privateCollection__.mainBridge.get_mattress_status();
            if (status < 0) return;
            var shortNum = __privateCollection__.mainBridge.get_mattress_number();
            if (status === 2 && shortNum === 0) {
                __privateCollection__.findWaitTimes++;
                if (__privateCollection__.findWaitTimes > 50) {
                    __privateCollection__.mainBridge.reconnect_mattress();
                    __privateCollection__.findWaitTimes = 0;
                }
                return;
            }
            if (shortNum <= 0) return;
            var configFlg = 'B2';
            switch (status) {
                case 66:
                    configFlg = 'B2';
                    break;
                case 67:
                    configFlg = 'B3';
                    break;
                case 68:
                    configFlg = 'B4';
                    break;
                default:
                    break;
            }
            var customConfig = rootScope._get('_ENV_').systemConfig[configFlg];
            //if (__privateCollection__.defaultId.indexOf('Short') <= 0) __privateCollection__.defaultId = 'matxShort' + shortNum;
            if (__privateCollection__.mainBridge.check_mattress_refreshed() < 1) {
                __privateCollection__.lostWaitTimes++;
                if (__privateCollection__.lostWaitTimes > 50) {
                    for (var i = 0; i < __privateCollection__.listeners.disConnectListener.length; i++) __privateCollection__.listeners.disConnectListener[i].func(__privateCollection__.defaultId);
                    __privateCollection__.mainBridge.start_sampling();
                    __privateCollection__.lostWaitTimes = 0;
                }
                return;
            }
            var bridgeData = null;
            //if (customConfig.gaitFlg) bridgeData = __privateCollection__.mainBridge.get_matrix_G_3248();
            //else bridgeData = __privateCollection__.mainBridge.get_matrix_B_3232();
            switch (status) {
                case 66:
                    bridgeData = __privateCollection__.mainBridge.get_matrix_B_3232();
                    break;
                case 67:
                    bridgeData = __privateCollection__.mainBridge.get_matrix_G_3248();
                    break;
                case 68:
                    bridgeData = __privateCollection__.mainBridge.get_matrix_B_2842();
                    break;
                default:
                    break;
            }
            if (!bridgeData || !bridgeData.length) return;
            //console.log(bridgeData);
            __privateCollection__.lostWaitTimes = 0;
            if (!__privateCollection__.dataPool.hasOwnProperty(__privateCollection__.defaultId)) __privateCollection__.dataPool[__privateCollection__.defaultId] = {};
            if (!__privateCollection__.dataPool[__privateCollection__.defaultId].hasOwnProperty('productInfo')) {
                __privateCollection__.dataPool[__privateCollection__.defaultId].productInfo = {
                    com: __privateCollection__.defaultId,
                    type: configFlg,
                    size: customConfig.size
                }
            }
            __privateCollection__.dataPool[__privateCollection__.defaultId].innerData = [];
            for (var i = 0; i < bridgeData.length; i++) __privateCollection__.dataPool[__privateCollection__.defaultId].innerData.push(bridgeData[i]);
            //console.log(__privateCollection__.dataPool[__privateCollection__.defaultId].innerData);
            for (var i = 0; i < __privateCollection__.listeners.receiveListener.length; i++) __privateCollection__.listeners.receiveListener[i].func(__privateCollection__.defaultId);
        } catch (e) {
            console.log(e);
        }
    };
    var factory = {
        _init: function() {
            try {
                var env = rootScope._get('_ENV_');
                var matxSetInfo = env.matxSetInfo;
                if (!matxSetInfo) matxSetInfo = {};
                if (!matxSetInfo.matIp) matxSetInfo.matIp = '192.168.0.57';
                if (!matxSetInfo.defaultId) matxSetInfo.defaultId = 'matxTmp';
                //if (!matxSetInfo.startTimeout || matxSetInfo.startTimeout < 1000) matxSetInfo.startTimeout = 1000;
                if (!matxSetInfo.loopTimeout) matxSetInfo.loopTimeout = 200;
                __privateCollection__.defaultId = matxSetInfo.defaultId;
                __privateCollection__.mainBridge = require('./addon/matx/matxBridge.node');
                __privateCollection__.mainBridge.set_ip(matxSetInfo.matIp);
                //__privateCollection__.mainBridge.set_multiple(1);
                if (__privateCollection__.loopInterval) clearInterval(__privateCollection__.loopInterval);
                __privateCollection__.mainBridge.start_mattress_service();
                __privateCollection__.loopInterval = setInterval(messageHandle, matxSetInfo.loopTimeout);
                /*
                setTimeout(function() {
                    __privateCollection__.loopInterval = setInterval(messageHandle, matxSetInfo.loopTimeout);
                }, matxSetInfo.startTimeout);
                */
            } catch (e) {
                console.log(e);
            }
        },
        _registerListener: function(type, key, func) {
            switch (type) {
                case 'receiveData':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.receiveListener, key, func);
                    break;
                case 'disConnect':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.disConnectListener, key, func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, key) {
            switch (type) {
                case 'receiveData':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.receiveListener, key);
                    break;
                case 'disConnect':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.disConnectListener, key);
                    break;
                default:
                    break;
            }
        },
        _getInstance: function(id) {
            if (!__privateCollection__.dataPool.hasOwnProperty(id)) return null;
            return {
                productInfo: JSON.parse(JSON.stringify(__privateCollection__.dataPool[id].productInfo)),
                innerData: __privateCollection__.dataPool[id].innerData.clone()
            }
        },
        _stopService: function() {
            try {
                __privateCollection__.mainBridge.stop_mattress_service();
            } catch (e) {
                console.log(e);
            }
        }
    };
    return factory;
});