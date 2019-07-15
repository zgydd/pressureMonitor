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
})("rootScope", this, function() {
    'use strict';
    var __privateCollection__ = {};
    var factory = {
        _set: function(key, data) {
            __privateCollection__[key] = data;
        },
        _get: function(key) {
            if (__privateCollection__.hasOwnProperty(key)) return __privateCollection__[key];
            return null;
        },
        _push: function(key, data) {
            if (!__privateCollection__.hasOwnProperty(key)) return;
            if (!commonFunc._isArray(__privateCollection__[key])) return;
            __privateCollection__[key].push(data);
        },
        _delete: function(key) {
            delete __privateCollection__[key];
        },
        _getAll: function() {
            return __privateCollection__;
        }
    };
    return factory;
});