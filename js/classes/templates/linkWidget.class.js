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
})("linkWidget", this, function() {
    'use strict';
    var __privateCollection__ = {
        actived: false
    };
    var disConnctCallback = function(id) {
        __privateCollection__.context.attr('z-lang', 'C022');
        __privateCollection__.logo.attr('src', './assets/images/home_break.png');
        logic._traverseLocales(__privateCollection__._DOM_, rootScope._get('_ENV_').languageMap[rootScope._get('_ENV_').useConfig['matxTmp'].lang], rootScope._get('_ENV_').useConfig['matxTmp'].lang);
        __privateCollection__.actived = false;
    };
    var factory = {
        _init: function(archor) {
            __privateCollection__._DOM_ = $('<div></div>').addClass('link');
            __privateCollection__.logo = $('<img src="./assets/images/home_break.png"/>');
            __privateCollection__.context = $('<span z-lang="C022"><i class="fab fa-connectdevelop fa-spin"></i></span>');
            __privateCollection__._DOM_.append(__privateCollection__.logo);
            __privateCollection__._DOM_.append(__privateCollection__.context);
            archor.append(__privateCollection__._DOM_);
            matxAddonPool._registerListener('disConnect', 'linkWidget_disConnect', disConnctCallback.bind(this));
        },
        _actived: function() {
            if (__privateCollection__.actived) return;
            __privateCollection__.context.attr('z-lang', 'C023');
            __privateCollection__.logo.attr('src', './assets/images/home_connect.png');
            logic._traverseLocales(__privateCollection__._DOM_, rootScope._get('_ENV_').languageMap[rootScope._get('_ENV_').useConfig['matxTmp'].lang], rootScope._get('_ENV_').useConfig['matxTmp'].lang);
            __privateCollection__.actived = true;
        }
    };
    return factory;
});