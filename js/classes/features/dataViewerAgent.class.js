;
var Datavieweragent = (function datavieweragentClosure() {
    'use strict';

    function Datavieweragent(productInfo, features) {
        this.__ID__ = productInfo.com;
        var sysConfig = rootScope._get('_ENV_').systemConfig[productInfo.type];
        this.__viewMatrixFormula__ = (sysConfig.viewMatrixFormula ? sysConfig.viewMatrixFormula : '{0}');
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__size__ = productInfo.size;
        //this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.__features__ = features;
        this.__btnShow__ = $('<button z-lang="B001">数据</button>').addClass('btn btn-show-data');
        this.__btnShow__.on('click', logic._showDataViewer.bind(this));
        this.__DOM__.append(this.__btnShow__);
    };
    Datavieweragent.prototype = {
        _refreshLocale: function() {
            var useConfig = rootScope._get('_ENV_').useConfig[this.__ID__];
            logic._traverseLocales(this.__DOM__, rootScope._get('_ENV_').languageMap[useConfig.lang], useConfig.lang);
        },
        _refreshDataViewer: function(id) {
            if (id !== this.__ID__) return;
            if (!this._dataShower || !this._dataShower.length || !this._CAVCFG) return;
            var target = dataLinks._getTarget(this.__ID__);
            var dataCollection = target.instance._getDataCollection((this.__features__.indexOf('P002') >= 0));
            var innerData = dataCollection.matrix;
            var cavGrid = this._dataShower.children('canvas');
            if (!cavGrid.length) alert('Lost CAV!!');
            cavGrid = cavGrid.get(0);
            var context = cavGrid.getContext('2d');
            context.fillStyle = '#000';
            context.font = '10px Arial';
            context.strokeStyle = '#000';
            //i * this._CAVCFG.heightRadius
            //j * this._CAVCFG.widthRadius + this._CAVCFG.widthRadius
            //i * this._CAVCFG.heightRadius + this._CAVCFG.heightRadius
            //j * this._CAVCFG.widthRadius
            var hOffset = 0.5 * this._CAVCFG.heightRadius - 6;
            for (var i = 0; i < innerData.length; i++) {
                for (var j = 0; j < innerData[i].length; j++) {
                    var value = commonFunc._toInt(eval(this.__viewMatrixFormula__.format(innerData[i][j])));
                    context.clearRect(j * this._CAVCFG.widthRadius + 1, i * this._CAVCFG.heightRadius + 1, this._CAVCFG.widthRadius - 2, this._CAVCFG.heightRadius - 2);
                    if (value > 0) context.fillText(value, j * this._CAVCFG.widthRadius + 2, i * this._CAVCFG.heightRadius + this._CAVCFG.heightRadius - hOffset);
                }
            }
            context.stroke();
            context.save();
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _registerDataViewer: function() {
            if (!this._dataShower || !this._dataShower.length) return;
            this.__inActived__ = true;
            dataLinks._registerListener('runtime', 'dataViewer_refresh' + this.__ID__, this._refreshDataViewer.bind(this));
        },
        _unRegisterDataViewer: function() {
            if (!this._dataShower || !this._dataShower.length) return;
            this.__inActived__ = false;
            dataLinks._unRegisterListener('runtime', 'dataViewer_refresh' + this.__ID__);
        },
        _destroy: function() {
            this.__btnShow__.off('click');
            //this.__tmpPreInner__ = null;
            this.__btnShow__ = null;
            this.__size__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__inActived__ = null;
            this.__ID__ = null;
        }
    };
    return Datavieweragent;
})();