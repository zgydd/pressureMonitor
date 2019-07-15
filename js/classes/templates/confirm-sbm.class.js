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
    var canSubmit = false;
    var controller = {
        left: $('<div class="left-container left"><label z-lang="SBM-head-sp">SMART bed MATCH</label><img src="./assets/images/home_logo.png" /></div>'),
        right: $('<div class="right-container right"></div>'),
        iId: $('<input type="text" id="iId" readonly="readonly" />'),
        iHeight: $('<input type="number" id="iHeight" placeholder="Height" z-lang="SBM-note-height" maxLength="3" />'),
        iWeight: $('<input type="number" id="iWeight" placeholder="Weight" z-lang="SBM-note-weight" maxLength="3" />'),
        cancel: $('<img src="./assets/images/datainput_close.png" />'),
        submit: $('<button class="btn disabled" z-lang="C045">OK</button>')
    };
    var __DOM__ = $('<div class="input-container"></div>');
    var factory = {
        cancel: function(event) {
            event.stopPropagation();
            __ARCH__.addClass('hidden');
        },
        submit: function(event) {
            event.stopPropagation();
            if (!canSubmit) return;
            var currentUser = rootScope._get('_USER_');
            currentUser.id = controller.iId.val().trim();
            currentUser.height = commonFunc._toFloat(controller.iHeight.val().trim());
            currentUser.weight = commonFunc._toFloat(controller.iWeight.val().trim());
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
        checkAllow: function() {
            var height = controller.iHeight.val().trim();
            var weight = controller.iWeight.val().trim();
            if (height && weight) {
                controller.submit.removeClass('disabled');
                canSubmit = true;
            } else {
                canSubmit = false;
                if (!controller.submit.hasClass('disabled')) controller.submit.addClass('disabled');
            }
        },
        _init: function(arch, id) {
            if (!id || !arch) return;
            __ID__ = id;
            __ARCH__ = arch;
            __ARCH__.empty();
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[__ID__].lang];
            controller.cancel.on('click', this.cancel.bind(this));
            controller.submit.on('click', this.submit.bind(this));
            controller.iHeight.on('change', this.checkAllow.bind(this));
            controller.iWeight.on('change', this.checkAllow.bind(this));
            controller.right.append($('<div></div>').addClass('t-r').append(controller.cancel));
            controller.right.append('<label z-lang="SBM-tester-id">ID</label>').append($('<div></div>').addClass('item').append(controller.iId));
            controller.right.append('<label z-lang="C046">Height</label>').append($('<div></div>').addClass('item').append(controller.iHeight).append($('<span>cm</span>')));
            controller.right.append('<label z-lang="C047">Weight</label>').append($('<div></div>').addClass('item').append(controller.iWeight).append($('<span>kg</span>')));
            controller.right.append($('<div></div>').addClass('t-c mt').append(controller.submit));
            controller.right.append($('<div>&copy;<span z-lang="C006"></span></div>').addClass('t-c min'));
            __DOM__.append(controller.left).append(controller.right);
            __ARCH__.append(__DOM__);
        },
        _setActived: function(type) {
            var currentUser = rootScope._get('_USER_');
            controller.iId.val(currentUser.id);
            if (currentUser.height) controller.iHeight.val(currentUser.height);
            else controller.iHeight.val('');
            if (currentUser.weight) controller.iWeight.val(currentUser.weight);
            else controller.iWeight.val('');
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