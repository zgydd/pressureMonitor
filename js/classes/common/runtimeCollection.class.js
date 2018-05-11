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
})("runtimeCollection", this, function() {
    'use strict';
    var collection = {};
    var factory = {
        _set: function(key, data) {
            collection[key] = data;
        },
        _get: function(key) {
            if (collection.hasOwnProperty(key)) return collection[key];
            return null;
        },
        _push: function(key, data) {
            if (!collection.hasOwnProperty(key)) return;
            if (!commonFunc._isArray(collection[key])) return;
            collection[key].push(data);
        }
    };
    return factory;
});