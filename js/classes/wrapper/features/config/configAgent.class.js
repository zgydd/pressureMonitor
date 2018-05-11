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
})("configAgent", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __privateParam__ = {};
    var __listener__ = { alarmTypeChangedListener: [] };

    var registerAlarmTypeChangedListener = function(func) {
        commonFunc._registerListener(__listener__.alarmTypeChangedListener, func);
    };
    var unRegisterAlarmTypeChangedListener = function(func) {
        commonFunc._unRegisterListener(__listener__.alarmTypeChangedListener, func);
    };

    var clearSelf = function() {
        if (!__self__ || !__self__.length) return;
        __self__.empty();
    };
    var destoryMe = function() {
        clearSelf();
        __anchor__.empty();
        __self__ = null;
        __anchor__ = null;
    };

    var changeNoiseLimit = function() {
        var min = commonFunc._toInt($('#minNoiseLimit').val());
        var max = commonFunc._toInt($('#maxNoiseLimit').val());
        if (min < max) {
            sharingDataSet._set('minNoiseLimit', min);
            sharingDataSet._set('maxNoiseLimit', max);
            return;
        }
        var errInfo = $('#minNoiseLimit').parent().children('.checkSetInfo');
        if (!errInfo) return;
        min = 0;
        max = 100;
        if (sharingDataSet._get('minNoiseLimit') !== null)
            min = commonFunc._toInt(sharingDataSet._get('minNoiseLimit'));
        if (sharingDataSet._get('maxNoiseLimit') !== null)
            max = commonFunc._toInt(sharingDataSet._get('maxNoiseLimit'));
        errInfo.html('噪点限制设置不正确');
        $('#minNoiseLimit').val(min);
        $('#maxNoiseLimit').val(max);
        setTimeout(function() {
            errInfo.html('');
        }, 1000);
    };
    var changeAlarmFrequency = function() {
        sharingDataSet._set('alarmFrequency', commonFunc._toFloat($('#alarmFrequency').val()));
    };
    var changeAlarmKeepTime = function() {
        sharingDataSet._set('alarmKeepTime', commonFunc._toInt($('#alarmKeepTime').val()));
    };
    var changeAlarmType = function() {
        sharingDataSet._set('alarmType', commonFunc._toInt($('#alarmType').val()));
        for (var i = 0; i < __listener__.alarmTypeChangedListener.length; i++)
            __listener__.alarmTypeChangedListener[i]();
    };
    var changeLevelHighNote = function() {
        sharingDataSet._set('levelHighNote', commonFunc._toInt($('#levelHighNote').val()));
    };
    var changeKeepRecord = function() {
        sharingDataSet._set('keepRecord', $('#keepRecord').get(0).checked);
    };
    var changeProductType = function() {
        sharingDataSet._set('forceProduct', $('#forceProduct').val());
        interFace._forceChangeProductType();
    };
    var initSelf = function() {
        var activedInfo = runtimeCollection._get('activedInfo') || null;
        if (!activedInfo || !activedInfo.category) return;
        var activedLang = runtimeCollection._get('activedLanguageList');
        var minNoiseLimit = commonFunc._toInt(sharingDataSet._get('minNoiseLimit'));
        var maxNoiseLimit = commonFunc._toInt(sharingDataSet._get('maxNoiseLimit'));
        var alarmFrequency = commonFunc._toFloat(sharingDataSet._get('alarmFrequency'));
        var alarmKeepTime = commonFunc._toInt(sharingDataSet._get('alarmKeepTime'));
        var alarmType = commonFunc._toInt(sharingDataSet._get('alarmType'));
        var levelHighNote = commonFunc._toInt(sharingDataSet._get('levelHighNote'));
        var keepRecord = sharingDataSet._get('keepRecord');
        var forceProduct = sharingDataSet._get('forceProduct');
        __self__.append($('<div></div>').addClass('title').append($('<label z-lang="C007"></label>').html(activedLang.C007)));
        var tmpDiv = null;
        var innerHtml = null;
        if (activedInfo.config.features.indexOf('M001') >= 0) {
            tmpDiv = $('<div></div>').append($('<label z-lang="P023"></label>').html(activedLang.P023));
            innerHtml = '<select id="minNoiseLimit">';
            for (var i = 0; i < 50; i += 5) {
                innerHtml += '<option value="' + i + '"';
                if (minNoiseLimit === i) innerHtml += ' selected';
                innerHtml += '>' + i + '%</option>';
            }
            innerHtml += '</select>';

            $(tmpDiv).append(innerHtml);
            $(tmpDiv).append('<span>~</span>');

            innerHtml = '<select id="maxNoiseLimit">';
            for (var i = 100; i > 50; i -= 5) {
                innerHtml += '<option value="' + i + '"';
                if (maxNoiseLimit === i) innerHtml += ' selected';
                innerHtml += '>' + i + '%</option>';
            }
            innerHtml += '</select><span class="set-info"></span>';

            $(tmpDiv).append(innerHtml);
            __self__.append(tmpDiv);
        }

        if (activedInfo.config.features.indexOf('W001') >= 0) {
            tmpDiv = $('<div></div>').append($('<label z-lang="P024"></label>').html(activedLang.P024));
            innerHtml = '<select id="alarmFrequency">';
            for (var i = 0.5; i < 5.5; i += 0.5) {
                innerHtml += '<option value="' + i + '"';
                if (alarmFrequency === i) innerHtml += ' selected';
                innerHtml += '>' + i + '</option>';
            }
            innerHtml += '</select><span z-lang="C008">' + activedLang.C008 + '</span><span class="set-info"></span>';

            $(tmpDiv).append(innerHtml);
            __self__.append(tmpDiv);

            tmpDiv = $('<div></div>').append($('<label z-lang="P025"></label>').html(activedLang.P025));
            innerHtml = '<select id="alarmKeepTime">';
            for (var i = 5; i < 30; i += 5) {
                innerHtml += '<option value="' + i + '"';
                if (alarmKeepTime === i) innerHtml += ' selected';
                innerHtml += '>' + i + '</option>';
            }
            innerHtml += '</select><span z-lang="C009">' + activedLang.C009 + '</span><span class="set-info"></span>';

            $(tmpDiv).append(innerHtml);
            __self__.append(tmpDiv);

            tmpDiv = $('<div></div>').append($('<label z-lang="P026"></label>').html(activedLang.P026));
            innerHtml = '<select id="alarmType">';
            for (var i = 0; i < 2; i++) {
                innerHtml += '<option value="' + i + '"';
                if (alarmType === i) innerHtml += ' selected';
                switch (i) {
                    case 0:
                        innerHtml += ' z-lang="P027">' + activedLang.P027 + '</option>';
                        break;
                    case 1:
                        innerHtml += ' z-lang="P028">' + activedLang.P028 + '</option>';
                        break;
                    default:
                        break;
                }
            }
            innerHtml += '</select><span class="set-info"></span>';
            $(tmpDiv).append(innerHtml);
            __self__.append(tmpDiv);
        }
        if (activedInfo.config.features.indexOf('W005') >= 0) {
            tmpDiv = $('<div></div>').append($('<label z-lang="P029"></label>').html(activedLang.P029));
            innerHtml = '<select id="levelHighNote">';
            for (var i = 0; i < 3; i++) {
                innerHtml += '<option value="' + i + '"';
                if (levelHighNote === i) innerHtml += ' selected';
                switch (i) {
                    case 0:
                        innerHtml += ' z-lang="C010">' + activedLang.C010 + '</option>';
                        break;
                    case 1:
                        innerHtml += ' z-lang="P030">' + activedLang.P030 + '</option>';
                        break;
                    case 2:
                        innerHtml += ' z-lang="P031">' + activedLang.P031 + '</option>';
                        break;
                    default:
                        break;
                }
            }
            innerHtml += '</select><span class="set-info"></span>';
            $(tmpDiv).append(innerHtml);
            __self__.append(tmpDiv);
        }
        if (activedInfo.config.features.indexOf('W004') >= 0) {
            tmpDiv = $('<div></div>').append($('<label z-lang="P032"></label>').html(activedLang.P032));
            innerHtml = '<input class="check-box" type="checkbox" id="keepRecord"';
            if (keepRecord) innerHtml += ' checked';
            innerHtml += '/><span class="set-info"></span>';
            $(tmpDiv).append(innerHtml);
            __self__.append(tmpDiv);
        }
        var activedSysConfig = sharingDataSet._get('activedSysConfig');
        var productList = [];
        for (var ele in activedSysConfig) productList.push({ value: ele, name: activedSysConfig[ele].title });
        tmpDiv = $('<div></div>').append($('<label z-lang="P033"></label>').html(activedLang.P033));
        innerHtml = '<select id="forceProduct" class="wide">';
        innerHtml += '<option value="A0"';
        if (forceProduct === 'A0') innerHtml += ' selected';
        innerHtml += ' z-lang="P034">' + activedLang.P034 + '</option>';
        for (var i = 0; i < productList.length; i++) {
            innerHtml += '<option value="' + productList[i].value + '"';
            if (forceProduct === productList[i].value) innerHtml += ' selected';
            innerHtml += ' z-lang="spproduct' + productList[i].value + '">' +
                ((typeof productList[i].name === 'string') ? productList[i].name : productList[i].name[sharingDataSet._get('lang')]) +
                '</option>';
        }
        if (forceProduct) innerHtml += ' checked';
        innerHtml += '</select><span class="set-info"></span>';
        $(tmpDiv).append(innerHtml);
        __self__.append(tmpDiv);
    };
    var factory = {
        _init: function() {
            clearSelf();
            if (!__self__ || !__self__.length)
                __self__ = $('<div></div>').addClass('set-container');
            initSelf();
            return true;
        },
        _link: function(anchorElement) {
            if (!anchorElement || !anchorElement.length) return;
            __anchor__ = anchorElement;
            __anchor__.append(__self__);
        },
        _registerListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'alarmTypeChanged':
                    registerAlarmTypeChangedListener(func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, func) {
            if (!type || !func || typeof type !== 'string' || typeof func !== 'function')
                return;
            switch (type) {
                case 'alarmTypeChanged':
                    unRegisterAlarmTypeChangedListener(func);
                    break;
                default:
                    break;
            }
        },
        _registerSelfListener: function() {
            var activedInfo = runtimeCollection._get('activedInfo') || null;
            if (!activedInfo || !activedInfo.category) return;
            if (activedInfo.config.features.indexOf('M001') >= 0) {
                $('#minNoiseLimit').on('change', changeNoiseLimit);
                $('#maxNoiseLimit').on('change', changeNoiseLimit);
            }
            if (activedInfo.config.features.indexOf('W001') >= 0) {
                $('#alarmFrequency').on('change', changeAlarmFrequency);
                $('#alarmKeepTime').on('change', changeAlarmKeepTime);
                $('#alarmType').on('change', changeAlarmType);
            }
            if (activedInfo.config.features.indexOf('W005') >= 0)
                $('#levelHighNote').on('change', changeLevelHighNote);
            if (activedInfo.config.features.indexOf('W004') >= 0)
                $('#keepRecord').on('click', changeKeepRecord);
            $('#forceProduct').on('change', changeProductType);
        }
    };

    return factory;
});