;
var Saveagent = (function saveagentClosure() {
    'use strict';

    function Saveagent(productInfo, heatmapHook, features) {
        this.__ID__ = productInfo.com;
        var sysConfig = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__viewMatrixFormula__ = (sysConfig.viewMatrixFormula ? sysConfig.viewMatrixFormula : '{0}');
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__features__ = features;
        this.imgHook = heatmapHook;
        this.__txtFileName__ = $('<input type="text" />');
        this.__btnSave__ = $('<button z-lang="B003">保存数据</button>').addClass('btn btn-show-data');
        this.__btnSave__.on('click', this.saveData.bind(this));
        this.__DOM__.append($('<span z-lang="C021">文件名</span>')).append(this.__txtFileName__).append(this.__btnSave__);
    };
    Saveagent.prototype = {
        saveData: function() {
            if (this.__btnSave__.hasClass('disabled')) return;
            this.__btnSave__.addClass('disabled');
            this.tmpFileName = (new Date()).Format('yyyy-MM-dd_hh-mm-ss');
            if (this.__txtFileName__.val().trim() !== '') this.tmpFileName = this.__txtFileName__.val().trim();
            this.tmpImgData = null;
            this.matrixData = null;
            var env = rootScope._get('_ENV_');
            if (this.imgHook) this.tmpImgData = this.imgHook._getImageData();
            if (this.tmpImgData) this.tmpImgData = this.tmpImgData.screenShot.toDataURL();
            var target = dataLinks._getTarget(this.__ID__);
            if (target && target.instance) this.matrixData = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0)).matrix;
            if (this.matrixData) {
                for (var i = 0; i < this.matrixData.length; i++) {
                    for (var j = 0; j < this.matrixData[i].length; j++) {
                        this.matrixData[i][j] = commonFunc._toFloat(eval(this.__viewMatrixFormula__.format(this.matrixData[i][j])));
                    }
                }
            }
            if (!env.testMode) logic._interfaceConnecter('saveRecord', this, env);
            else {
                io._saveImageFromHeatmap(this.tmpImgData, this.tmpFileName);
                io._saveMartix(this.matrixData, this.tmpFileName);
                this._saveRecordSavedCallback();
            }
        },
        _saveRecordSavedCallback: function() {
            this.tmpFileName = null;
            this.tmpImgData = null;
            this.__btnSave__.removeClass('disabled');
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _destroy: function() {
            this.__btnSave__.off('click');
            //this.__tmpPreInner__ = null;
            this.__btnSave__ = null;
            this.__txtFileName__ = null;
            this.tmpFileName = null;
            this.matrixData = null;
            this.tmpImgData = null;
            this.__viewMatrixFormula__ = null;
            this.__features__ = null;
            this.imgHook = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
        }
    };
    return Saveagent;
})();