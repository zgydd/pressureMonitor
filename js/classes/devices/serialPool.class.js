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
})("serialPool", this, function() {
    'use strict';
    /*
    displayName:"Silicon Labs CP210x USB to UART Bridge"
    path:"COM21"
    productId:60000
    vendorId:4292
    console.log(ports);
    */
    var __privateCollection__ = {
        refreshStep: 2000,
        characteristics: {
            displayName: ['Silicon Labs CP210x USB to UART Bridge', 'STMicroelectronics Virtual COM Port'] //,'Silicon Laboratories', 'Silicon Labs', 'STMicroelectronics.', 
            //productId: 60000,//5740
            //vendorId: 4292//0483
        },
        serialConfig: {
            bitrate: 500000,
            bufferSize: 65535
        },
        comFinderHandle: 0,
        comPool: {},
        listeners: {
            receiveListener: [],
            disConnectListener: []
        }
    };
    var pushDeviceList = function(sample) {
        if (__privateCollection__.comPool.hasOwnProperty(sample.path)) return false;
        var insertFlg = false;
        if (__privateCollection__.characteristics.hasOwnProperty('displayName') && sample.hasOwnProperty('displayName')) {
            if (typeof __privateCollection__.characteristics.displayName === 'string') {
                if (sample.displayName.indexOf(__privateCollection__.characteristics.displayName) >= 0) insertFlg = true;
            } else if (commonFunc._isArray(__privateCollection__.characteristics.displayName)) {
                if (__privateCollection__.characteristics.displayName.indexOf(sample.displayName) >= 0) insertFlg = true;
            }
        }
        if (__privateCollection__.characteristics.hasOwnProperty('productId')) {
            if (insertFlg && sample.productId !== __privateCollection__.characteristics.productId) insertFlg = false;
            if (!insertFlg && sample.productId === __privateCollection__.characteristics.productId) insertFlg = true;
        }
        if (__privateCollection__.characteristics.hasOwnProperty('vendorId')) {
            if (insertFlg && sample.vendorId !== __privateCollection__.characteristics.vendorId) insertFlg = false;
            if (!insertFlg && sample.vendorId === __privateCollection__.characteristics.vendorId) insertFlg = true;
        }
        if (insertFlg) {
            __privateCollection__.comPool[sample.path] = {
                displayName: sample.displayName,
                productId: sample.productId,
                vendorId: sample.vendorId
            };
        }
        return insertFlg;
    };
    var removeDevice = function(ele) {
        if (!ele || !__privateCollection__.comPool.hasOwnProperty(ele)) return;
        for (var i = 0; i < __privateCollection__.listeners.disConnectListener.length; i++) __privateCollection__.listeners.disConnectListener[i].func(ele);
        __privateCollection__.comPool[ele].connectionInfo = null;
        __privateCollection__.comPool[ele].innerData = null;
        if (__privateCollection__.comPool[ele].hasOwnProperty('dataWrapperWorker')) {
            try {
                __privateCollection__.comPool[ele].dataWrapperWorker.terminate();
                __privateCollection__.comPool[ele].dataWrapperWorker = null;
            } catch (e) {}
        }
        delete __privateCollection__.comPool[ele];
    };
    var onGetDevices = function(ports) {
        if (chrome.runtime.lastError) {
            //callback Exception
        } else {
            var refreshFlg = false;
            for (var i = 0; i < ports.length; i++) {
                if (pushDeviceList(ports[i])) refreshFlg = true;
            }
            if (refreshFlg) instantiate();
        }
    };
    var refreshCom = function() {
        chrome.serial.getDevices(onGetDevices);
    };
    var bufferDataFormatCallBack = function(event) {
        var result = JSON.parse(event.data);
        if (!result.id) return;
        __privateCollection__.comPool[result.id].innerData = result.data;
        /*
        var testData = [];
        for (var i = 0; i < result.size.x; i++) {
            var row = [];
            for (var j = 0; j < result.size.y; j++) {
                //Virtual All
                //row.push(commonFunc._getRandom(0, 4096));
                //Virtual Fall Down
                //if (i < 5) row.push(commonFunc._getRandom(1000, 4096));
                //Virtual Gait
                //if ((i > 5 && i < 10 && j > 1 && j < 15) || (i > 3 && i < 8 && j > 35 && j < 50) || (i > 7 && i < 13 && j > 65 && j < 76) || (i > 20 && i < 25 && j > 17 && j < 30) || (i > 19 && i < 23 && j > 45 && j < 58) || (i > 23 && i < 28 && j > 66 && j < 78)) row.push(commonFunc._getRandom(0, 4095));
                //else row.push(0);
                //Virtual high note
                if ((i === 1 && j === 1) || (i === 10 && j === 25) || (i === 11 && j === 24) || (i === 11 && j === 25) || (i === 11 && j === 26) || (i === 12 && j === 25) || (i > 5 && i < 10 && j > 1 && j < 15) || (i > 3 && i < 8 && j > 35 && j < 50) || (i > 7 && i < 13 && j > 65 && j < 76) || (i > 20 && i < 25 && j > 17 && j < 30) || (i > 19 && i < 23 && j > 45 && j < 58) || (i > 23 && i < 28 && j > 66 && j < 78)) row.push(4095);
                //if (i === 1 && j === 1) row.push(4095);
                else row.push(0);
            }
            testData.push(row);
        }
        __privateCollection__.comPool[result.id].innerData = testData;
        //*/
        if (!__privateCollection__.comPool[result.id].hasOwnProperty('productInfo')) {
            __privateCollection__.comPool[result.id].productInfo = {
                com: result.id,
                type: result.type,
                size: result.size
            };
        }
        for (var i = 0; i < __privateCollection__.listeners.receiveListener.length; i++) __privateCollection__.listeners.receiveListener[i].func(result.id);
    };
    var serialOnConnectCallback = function(connectionInfo) {
        if (chrome.runtime.lastError) {
            //callback Exception
        } else {
            if (!connectionInfo) return;
            __privateCollection__.comPool[connectionInfo.name].connectionInfo = JSON.parse(JSON.stringify(connectionInfo));
        }
    };
    var serialOnReceiveCallback = function(info) {
        if (chrome.runtime.lastError) {
            //callback Exception
        } else {
            for (var ele in __privateCollection__.comPool) {
                if (!__privateCollection__.comPool[ele].hasOwnProperty('connectionInfo')) continue;
                if (info.connectionId === __privateCollection__.comPool[ele].connectionInfo.connectionId) {
                    var buffer = new Buffer(info.data, 'hex');
                    //!!Important!! Don't use Wide Byte character!!!
                    if ((buffer.indexOf(95) >= 0) && (buffer.indexOf(83) >= 0 || buffer.indexOf(70) >= 0 || buffer.indexOf(69) >= 0 || buffer.indexOf(65) >= 0)) {
                        var postStr = {};
                        postStr.innerData = __privateCollection__.comPool[ele].innerData;
                        postStr.id = ele;
                        postStr.data = buffer;
                        __privateCollection__.comPool[ele].dataWrapperWorker.postMessage(JSON.stringify(postStr));
                    } else chrome.serial.disconnect(info.connectionId, function() {
                        if (chrome.runtime.lastError) {
                            //callback Exception
                        } else {}
                    });
                    break;
                }
            }
        }
    };
    var serialOnReceiveErrorCallback = function(info) {
        if (chrome.runtime.lastError) {
            //callback Exception
        } else {
            switch (info.error) {
                case 'break':
                case 'frame_error':
                case 'overrun':
                case 'buffer_overflow':
                    chrome.serial.flush(info.connectionId, function() {
                        if (chrome.runtime.lastError) {
                            //callback Exception
                        } else {}
                    });
                    chrome.serial.setPaused(info.connectionId, false, function() {
                        if (chrome.runtime.lastError) {
                            //callback Exception
                        } else {}
                    });
                    break;
                case 'device_lost':
                case 'parity_error':
                case 'system_error':
                    for (var ele in __privateCollection__.comPool) {
                        if (info.connectionId === __privateCollection__.comPool[ele].connectionInfo.connectionId) {
                            removeDevice(ele);
                            break;
                        }
                    }
                    break;
                case 'disconnected':
                default:
                    break;
            }
        }
    };
    var instantiate = function() {
        for (var ele in __privateCollection__.comPool) {
            if (__privateCollection__.comPool[ele].hasOwnProperty('instance')) continue;
            __privateCollection__.comPool[ele].instance = true;
            __privateCollection__.comPool[ele].dataWrapperWorker = new Worker('./js/workers/bufferDataFormat.worker.js');
            __privateCollection__.comPool[ele].dataWrapperWorker.onmessage = bufferDataFormatCallBack;
            var serialConfig = JSON.parse(JSON.stringify(__privateCollection__.serialConfig));
            serialConfig.name = ele;
            chrome.serial.connect(ele, serialConfig, serialOnConnectCallback);
        }
    };
    var factory = {
        _init: function() {
            chrome.serial.onReceive.addListener(serialOnReceiveCallback);
            chrome.serial.onReceiveError.addListener(serialOnReceiveErrorCallback);
            refreshCom();
            __privateCollection__.comFinderHandle = setInterval(refreshCom, __privateCollection__.refreshStep);
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
            if (!__privateCollection__.comPool.hasOwnProperty(id)) return null;
            return {
                productInfo: JSON.parse(JSON.stringify(__privateCollection__.comPool[id].productInfo)),
                innerData: __privateCollection__.comPool[id].innerData.clone()
            }
        }
    };
    return factory;
});