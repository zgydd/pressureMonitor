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
    /***
    comName:"COM21"
    locationId:"Port_#0005.Hub_#0003"
    manufacturer:"Silicon Laboratories"
    pnpId:"USB\VID_10C4&PID_EA60\0001"
    productId:"EA60"
    serialNumber:undefined
    vendorId:"10C4"
    ***/
    var __hardwareManufacturer__ = ['Silicon Laboratories', 'Silicon Labs'];
    var __innerData__ = null;
    var __defaultConfig__ = {
        autoOpen: false,
        baudrate: 500000,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    };
    var __portList__ = [];
    var __dataWrapperWorker__ = null;

    var __hardwareType__ = 1;

    var dataHandle = function(data, that, handle) {
        try {
            var buffer = new Buffer(data, 'hex');
            switch (__hardwareType__) {
                case 0:
                    if (buffer.indexOf(65) < 0 || buffer.indexOf(65) === buffer.lastIndexOf(65)) return;
                    var tmpBuffer = buffer.slice(buffer.indexOf(65) + 1, buffer.lastIndexOf(65) + 1);
                    //if (tmpBuffer[5] === 255 && tmpBuffer[tmpBuffer.length - 7] === 255) {
                    if (tmpBuffer.length > 5 && tmpBuffer.indexOf(32) > 0) {
                        that.activeCom = handle.path;
                        var postStr = {};
                        postStr.innerData = __innerData__;
                        postStr.data = buffer;
                        __dataWrapperWorker__.postMessage(JSON.stringify(postStr));
                    }
                    break;
                case 1:
                    //!!Important!! Don't use Wide Byte character!!!
                    if ((buffer.indexOf(95) >= 0) &&
                        (buffer.indexOf(83) >= 0 || buffer.indexOf(70) >= 0 ||
                            buffer.indexOf(69) >= 0 || buffer.indexOf(65) >= 0)) {
                        that.activeCom = handle.path;
                        var postStr = {};
                        postStr.innerData = __innerData__;
                        postStr.data = buffer;
                        __dataWrapperWorker__.postMessage(JSON.stringify(postStr));
                    }
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log(e.message);
            that.err = e;
        }
    };

    var Serialport = (function serialportClosure() {
        function Serialport() {
            try {
                this.activeConfig = commonFunc._mergeObject(__defaultConfig__, arguments[0] || {});
                this.Serialport = require('serialport');
            } catch (e) {
                console.log(e.message);
                this.err = e;
            }
        };
        Serialport.prototype = {
            getActivePort: function(callbackList) {
                __portList__ = [];
                var that = this;
                that.Serialport.list(function(err, ports) {
                    if (err) {
                        if (callbackList.hasOwnProperty('normalErrHandle') &&
                            typeof callbackList.normalErrHandle === 'function')
                            callbackList.normalErrHandle(err, 'Port.list');
                        return;
                    }
                    ports.forEach(function(port) {
                        if (__hardwareManufacturer__.indexOf(port.manufacturer) >= 0)
                            __portList__.push({
                                comName: port.comName,
                                pnpId: port.pnpId,
                                manufacturer: port.manufacturer
                            });
                    });
                    if (!__portList__.length) {
                        if (callbackList.hasOwnProperty('normalErrHandle') &&
                            typeof callbackList.normalErrHandle === 'function')
                            callbackList.normalErrHandle('No port', 'Port list');
                        return;
                    }
                    for (var i = 0; i < __portList__.length; i++) {
                        var serialPort = new that.Serialport(__portList__[i].comName, that.activeConfig);
                        if (callbackList.hasOwnProperty('_sericalPortOpened') &&
                            typeof callbackList._sericalPortOpened === 'function')
                            serialPort.on('open', callbackList._sericalPortOpened);
                        if (callbackList.hasOwnProperty('_sericalPortDisConnected') &&
                            typeof callbackList._sericalPortDisConnected === 'function')
                            serialPort.on('disconnect', callbackList._sericalPortDisConnected);
                        if (callbackList.hasOwnProperty('_sericalPortClosed') &&
                            typeof callbackList._sericalPortClosed === 'function')
                            serialPort.on('close', callbackList._sericalPortClosed);
                        if (callbackList.hasOwnProperty('_sericalPortError') &&
                            typeof callbackList._sericalPortError === 'function')
                            serialPort.on('error', callbackList._sericalPortError);
                        serialPort.open(function(err) {
                            if (err) {
                                if (callbackList.hasOwnProperty('normalErrHandle') &&
                                    typeof callbackList.normalErrHandle === 'function')
                                    callbackList.normalErrHandle(err, this.path);
                                return;
                            }
                            this.on('data', function(data) {
                                dataHandle(data, that, this);
                            });
                        });
                    }
                });
            }
        }
        return Serialport;
    })();

    var sericalPortFactory = {
        _init: function(config) {
            this.Performer = null;
            this.Performer = new Serialport(config);
            if (this.Performer.err) return this.Performer.err;
            __innerData__ = null;
            return null;
        },
        _findPort: function() {
            if (typeof(Worker) !== undefined) {
                if (__dataWrapperWorker__) {
                    __dataWrapperWorker__.terminate();
                    __dataWrapperWorker__ = null;
                }
                switch (__hardwareType__) {
                    case 0:
                        __dataWrapperWorker__ = new Worker('./js/workers/bufferData.worker.js');
                        break;
                    case 1:
                        __dataWrapperWorker__ = new Worker('./js/workers/bufferDataFormat.worker.js');
                        break;
                    default:
                        break;
                }
                __dataWrapperWorker__.onmessage = function(event) {
                    var result = JSON.parse(event.data);
                    __innerData__ = result.data;
                    result.activeCom = nodeSerialport.Performer.activeCom;
                    if (serialCallBackList.hasOwnProperty('_sericalPortDataWrapper') &&
                        typeof serialCallBackList._sericalPortDataWrapper === 'function')
                        serialCallBackList._sericalPortDataWrapper(JSON.stringify(result));
                };
            }
            this.Performer.getActivePort(serialCallBackList);
        },
        _getInnerData: function() {
            if (__innerData__ && typeof __innerData__ === 'object')
                return JSON.stringify(__innerData__);
            return null;
        }
    };
    return sericalPortFactory;
});