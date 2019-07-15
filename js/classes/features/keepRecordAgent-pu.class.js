;
var Keeprecordagent = (function keeprecordagentClosure() {
    'use strict';

    function Keeprecordagent(productInfo, heatmapHook) {
        this.__ID__ = productInfo.com;
        this.__DOM__ = $('<div></div>').addClass('viewer');
        this.__userConfig__ = rootScope._get('_ENV_').useConfig[this.__ID__];
        this.inRecord = false;
        this.cursorShowMap = 0;
        this.imgHook = heatmapHook;
        this.checkHandle = 0;
        this.bySend = false;
        this.inSave = false;
        this.activedRecord = {
            startTimestamp: 0,
            finishedTimestamp: 0,
            turnSTimestamp: 0,
            turnETimestamp: 0,
            map: null
        };
    };
    Keeprecordagent.prototype = {
        saveRecord: function() {
            if (!this.activedRecord.startTimestamp) {
                this.activedRecord.startTimestamp = (new Date()).getTime();
                this.activedRecord.turnSTimestamp = (new Date()).getTime();
                return;
            }
            if (this.inSave) return;
            this.cursorShowMap++;
            if (this.cursorShowMap >= 3) this.cursorShowMap = 0;
            this.bySend = false;
            this.inSave = true;
            var tmpStack = rootScope._get('_STACK_');
            this.recordInfo = {
                id: this.__ID__,
                startTimestamp: this.activedRecord.startTimestamp,
                scaleTable: (tmpStack ? tmpStack.scaleTableName : '--')
            };
            if (this.activedRecord.finishedTimestamp) this.recordInfo.duration = commonFunc._getShownDifferentTime(new Date(this.activedRecord.finishedTimestamp), this.activedRecord.startTimestamp);
            else this.recordInfo.duration = commonFunc._getShownDifferentTime(new Date(), this.activedRecord.startTimestamp);
            var env = rootScope._get('_ENV_');
            if (!env.testMode) logic._interfaceConnecter('keepRecord', this, env);
            else {
                io._saveKeepRecord(this.activedRecord, this.recordInfo);
                this._keepRecordSavedCallback();
            }
        },
        sendRecord: function() {
            if (!this.__userConfig__.keepRecord) return;
            var tmpCanvas = this.imgHook._getImageData();
            if (!tmpCanvas && this.inRecord) {
                this.checkHandle = setTimeout(this.sendRecord.bind(this), 2000);
                return;
            }
            if (tmpCanvas && tmpCanvas.screenShot) this.activedRecord.map = logic._meargeCanvas(this.activedRecord.map, tmpCanvas.screenShot);
            if (this.activedRecord.map && this.bySend) this.saveRecord();
            if (this.inRecord) this.checkHandle = setTimeout(this.sendRecord.bind(this), 2000);
            else if (this.activedRecord.startTimestamp) {
                this.activedRecord.finishedTimestamp = (new Date()).getTime();
                clearTimeout(this.checkHandle);
                this.checkHandle = 0;
                this.saveRecord();
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _startRecord: function() {
            if (!this.__userConfig__.keepRecord) return;
            this.inRecord = true;
            this.cursorShowMap = 0;
            if (this.checkHandle) {
                clearTimeout(this.checkHandle);
                this.checkHandle = 0;
            }
            this.activedRecord.startTimestamp = (new Date()).getTime();
            this.activedRecord.turnSTimestamp = (new Date()).getTime();
            this.activedRecord.finishedTimestamp = 0;
            this.bySend = true;
            this.sendRecord();
        },
        _sendRecord: function() {
            if (!this.__userConfig__.keepRecord) return;
            if (this.checkHandle) {
                clearTimeout(this.checkHandle);
                this.checkHandle = 0;
            }
            this.activedRecord.turnETimestamp = (new Date()).getTime();
            this.bySend = true;
            this.sendRecord();
        },
        _stopRecord: function() {
            if (!this.__userConfig__.keepRecord) return;
            this.inRecord = false;
            this.cursorShowMap = 0;
            if (this.checkHandle) {
                clearTimeout(this.checkHandle);
                this.checkHandle = 0;
            }
            this.activedRecord.finishedTimestamp = (new Date()).getTime();
            this.bySend = true;
            this.sendRecord();
        },
        _keepRecordSavedCallback: function() {
            this.inSave = false;
            this.activedRecord.map = null;
            this.recordInfo = null;
            switch (true) {
                case (this.activedRecord.finishedTimestamp > 0):
                    this.activedRecord.startTimestamp = 0;
                    this.activedRecord.turnSTimestamp = 0;
                    this.activedRecord.turnETimestamp = 0;
                    this.activedRecord.finishedTimestamp = 0;
                    break;
                case (this.activedRecord.turnETimestamp > 0):
                    this.activedRecord.turnSTimestamp = (new Date()).getTime();
                    this.activedRecord.turnETimestamp = 0;
                    break;
                default:
                    break;
            }
        },
        _destroy: function() {
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
            this.__userConfig__ = null;
            this.inRecord = null;
            this.imgHook = null;
            this.cursorShowMap = null;
            this.activedRecord = null;
            this.recordInfo = null;
            this.checkHandle = null;
            this.bySend = null;
            this.inSave = null;
        }
    };
    return Keeprecordagent;
})();