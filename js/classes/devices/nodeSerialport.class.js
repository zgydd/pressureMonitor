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
})("nodeSerialport", this, function() {
    'use strict';
    var __hardwareManufacturer__ = ['wch.cn', 'Silicon Labs', 'Microsoft', 'USB-SERIAL', 'USB-SERIAL CH340'];
    var __defaultConfig__ = {
        autoOpen: false,
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    };
    var __portList__ = [];
    var __Serialport__ = null;
    var __dataWrapperWorker__ = null;
    var __findFlg__ = false;
    var _resultHandleCallback = null;
    var _disConnectHandleCallback = null;
    var dataHandle = function(data) {
        try {
            __dataWrapperWorker__.postMessage(JSON.stringify(new Buffer(data, 'hex')));
        } catch (e) {
            console.log(e.message);
        }
    };
    var errHandle = function(err) {
        console.log(err);
    };
    var disConnectHandle = function() {
        libBridge._disConnect();
        __findFlg__ = false;
        if (_disConnectHandleCallback && typeof _disConnectHandleCallback === 'function') _disConnectHandleCallback();
    };
    var resultHandle = function(event) {
        if (_resultHandleCallback && typeof _resultHandleCallback === 'function') _resultHandleCallback(event);
    };
    var sericalPortFactory = {
        _init: function(resultHandle, disConnectHandle) {
            _resultHandleCallback = resultHandle;
            _disConnectHandleCallback = disConnectHandle;
            if (typeof(Worker) !== undefined) {
                if (__dataWrapperWorker__) {
                    __dataWrapperWorker__.terminate();
                    __dataWrapperWorker__ = null;
                }
                __dataWrapperWorker__ = new Worker('./js/workers/bufferData.worker.js');
                __dataWrapperWorker__.onmessage = resultHandle;
            }
            try {
                __Serialport__ = require('serialport');
            } catch (e) {
                console.log(e);
            }
        },
        _findPort: function() {
            if (__findFlg__) return;
            try {
                __portList__ = [];
                __Serialport__.list(function(err, ports) {
                    if (err) {
                        errHandle(err);
                        return;
                    }
                    ports.forEach(function(port) {
                        if (__hardwareManufacturer__.indexOf(port.manufacturer) >= 0) __portList__.push({
                            comName: port.comName,
                            pnpId: port.pnpId,
                            manufacturer: port.manufacturer
                        });
                    });
                    if (!__portList__.length) {
                        errHandle('No port');
                        return;
                    }
                    __findFlg__ = true;
                    //io._saveFile('portList', JSON.stringify(__portList__));
                    for (var i = 0; i < __portList__.length; i++) {
                        var serialPort = new __Serialport__(__portList__[i].comName, __defaultConfig__);
                        //serialPort.on('open', callbackList._sericalPortOpened);
                        serialPort.on('disconnect', disConnectHandle);
                        //serialPort.on('close', callbackList._sericalPortClosed);
                        //serialPort.on('error', callbackList._sericalPortError);
                        serialPort.open(function(err) {
                            if (err) {
                                errHandle(err);
                                return;
                            }
                            this.on('data', function(data) {
                                dataHandle(data);
                            });
                        });
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
    };
    return sericalPortFactory;
});