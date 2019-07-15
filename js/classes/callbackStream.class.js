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
})("callbackStream", this, function() {
    'use strict';
    var factory = {
        _defaultSystemConfigCallback: function() {
            var env = rootScope._get('_ENV_');
            if (!env.testMode) {
                logic._interfaceConnecter('defaultSysytemConfig', this, env);
            } else {
                env.systemConfig = commonFunc._mergeObject(env.systemConfig, io._getConfig(1));
                this._customSystemConfigCallback();
            }
        },
        _customSystemConfigCallback: function() {
            var env = rootScope._get('_ENV_');
            logic._checkSystemConfig(env.systemConfig);
            if (!env.testMode) {
                logic._interfaceConnecter('customSystemConfig', this, env);
            } else {
                env.languageMap = commonFunc._getJson('./assets/jsons/language.json');
                this._languageMapCallback();
            }
        },
        _languageMapCallback: function() {
            var env = rootScope._get('_ENV_');
            if (!env.testMode) {
                logic._interfaceConnecter('languageMap', this, env);
            } else {
                env.useConfig = io._getConfig(0) || {};
                this._useConfigCallback();
            }
        },
        _useConfigCallback: function() {
            var env = rootScope._get('_ENV_');
            if (!env.useConfig.hasOwnProperty('default')) {
                if (!env.testMode) {
                    logic._interfaceConnecter('useConfig', this, env);
                } else {
                    env.useConfig.default = commonFunc._getJson('./assets/jsons/useconfig.json');
                    env.useConfig.default.lang = logic._getLocalLang();
                    this._useConfigAllCallback();
                }
            } else this._useConfigAllCallback();
        },
        _useConfigAllCallback: function() {
            var env = rootScope._get('_ENV_');
            if (!env.testMode) {
                logic._interfaceConnecter('useConfigAll', this, env);
            } else {
                env.scaleList = io._getScalesList();
                this._userInfoCallback();
            }
        },
        _userInfoCallback: function() {
            var env = rootScope._get('_ENV_');
            if (!env.testMode) {
                logic._interfaceConnecter('useInfo', this, env);
            } else {
                env.userList = io._getUserList() || [];
                this._scaleListCallback();
            }
        },
        _scaleListCallback: function() {
            var env = rootScope._get('_ENV_');
            switch (env.environment) {
                case 4:
                    env.socketInfo = io._getSocketInfo();
                    if (!env.socketInfo) env.socketInfo = commonFunc._getJson('./assets/jsons/socketInfo.json');
                    this._socketInfoCallback();
                    break;
                case 5:
                    env.matxSetInfo = io._getMatxSetInfo();
                    if (!env.matxSetInfo) env.matxSetInfo = commonFunc._getJson('./assets/jsons/matxSetInfo.json');
                    this._matxSetInfoCallback();
                    break;
                default:
                    logic._startLogicLoop();
                    break;
            }
        },
        _socketInfoCallback: function() {
            logic._startLogicLoop();
        },
        _matxSetInfoCallback: function() {
            logic._startLogicLoop();
        }
    };
    return factory;
});