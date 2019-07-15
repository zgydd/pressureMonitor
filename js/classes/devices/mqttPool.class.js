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
})("mqttPool", this, function() {
    'use strict';
    var __privateCollection__ = {
        mqttPool: {},
        listeners: {
            receiveListener: []
        }
    };
    var onClientConnectCallback = function() {
        __privateCollection__.client.subscribe('MAT_DATA/meddo01');
    };
    var onMessageCallback = function(topic, message) {
        /*
        console.log('-----topic-----');
        console.log(topic);
        console.log('-----message-----');
        var data = JSON.parse(message.toString());
        console.log('data=');
        console.log(data);
        var test = data.matData.split('\r\n');
        console.log('split1=');
        console.log(test);
        var result = [];
        for (var i = 0; i < test.length; i++) {
            var row = test[i].split(',');
            if (row.length > 1) result.push(row);
        }
        console.log('split2=');
        console.log(result);
        console.log('-----end-----');
        */
        var data = JSON.parse(message.toString());
        var matId = data.matId;
        if (!matId) matId = 'MQ-DEF';
        else matId = 'MQ-' + matId;
        if (!__privateCollection__.mqttPool.hasOwnProperty(matId)) __privateCollection__.mqttPool[matId] = {};
        __privateCollection__.mqttPool[matId].innerData = data.matData;
        if (!__privateCollection__.mqttPool[matId].hasOwnProperty('productInfo')) {
            __privateCollection__.mqttPool[matId].productInfo = {
                com: matId,
                type: 'B1',
                size: {
                    x: 32,
                    y: 64
                }
            };
        }
        for (var i = 0; i < __privateCollection__.listeners.receiveListener.length; i++) __privateCollection__.listeners.receiveListener[i].func(matId);
    };
    var factory = {
        _init: function() {
            try {
                __privateCollection__.mqttInstance = require('mqtt');
                __privateCollection__.client = __privateCollection__.mqttInstance.connect('mqtt://testzzhapi.meddo99.com:9702', {
                    keepalive: 0,
                    username: 'mosquitto',
                    password: 'password'
                });
                __privateCollection__.client.on('connect', onClientConnectCallback);
                __privateCollection__.client.on('message', onMessageCallback);
            } catch (e) {
                console.log(e.message);
            }
        },
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
            if (!__privateCollection__.mqttPool.hasOwnProperty(id)) return null;
            return {
                productInfo: JSON.parse(JSON.stringify(__privateCollection__.mqttPool[id].productInfo)),
                innerData: __privateCollection__.mqttPool[id].innerData.clone()
            }
        }
    };
    return factory;
});