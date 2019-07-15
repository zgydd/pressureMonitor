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
})("nwController", this, function() {
    'use strict';
    var __WINDOW__ = null;

    var saveConfig = function() {
        try {
            matxAddonPool._stopService();
            io._saveUseConfig();
        } catch (err) {
            alert(err.message);
        } finally {
            this.close(true);
        }
    };

    var factory = {
        _init: function() {
            try {
                __WINDOW__ = nw.Window.get();
                __WINDOW__.resizeTo(window.screen.availWidth, window.screen.availHeight);
                __WINDOW__.maximize();
                //__WINDOW__.toggleFullscreen();
                __WINDOW__.on('close', saveConfig);
                return '';
            } catch (e) {
                return e.message;
            };
        }
    };

    return factory;
});