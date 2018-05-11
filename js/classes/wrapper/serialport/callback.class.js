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
})("serialCallBackList", this, function() {
    'use strict';

    var __callPortTimeStep__ = 2000;
    var __reConnectTimeStep__ = 500;

    var callPortHandle = function() {
        var productInfo = runtimeCollection._get('productInfo');
        if (productInfo && productInfo.activeCom) return;
        var runtimeInfo = runtimeCollection._get('runtimeInfo') || {};
        if (!runtimeInfo.serialPortInited && nodeSerialport._init()) {
            setTimeout(callPortHandle, __callPortTimeStep__);
            return;
        }
        runtimeInfo.serialPortInited = true;
        var findTimes = runtimeInfo.findPortDelay || 1;
        if (findTimes && typeof findTimes === 'number') {
            if (findTimes > 10) {
                runtimeInfo.serialPortInited = false;
                runtimeInfo.findPortDelay = 0;
            }
            runtimeInfo.findPortDelay = ++findTimes;
        } else runtimeInfo.findPortDelay = 0;
        nodeSerialport._findPort();
        if (!productInfo || !productInfo.activeCom) setTimeout(callPortHandle, __callPortTimeStep__);
    };

    var factory = {
        _callPortHandle: function() {
            callPortHandle();
        },
        _normalErrHandle: function(err, initiator) {
            //console.log('initiator:' + initiator + '############');
            //console.log(err);
            //console.log('end:############');
        },
        _sericalPortOpened: function() {
            //console.log('Port opened');
        },
        _sericalPortDataWrapper: function(strInnerData) {
            var result = JSON.parse(strInnerData);
            var connectedProductInfo = runtimeCollection._get('productInfo') || {};
            var modInfoFlg = false;

            if (!connectedProductInfo.activeCom || connectedProductInfo.activeCom !== result.activeCom) {
                connectedProductInfo.activeCom = result.activeCom;
                modInfoFlg = true;
            }
            var settedType = sharingDataSet._get('forceProduct');
            if (!settedType || settedType === 'A0') settedType = result.type;
            if (!connectedProductInfo.type || connectedProductInfo.type !== settedType) {
                connectedProductInfo.type = settedType;
                modInfoFlg = true;
            }
            if (!connectedProductInfo.size) {
                connectedProductInfo.size = JSON.parse(JSON.stringify(result.size));
                modInfoFlg = true;
            }
            if (!connectedProductInfo.calibrated) {
                matrixKeeper._setCalibrationData(result.data.clone());
                connectedProductInfo.calibrated = true;
                modInfoFlg = true;
            }
            if (modInfoFlg) runtimeCollection._set('productInfo', connectedProductInfo);

            matrixKeeper._setData(result.data.clone());

            /*
            if (sharingDataSet._get('activePage') !== 'product') {
                sharingDataSet._set('activePage', 'product');
                pageBuilder._toProduct();
            }
            behavior._autoCalibration();
            heatmapWrapper._setHeatmap(result.data);
            */
            //console.log('PageData:###############');
            //console.log(JSON.parse(strInnerData));
            //console.log('###############');
        },
        _sericalPortDisConnected: function() {
            //console.log('Port disconnected');
            runtimeCollection._set('productInfo', {});
            var activedInfo = runtimeCollection._get('activedInfo');
            activedInfo.config = null;
            activedInfo.activedContainer = null;
            pageCoordinator._toWait();
            setTimeout(callPortHandle, __reConnectTimeStep__);



            sharingDataSet._delete('inGaitFlg');
        },
        _sericalPortClosed: function() {
            //console.log('Port closed');
        },
        _sericalPortError: function() {
            //console.log('Port Error');
        }
    };
    return factory;
});