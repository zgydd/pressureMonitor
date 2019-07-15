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
})("confirm", this, function() {
    'use strict';
    var __processPool__ = [];
    var __ID__ = null;
    var __ARCH__ = null;
    var controller = {
        container: $('<div class="container"></div>'),
        cancel: $('<button class="btn"></button>'),
        submit: $('<button class="btn"></button>')
    };
    var __DOM__ = $('<div class="confirm-container"></div>');
    var factory = {
        cancel: function(event) {
            event.stopPropagation();
            __ARCH__.addClass('hidden');
        },
        submit: function(event) {
            event.stopPropagation();
            var type = event.target.id.replace('actived_', '');
            for (var i = 0; i < __processPool__.length; i++) {
                if (type === __processPool__[i].type) {
                    __processPool__[i].callback();
                    break;
                }
            }
            __ARCH__.addClass('hidden');
            __ARCH__.removeClass('mongolian-edition');
        },
        _init: function(arch, id) {
            if (!id || !arch) return;
            __ID__ = id;
            __ARCH__ = arch;
            __ARCH__.empty();
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[__ID__].lang];
            __DOM__.append($('<div class="title"><label z-lang="C038">' + activedLang['C038'] + '</label></div>'));
            __DOM__.append($('<div class="sub-title"><span z-lang="C039">' + activedLang['C039'] + '</span></div>'));
            controller.cancel.attr('z-lang', 'C040').html(activedLang['C040']);
            controller.submit.attr('z-lang', 'C027').html(activedLang['C027']);
            controller.cancel.on('click', this.cancel.bind(this));
            controller.submit.on('click', this.submit.bind(this));
            __DOM__.append(controller.container.append(controller.cancel).append(controller.submit));
            __ARCH__.append(__DOM__);
        },
        _setActived: function(type) {
            controller.submit.attr('id', 'actived_' + type);
            __ARCH__.addClass('mongolian-edition');
            __ARCH__.removeClass('hidden');
        },
        _putOk: function(type, func) {
            var i = 0;
            for (i = 0; i < __processPool__.length; i++) {
                if (__processPool__[i].type === type) break;
            }
            if (i < __processPool__.length) return;
            __processPool__.push({
                type: type,
                callback: func
            });
        }
    };
    return factory;
});