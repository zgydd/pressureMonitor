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
})("dataLinks", this, function() {
    'use strict';
    var __privateCollection__ = {
        sourceFlg: 0,
        targets: {},
        listeners: {
            constructorListener: [],
            destructorListener: [],
            runtimeListener: []
        }
    };
    var dataReceiveCallback = function(id) {
        if (!id) return;
        var instance = null;
        switch (__privateCollection__.sourceFlg) {
            case 0:
                instance = serialPool._getInstance(id);
                break;
            case 1:
                instance = interfaceDataPool._getInstance(id);
                break;
            case 3:
                instance = mqttPool._getInstance(id);
                break;
            case 4:
                instance = socketPool._getInstance(id);
                break;
            case 5:
                instance = matxAddonPool._getInstance(id);
                break;
            case 999:
                if (!instance) instance = serialPool._getInstance(id);
                if (!instance) instance = mqttPool._getInstance(id);
                if (!instance) instance = interfaceDataPool._getInstance(id);
                if (!instance) instance = socketPool._getInstance(id);
                if (!instance) instance = matxAddonPool._getInstance(id);
                break;
            default:
                break;
        }
        var sysConfig = rootScope._get('_ENV_').systemConfig;
        if (!instance || !instance.productInfo || !instance.innerData) return;
        if (instance.productInfo.type && (!instance.productInfo.size || !instance.productInfo.size.x || !instance.productInfo.size.y)) {
            if (sysConfig.hasOwnProperty(instance.productInfo.type) && sysConfig[instance.productInfo.type].hasOwnProperty('size')) instance.productInfo.size = JSON.parse(JSON.stringify(sysConfig[instance.productInfo.type].size));
        }
        var isConstructor = false;
        var min = sysConfig[instance.productInfo.type].lowLimit;
        min = (min ? min : 0);
        var max = sysConfig[instance.productInfo.type].maxLimit;
        max = (max ? max : 4096);
        if (!__privateCollection__.targets.hasOwnProperty(id)) {
            __privateCollection__.targets[id] = {
                productInfo: instance.productInfo,
                instance: new Pmatrixkeeper(id, max, min)
            };
            isConstructor = true;
        }
        __privateCollection__.targets[id].instance._setData(instance.innerData, instance.productInfo);
        if (isConstructor)
            for (var i = 0; i < __privateCollection__.listeners.constructorListener.length; i++) __privateCollection__.listeners.constructorListener[i].func(id);
        else
            for (var i = 0; i < __privateCollection__.listeners.runtimeListener.length; i++) __privateCollection__.listeners.runtimeListener[i].func(id);
        //console.log(__privateCollection__.targets);
    };
    var disConnectionCallback = function(id) {
        if (!id || !__privateCollection__.targets.hasOwnProperty(id)) return;
        for (var i = 0; i < __privateCollection__.listeners.destructorListener.length; i++) __privateCollection__.listeners.destructorListener[i].func(id);
        __privateCollection__.targets[id].instance._destroy();
        __privateCollection__.targets[id].productInfo = null;
        delete __privateCollection__.targets[id];
    };
    var factory = {
        _initFromSerial: function() {
            serialPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            serialPool._registerListener('disConnect', 'dataLink_disConnection', disConnectionCallback);
        },
        _initFromMqtt: function() {
            __privateCollection__.sourceFlg = 3;
            mqttPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            //mqttPool._registerListener('disConnect', disConnectionCallback);
        },
        _initFromInterfaceApi: function() {
            __privateCollection__.sourceFlg = 1;
            interfaceDataPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            window.MyApp.startGetData();
        },
        _initFromWebSocket: function() {
            __privateCollection__.sourceFlg = 4;
            socketPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            //socketPool._registerListener('closeSocket', disConnectionCallback);
        },
        _initFromMatxAddon: function() {
            __privateCollection__.sourceFlg = 5;
            matxAddonPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            matxAddonPool._registerListener('disConnect', 'dataLink_disConnection', disConnectionCallback);
        },
        _initFromAll: function() {
            __privateCollection__.sourceFlg = 999;
            serialPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            serialPool._registerListener('disConnect', 'dataLink_disConnection', disConnectionCallback);
            mqttPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            interfaceDataPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            socketPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            matxAddonPool._registerListener('receiveData', 'dataLink_dataReceive', dataReceiveCallback);
            matxAddonPool._registerListener('disConnect', 'dataLink_disConnection', disConnectionCallback);
        },
        _registerListener: function(type, key, func) {
            switch (type) {
                case 'constructor':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.constructorListener, key, func);
                    break;
                case 'destructor':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.destructorListener, key, func);
                    break;
                case 'runtime':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.runtimeListener, key, func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, key) {
            switch (type) {
                case 'constructor':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.constructorListener, key);
                    break;
                case 'destructor':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.destructorListener, key);
                    break;
                case 'runtime':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.runtimeListener, key);
                    break;
                default:
                    break;
            }
        },
        _getTarget: function(id) {
            if (!__privateCollection__.hasOwnProperty('targets') || !__privateCollection__.targets.hasOwnProperty(id)) return null;
            return __privateCollection__.targets[id];
        }
    };
    return factory;
});