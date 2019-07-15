'use strict';
var _setConfig_ = function(jsonData) {
    var data = JSON.parse(jsonData);
    var env = rootScope._get('_ENV_');
    if (data.hasOwnProperty('systemConfig')) env.systemConfig = commonFunc._mergeObject(env.systemConfig, data.systemConfig);
    if (data.hasOwnProperty('useConfig')) env.useConfig = commonFunc._mergeObject(env.useConfig, data.useConfig);
};
var _getEnvironment_ = function() {
    return JSON.stringify(rootScope._get('_ENV_'));
};
var _getInterfaceData_ = function(id, data, productInfo) {
    var pdInfo = undefined;
    if (productInfo) pdInfo = JSON.parse(productInfo);
    interfaceDataPool._setData(id, JSON.parse(data), pdInfo);
};
var _defaultSystemConfigCallback_ = function(jsonData) {
    try {
        rootScope._get('_ENV_').systemConfig = JSON.parse(jsonData);
    } catch (e) {
        rootScope._get('_ENV_').systemConfig = {};
    } finally {
        callbackStream._defaultSystemConfigCallback();
    }
};
var _customSystemConfigCallback_ = function(jsonData) {
    try {
        var customSystemConfig = JSON.parse(jsonData) || {};
        rootScope._get('_ENV_').systemConfig = commonFunc._mergeObject(rootScope._get('_ENV_').systemConfig, customSystemConfig);
    } catch (e) {} finally {
        callbackStream._customSystemConfigCallback();
    }
};
var _languageMapCallback_ = function(jsonData) {
    try {
        rootScope._get('_ENV_').languageMap = JSON.parse(jsonData);
    } catch (e) {
        rootScope._get('_ENV_').languageMap = {};
    } finally {
        callbackStream._languageMapCallback();
    }
};
var _useConfigCallback_ = function(jsonData) {
    try {
        rootScope._get('_ENV_').useConfig = JSON.parse(jsonData) || {};
    } catch (e) {
        rootScope._get('_ENV_').useConfig = {};
    } finally {
        callbackStream._useConfigCallback();
    }
};
var _useConfigAllCallback_ = function(jsonData) {
    var env = rootScope._get('_ENV_');
    try {
        env.useConfig.default = JSON.parse(jsonData) || {};
        env.useConfig.default.lang = logic._getLocalLang();
    } catch (e) {
        env.useConfig.default = {
            lang: logic._getLocalLang()
        };
    } finally {
        callbackStream._useConfigAllCallback();
    }
};
var _userInfoCallback_ = function(jsonData) {
    try {
        rootScope._get('_ENV_').userList = JSON.parse(jsonData);
    } catch (e) {} finally {
        callbackStream._userInfoCallback();
    }
};
var _scaleListCallback_ = function(jsonData) {
    try {
        rootScope._get('_ENV_').scaleList = JSON.parse(jsonData);
    } catch (e) {} finally {
        callbackStream._scaleListCallback();
    }
};
var _defaultScaleTableCallback_ = function(id, jsonData) {
    var scaleTable = {};
    try {
        scaleTable = JSON.parse(jsonData);
    } catch (e) {}
    pageController._setDefaultScale(id, scaleTable);
};
var _activedScaleTableCallback_ = function(id, jsonData) {
    var scaleTable = {};
    try {
        scaleTable = JSON.parse(jsonData);
    } catch (e) {}
    pageController._setActivedScale(id, scaleTable);
};
var _changedScaleTableCallback_ = function(id, jsonData) {
    var scaleTable = {};
    try {
        scaleTable = JSON.parse(jsonData);
    } catch (e) {}
    pageController._setChangedScale(id, scaleTable);
};
var _determinedScaleTableCallback_ = function(id, jsonData) {
    var scaleTable = {};
    try {
        scaleTable = JSON.parse(jsonData);
    } catch (e) {}
    pageController._setDeterminedScale(id, scaleTable);
};
var _gaitRecordSavedCallback_ = function(id) {
    pageController._gaitRecordSaved(id);
};
var _keepRecordSavedCallback_ = function(id) {
    pageController._keepRecordSaved(id);
};
var _getGaitListCallback_ = function(data) {
    pageController._setGaitList(data);
};
var _getGaitRecordCallback_ = function(data) {
    pageController._getGaitRecord(data);
};
var _saveRecordSavedCallback_ = function(id) {
    pageController._saveRecordSaved(id);
};
var _outputCSVSavedCallback_ = function(id) {
    pageController._outputCSVSaved(id);
};
var _delRecordDeletedCallback_ = function(type) {
    pageController._deletedRecorDeleted(type);
};
var _userListSavedCallback_ = function() {
    pageController._userListSaved();
};
var _getKeepListCallback_ = function(data) {
    pageController._setKeepList(data);
};
var _getKeepRecordCallback_ = function(data) {
    pageController._getKeepRecord(data);
};