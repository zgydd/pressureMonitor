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
})("interfaceDataPool", this, function() {
    'use strict';
    var __privateCollection__ = {
        dataPool: {},
        listeners: {
            receiveListener: []
        }
    };
    var factory = {
        _init: function() {},
        _registerListener: function(type, key, func) {
            switch (type) {
                case 'receiveData':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.receiveListener, key, func);
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
        _setData: function(id, data, productInfo) {
            if (!__privateCollection__.dataPool.hasOwnProperty(id)) {
                __privateCollection__.dataPool[id] = {};
                if (productInfo && productInfo.com && productInfo.type && productInfo.size) __privateCollection__.dataPool[id].productInfo = productInfo;
            }
            __privateCollection__.dataPool[id].innerData = data;
            for (var i = 0; i < __privateCollection__.listeners.receiveListener.length; i++) __privateCollection__.listeners.receiveListener[i].func(id);
        }
    };
    return factory;
});