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
})("libBridge", this, function() {
    'use strict';

    var __ffi__ = null;
    //var __ref__ = null;

    var __libController__ = null;

    var factory = {
        _init: function() {
            var hasCfg = runtimeCollection._get('_ENV_').hasCfg;
            var cfg = sharingDataSet._get('config');
            if (hasCfg && cfg.ignoreLib) return true;
            try {
                __ffi__ = require('ffi');
                if (!__ffi__) return false;
                var pathDll = 'CalProcessDll';
                if (hasCfg && cfg.useOutsideDll) pathDll = 'C://CalProcessDll.dll';
                __libController__ = new __ffi__.Library(pathDll, {
                    'Cal_wave_init': ['void', []],
                    'Cal_wave_stop': ['void', []],
                    'Cal_Originwave': ['int', ['int']],
                    'Cal_data': ['int', ['int', 'int']],
                    'Cal_Heartwave': ['int', ['int']],
                    'Cal_Breathwave': ['int', ['int']]
                });
                if (!__libController__ || typeof __libController__ !== 'object') return false;
                __libController__.Cal_wave_init();
                return true;
            } catch (e) {
                console.log(e);
                io._saveFile('ffiErrLog', e.message);
                return false;
            }
        },
        _getAstruct: function(origin, heart, breath, rHeart, rBreath) {
            var result = {
                origin: 0,
                heart: 0,
                breath: 0,
                rHeart: '--',
                rBreath: '--'
            };
            try { result.origin = __libController__.Cal_Originwave(commonFunc._toInt(origin)); } catch (e) {}
            try { result.heart = __libController__.Cal_Heartwave(commonFunc._toInt(heart)); } catch (e) {}
            try { result.breath = __libController__.Cal_Breathwave(commonFunc._toInt(breath)); } catch (e) {}
            try { result.rHeart = __libController__.Cal_data(commonFunc._toInt(origin), commonFunc._toInt(rHeart)); } catch (e) {}
            try { result.rBreath = __libController__.Cal_data(commonFunc._toInt(origin), commonFunc._toInt(rBreath)); } catch (e) {}
            return result;
        },
        _disConnect: function() {
            try {
                __libController__.Cal_wave_stop();
            } catch (e) { return; }
        }
    };

    return factory;
});