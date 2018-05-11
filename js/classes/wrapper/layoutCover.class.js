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
})("layoutCover", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __config__ = null;
    var __innerHtml__ = null;
    var __errorMessage__ = [];
    var init = function() {
        __self__ = $('<div></div>').addClass('container');
        __self__.html(__innerHtml__);
        __anchor__.append(__self__);
    };
    var getErrors = function(outputType) {
        var content = '';
        switch (outputType) {
            case 1:
                content += '<div class="context text-danger"><ul>Layout cover errors:';
                break;
            case 2:
                content += 'Layout cover errors:\n';
                break;
            default:
                content += 'Layout cover errors:';
                break;
        }
        for (var i = 0; i < __errorMessage__.length; i++) {
            switch (outputType) {
                case 1:
                    content += '<li>' + __errorMessage__[i].timestamp + ':' + __errorMessage__[i].value + '</li>';
                    break;
                case 2:
                    content += __errorMessage__[i].timestamp + ':' + __errorMessage__[i].value + '\n';
                    break;
                default:
                    content += '|' + __errorMessage__[i].timestamp + ':' + __errorMessage__[i].value;
                    break;
            }
        }
        switch (outputType) {
            case 1:
                content += '</ul></div>';
                break;
            case 2:
                content += '--------#END#--------';
                break;
            default:
                break;
        }
        return content;
    };
    var factory = {
        _config: function(config) {
            try {
                __config__ = config || {};
                if (__config__.anchorElement && __config__.anchorElement.length)
                    __anchor__ = __config__.anchorElement;
                else __errorMessage__.push({
                    timestamp: (new Date()).Format('yyyy-MM-dd hh:mm:ss'),
                    value: 'layoutCover:No anchorElement;'
                });
                __innerHtml__ = __config__.innerHtml || '';

                init();
            } catch (err) {
                __errorMessage__.push({
                    timestamp: (new Date()).Format('yyyy-MM-dd hh:mm:ss'),
                    value: err.message
                });
            }
        },
        _resetInner: function(innerHtml) {
            if (!innerHtml || !innerHtml.length) {
                __errorMessage__.push({
                    timestamp: (new Date()).Format('yyyy-MM-dd hh:mm:ss'),
                    value: 'layoutCover:No innerHtml to resetInner;'
                });
                return;
            }
            __self__.html(__innerHtml__ = innerHtml);
        },
        _hide: function() {
            if (!__anchor__ || !__anchor__.hide) return;
            __anchor__.fadeOut(2500);
        },
        _show: function() {
            if (!__anchor__ || !__anchor__.show) return;
            __anchor__.show();
        },
        _destory: function() {
            __self__.empty();
            __anchor__.empty();

            __errorMessage__ = [];
            __anchor__ = null;
            __self__ = null;
            __config__ = null;
            __innerHtml__ = null;
        },
        _setAErrorMessage: function(value) {
            if (typeof value !== 'string') return;
            __errorMessage__.push({
                timestamp: (new Date()).Format('yyyy-MM-dd hh:mm:ss'),
                value: value
            });
        },
        _getErrors: function(outputType) {
            if (!__errorMessage__.length) return false;
            __self__.html(__innerHtml__ = getErrors(outputType));
            return true;
        },
        _clearErrors: function() {
            __errorMessage__.length = 0;
        }
    };
    return factory;
});