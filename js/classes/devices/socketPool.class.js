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
})("socketPool", this, function() {
    'use strict';
    var __privateCollection__ = {
        dataPool: {},
        listeners: {
            openListener: [],
            receiveListener: [],
            closeListener: []
        }
    };
    var openHandle = function(event) {
        //console.log(event);
        for (var ele in __privateCollection__.dataPool) {
            if (__privateCollection__.dataPool[ele].used) continue;
            __privateCollection__.dataPool[ele].used = true;
            var id = commonFunc._toInt(ele);
            __privateCollection__.dataPool[ele].socket.send(id);
            //console.log('open ' + ele);
            for (var i = 0; i < __privateCollection__.listeners.openListener.length; i++) __privateCollection__.listeners.openListener[i].func(id);
            break;
        }
    };
    var messageHandle = function(event) {
        var sourceData = JSON.parse(event.data);
        var id = commonFunc._toInt(sourceData.addr);
        if (!__privateCollection__.dataPool.hasOwnProperty(id)) return;
        if (!__privateCollection__.dataPool[id].hasOwnProperty('productInfo')) {
            __privateCollection__.dataPool[id].productInfo = {
                com: id,
                type: 'B2',
                size: rootScope._get('_ENV_').systemConfig['B2'].size
            }
        }
        var data = sourceData.frame;
        var arr = data.split('\r\n');
        __privateCollection__.dataPool[id].innerData = [];
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i]) continue;
            __privateCollection__.dataPool[id].innerData.push(arr[i].split(','));
        }
        //console.log(__privateCollection__.dataPool[id].innerData);
        for (var i = 0; i < __privateCollection__.listeners.receiveListener.length; i++) __privateCollection__.listeners.receiveListener[i].func(id);
    };
    var closeHandle = function(event) {
        console.log('Client notified socket has closed', event);
        //for (var i = 0; i < __privateCollection__.listeners.closeListener.length; i++) __privateCollection__.listeners.closeListener[i].func(id);
    };
    var errorHandle = function(event) {
        console.log('Client notified socket has error', event);
    };
    var factory = {
        _init: function() {
            var env = rootScope._get('_ENV_');
            if (!env.socketInfo || !env.socketInfo.protocol || !env.socketInfo.host || !env.socketInfo.port || !env.socketInfo.api || !env.socketInfo.matIds.length) return;
            for (var i = 0; i < env.socketInfo.matIds.length; i++) {
                if (__privateCollection__.dataPool.hasOwnProperty(env.socketInfo.matIds[i])) continue;
                try {
                    __privateCollection__.dataPool[env.socketInfo.matIds[i]] = {
                        socket: new WebSocket(env.socketInfo.protocol + '://' + env.socketInfo.host + ':' + env.socketInfo.port + env.socketInfo.api),
                        used: false
                    };
                    __privateCollection__.dataPool[env.socketInfo.matIds[i]].socket.onopen = openHandle;
                    __privateCollection__.dataPool[env.socketInfo.matIds[i]].socket.onmessage = messageHandle;
                    __privateCollection__.dataPool[env.socketInfo.matIds[i]].socket.onclose = closeHandle;
                    __privateCollection__.dataPool[env.socketInfo.matIds[i]].socket.onerror = errorHandle;
                } catch (e) {
                    console.log(e);
                }
            }
        },
        _registerListener: function(type, key, func) {
            switch (type) {
                case 'openSocket':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.openListener, key, func);
                    break;
                case 'receiveData':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.receiveListener, key, func);
                    break;
                case 'closeSocket':
                    commonFunc._registerClosureListener(__privateCollection__.listeners.closeListener, key, func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, key) {
            switch (type) {
                case 'openSocket':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.openListener, key);
                    break;
                case 'receiveData':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.receiveListener, key);
                    break;
                case 'closeSocket':
                    commonFunc._unRegisterClosureListener(__privateCollection__.listeners.closeListener, key);
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
        }
    };
    return factory;
});