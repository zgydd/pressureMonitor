'use strict';
$(document).ready(function() {
    if (typeof layoutCover === 'undefined') alert('Lost base system, try to reinstall me!');
    var layoutHead = '<div class="context text-info"><ul>';
    var layoutTail = '</ul></div>';
    var layoutOk = '';
    var lauoytIn = '<li>Before step...<i class="icon-spinner icon-spin"></i></li>';
    var layoutConfig = {
        anchorElement: $('.layout-cover'),
        innerHtml: layoutHead + layoutOk + lauoytIn + layoutTail
    };
    layoutCover._config(layoutConfig);
    if (layoutCover._getErrors(1)) return;

    if (typeof pageCoordinator === 'undefined') layoutCover._setAErrorMessage('No pageCoordinator --main;');
    if (typeof commonFunc === 'undefined') layoutCover._setAErrorMessage('No commonFunc --main;');
    if (typeof logic === 'undefined') layoutCover._setAErrorMessage('No logic --main;');
    if (typeof interFace === 'undefined') layoutCover._setAErrorMessage('No interFace --main;');
    if (typeof runtimeCollection === 'undefined') layoutCover._setAErrorMessage('No runtimeCollection --main;');
    if (typeof sharingDataSet === 'undefined') layoutCover._setAErrorMessage('No sharingDataSet --main;');
    if (layoutCover._getErrors(1)) return;

    var _ENV_ = { insideForm: interFace._isInsideForm() };
    if (_ENV_.insideForm) _ENV_.insideType = interFace._insideType();
    runtimeCollection._set('_ENV_', _ENV_);

    lauoytIn = '<li>Get base config...<i class="icon-spinner icon-spin"></i></li>';
    layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);
    if (sharingDataSet._setConfigData())
        layoutOk += '<li>Base config file lost, use default...&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
    else
        layoutOk += '<li>Base config...&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
    logic._setLanguageEnv();
    logic._traverseLocales($('#copyRight'));

    var activedLang = runtimeCollection._get('activedLanguageList');
    layoutOk += '<li><span z-lang="L001">' + activedLang.L001 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
    lauoytIn = '<li><span z-lang="L002">' + activedLang.L002 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
    layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);

    if (!_ENV_.insideForm) {
        if (typeof io === 'undefined') layoutCover._setAErrorMessage('No io --main;');
        if (layoutCover._getErrors(1)) return;
        if (typeof nwController === 'undefined') layoutCover._setAErrorMessage('No nw controller --main;');
        if (layoutCover._getErrors(1)) return;
        var runtimeCursor = nwController._init();
        if (runtimeCursor && runtimeCursor.length) {
            layoutCover._setAErrorMessage('Nw init fail --main;');
            layoutCover._getErrors(1);
            return;
        }
        layoutOk += '<li><span z-lang="C001">' + activedLang.C001 + '</span><span z-lang="M001">' + activedLang.M001 +
            '</span><span z-lang="L003">' + activedLang.L003 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        lauoytIn = '<li><span z-lang="L004">' + activedLang.L004 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
        var cfgDefault = io._getSysConfig();
        if (!cfgDefault) layoutOk += '<li><span z-lang="L005">' + activedLang.L005 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        else layoutOk += '<li><span z-lang="L006">' + activedLang.L006 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        lauoytIn = '<li><span z-lang="L007">' + activedLang.L007 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
        layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);

        var cfgCustom = io._getCustomConfig();
        if (!cfgCustom) layoutOk += '<li><span z-lang="L008">' + activedLang.L008 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        else layoutOk += '<li><span z-lang="L009">' + activedLang.L009 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        lauoytIn = '<li><span z-lang="C002">' + activedLang.C002 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
        layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);

        var activedSysConfig = null;
        if (sharingDataSet._get('sysCfgUse')) {
            activedSysConfig = commonFunc._mergeObject(cfgDefault, cfgCustom);
            layoutOk += '<li><span z-lang="C002">' + activedLang.C002 + '</span><span z-lang="M001">' + activedLang.M001 +
                '</span><span z-lang="L010">' + activedLang.L010 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        } else {
            activedSysConfig = commonFunc._mergeObject(cfgCustom, cfgDefault);
            layoutOk += '<li><span z-lang="C002">' + activedLang.C002 + '</span><span z-lang="M001">' + activedLang.M001 +
                '</span><span z-lang="L011">' + activedLang.L011 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        }
        sharingDataSet._set('activedSysConfig', activedSysConfig);
    } else {
        layoutOk += '<li><span z-lang="C001">' + activedLang.C001 + '</span><span z-lang="M001">' + activedLang.M001 +
            '</span><span z-lang="L012">' + activedLang.L012 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        lauoytIn = '<li ><span z-lang="L013">' + activedLang.L013 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
        layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);
        pageCoordinator._registerModifyListener();
        switch (_ENV_.insideType) {
            case 1:
                interFace._postData();
                interFace._setConfigData(JSON.stringify(sharingDataSet._getConfigData()));
                interFace._setActivedConfig(interFace._getDefaultSystemConfig());
                interFace._startDataWorker();
                break;
            default:
                setTimeout(function() {
                    interFace._postData();
                    interFace._setConfigData(JSON.stringify(sharingDataSet._getConfigData()));
                    interFace._setActivedConfig(interFace._getDefaultSystemConfig());
                    _setScaleGroup_(JSON.stringify(interFace._getDefaultScaleGroup()));
                    setInterval(function() {
                        //test code 0
                        interFace._startDataWorker();
                        var arrJson = [83, 65, 50, 51, 50, 95, 56, 48, 70, 48, 95, 48, 95];
                        for (var i = 0; i < 4; i++)
                            arrJson.push(commonFunc._getRandom(48, 57));
                        arrJson.push(65);
                        arrJson.push(69);
                        _bufferJsonStringCallback_(JSON.stringify(arrJson));
                        //test code 1
                        //var tmpObj = { type: 'A2', size: { x: 32, y: 80 } };
                        //var innerData = [];
                        //for (var i = 0; i < 32; i++) {
                        //    var row = [];
                        //    for (var j = 0; j < 80; j++) {
                        //        row.push(commonFunc._getRandom(0, 4096));
                        //    }
                        //    innerData.push(row.clone());
                        //tmpObj.data = innerData; 
                        //interFace._objMatrixCallback(JSON.stringify(tmpObj));
                    }, 200);
                }, 1000);
                break;
        }
    }
    lauoytIn = '<li><span z-lang="L014">' + activedLang.L014 + '</span>...<i class="icon-spinner icon-spin"></i></li>';
    layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);
    if (!pageCoordinator._init()) return;
    if (!pageCoordinator._toWait()) return;
    layoutOk += '<li><span z-lang="L014">' + activedLang.L014 + '</span>&nbsp;&nbsp;&nbsp;<i class="icon-ok"></i></li>';
    lauoytIn = '<li><span z-lang="L015">' + activedLang.L015 + '</span></li>';
    layoutCover._resetInner(layoutHead + layoutOk + lauoytIn + layoutTail);
    layoutCover._hide();
    runtimeCollection._set('runtimeInfo', {});
    if (!_ENV_.insideForm) pageCoordinator._findDataMatrix();

    /*
    $('#copyRight').on('click', function() {
        var arr = ['zh-cn', 'en-us'];
        var cursor = runtimeCollection._get('langCursor') ? runtimeCollection._get('langCursor') : arr.indexOf(sharingDataSet._get('lang'));
        if (cursor > 0) cursor = 0;
        else cursor = 1;
        sharingDataSet._set('lang', arr[cursor]);
        runtimeCollection._set('activedLanguageList', sharingDataSet._get('languageList')[arr[cursor]]);
        logic._traverseLocales();
        runtimeCollection._set('langCursor', cursor);
    });
    */
});