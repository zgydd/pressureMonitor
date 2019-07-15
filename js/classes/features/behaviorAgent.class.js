;
var Behavioragent = (function behavioragentClosure() {
    'use strict';

    function Behavioragent(productInfo, size, arch) {
        this.__ID__ = productInfo.com;
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        this.__inEdgeDetectionRange__ = false;
        this.__inSkeletonDetectionRange__ = false;
        this.__hasSomethingIn__ = {
            has: false,
            tmpCheck: false
        };
        this.__DOM__ = $('<div></div>').addClass('viewer');
        //this.__DOM__.addClass('hidden');
        this.__items__ = {
            leave: {
                mark: $('<label z-lang="P035">离开次数：</label>'),
                html: $('<span>0</span>'),
                value: 0
            },
            back: {
                mark: $('<label z-lang="P036">返回次数：</label>'),
                html: $('<span>0</span>'),
                value: 0
            },
            turn: {
                mark: $('<label z-lang="P037">翻身次数：</label>'),
                html: $('<span>0</span>'),
                value: 0
            }
        };
        this.__EDGE__ = document.createElement('canvas');
        this.__EDGE__.width = size.width;
        this.__EDGE__.height = size.height;
        this.__EDGE__.style.zIndex = 10;
        this.__SKELETON__ = document.createElement('canvas');
        this.__SKELETON__.width = size.width;
        this.__SKELETON__.height = size.height;
        this.__SKELETON__.style.zIndex = 10;
        workerCoordinator._registerWorker(this.__ID__, 'edge', this.edgeDetectionCallback.bind(this));
        workerCoordinator._registerWorker(this.__ID__, 'skeleton', this.skeletonExtractionCallback.bind(this));
        this.__DOM__.append(this.__items__.leave.mark);
        this.__DOM__.append(this.__items__.leave.html);
        this.__DOM__.append(this.__items__.back.mark);
        this.__DOM__.append(this.__items__.back.html);
        this.__DOM__.append(this.__items__.turn.mark);
        this.__DOM__.append(this.__items__.turn.html);
        //arch.append(this.__EDGE__);
        //arch.append(this.__SKELETON__);
    };
    Behavioragent.prototype = {
        edgeDetectionCallback: function(data) {
            var countHasValue = 0;
            var cav = this.__EDGE__;
            var context = cav.getContext('2d');
            context.clearRect(0, 0, cav.width, cav.height);
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (var i = 0; i < data.matrix.length; i++) {
                for (var j = 0; j < data.matrix[i].length; j++) {
                    if (data.matrix[i][j] > data.maxValue * (68 / 100)) {
                        context.fillRect(i, j, 1, 1);
                        countHasValue++;
                    }
                }
            }
            /*
            if (countHasValue > 200) {
                if (!this.__hasSomethingIn__.tmpCheck) this.__hasSomethingIn__.tmpCheck = true;
                else {
                    if (!this.__hasSomethingIn__.has) {
                        this.__items__.back.html.html(++this.__items__.back.value);
                        if (this._backListener && this._backListener.length) {
                            for (var i = 0; i < this._backListener.length; i++) {
                                this._backListener[i]();
                            }
                        }
                    }
                    this.__hasSomethingIn__.has = true;
                }
            } else if (this.__hasSomethingIn__.has) {
                if (this.__hasSomethingIn__.tmpCheck) this.__hasSomethingIn__.tmpCheck = false;
                else {
                    this.__items__.leave.html.html(++this.__items__.leave.value);
                    if (this._leaveListener && this._leaveListener.length) {
                        for (var i = 0; i < this._leaveListener.length; i++) {
                            this._leaveListener[i]();
                        }
                    }
                    this.__hasSomethingIn__.has = false;
                }
            }
            */
            this.__inEdgeDetectionRange__ = false;
        },
        skeletonExtractionCallback: function(data) {
            var modFlg = false;
            var checkSkeleton = (commonFunc._isArray(this.__storeSkeleton__) && this.__storeSkeleton__.length && this.__storeSkeleton__[0].length && this.__storeSkeleton__.length === data.skeleton.length && this.__storeSkeleton__[0].length === data.skeleton[0].length);
            var cntSameData = 0;
            var cntThisSkeleton = 0;
            var countInsidePoint = 0;
            var countEndPoint = 0;
            var cav = this.__SKELETON__;
            var context = cav.getContext('2d');
            context.clearRect(0, 0, cav.width, cav.height);
            context.fillStyle = 'rgba(175, 175, 175, 0.8)';
            for (var i = 0; i < data.skeleton.length; i++) {
                for (var j = 0; j < data.skeleton[i].length; j++) {
                    if (data.skeleton[i][j] > 0) {
                        context.fillRect(i, j, 1, 1);
                        var p4 = (j === data.skeleton[i].length - 1) ? 0 : data.skeleton[i][j + 1];
                        var p8 = (j === 0) ? 0 : data.skeleton[i][j - 1];
                        var p2 = (i === 0) ? 0 : data.skeleton[i - 1][j];
                        var p3 = (i === 0 || j === data.skeleton[i].length - 1) ? 0 : data.skeleton[i - 1][j + 1];
                        var p9 = (i === 0 || j === 0) ? 0 : data.skeleton[i - 1][j - 1];
                        var p6 = (i === data.skeleton.length - 1) ? 0 : data.skeleton[i + 1][j];
                        var p5 = (i === data.skeleton.length - 1 || j === data.skeleton[i].length - 1) ? 0 : data.skeleton[i + 1][j + 1];
                        var p7 = (i === data.skeleton.length - 1 || j === 0) ? 0 : data.skeleton[i + 1][j - 1];
                        if (p4 + p8 + p2 + p3 + p9 + p6 + p5 + p7 > 2) countInsidePoint++;
                        if (p4 + p8 + p2 + p3 + p9 + p6 + p5 + p7 === 1) countEndPoint++;
                    }
                    if (checkSkeleton) {
                        if (this.__storeSkeleton__[i][j] > 0) {
                            cntThisSkeleton++;
                            if (data.skeleton[i][j] === this.__storeSkeleton__[i][j]) cntSameData++;
                        }
                    }
                }
            }
            if (countEndPoint > 4 && countInsidePoint > 30) {
                if (!this.__hasSomethingIn__.has) {
                    this.__items__.back.html.html(++this.__items__.back.value);
                    if (this._backListener && this._backListener.length) {
                        for (var i = 0; i < this._backListener.length; i++) {
                            this._backListener[i].func();
                        }
                    }
                    modFlg = true;
                }
                this.__hasSomethingIn__.has = true;
            } else {
                if (this.__hasSomethingIn__.has) {
                    this.__items__.leave.html.html(++this.__items__.leave.value);
                    if (this._leaveListener && this._leaveListener.length) {
                        for (var i = 0; i < this._leaveListener.length; i++) {
                            this._leaveListener[i].func();
                        }
                    }
                    modFlg = true;
                }
                this.__hasSomethingIn__.has = false;
            }
            /*
            if (countInsidePoint > 50) {
                if (!this.__hasSomethingIn__.tmpCheck) this.__hasSomethingIn__.tmpCheck = true;
                else {
                    if (!this.__hasSomethingIn__.has) {
                        this.__items__.back.html.html(++this.__items__.back.value);
                        if (this._backListener && this._backListener.length) {
                            for (var i = 0; i < this._backListener.length; i++) {
                                this._backListener[i]();
                            }
                        }
                        this.__hasSomethingIn__.has = true;
                        modFlg = true;
                    }
                }
            } else if (this.__hasSomethingIn__.has) {
                if (this.__hasSomethingIn__.tmpCheck) this.__hasSomethingIn__.tmpCheck = false;
                else {
                    this.__items__.leave.html.html(++this.__items__.leave.value);
                    if (this._leaveListener && this._leaveListener.length) {
                        for (var i = 0; i < this._leaveListener.length; i++) {
                            this._leaveListener[i]();
                        }
                    }
                    this.__hasSomethingIn__.has = false;
                    modFlg = true;
                }
            }
            */
            this.__inSkeletonDetectionRange__ = false;
            if (!modFlg && this.__hasSomethingIn__.has && checkSkeleton) {
                switch (true) {
                    case (cntSameData === 0):
                    case (cntSameData < cntThisSkeleton && (cntSameData / cntThisSkeleton) < 0.1):
                        //console.log('cntThisSkeleton=' + cntThisSkeleton + ';cntSameData=' + cntSameData);
                        this.__items__.turn.html.html(++this.__items__.turn.value);
                        if (this._turnListener && this._turnListener.length) {
                            for (var i = 0; i < this._turnListener.length; i++) {
                                this._turnListener[i].func();
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
            this.__storeSkeleton__ = data.skeleton.clone();
        },
        _linkRepaintCallback: function(id, jcanvas) {
            if (!jcanvas.length) return;
            var that = null;
            switch (true) {
                case (typeof this === 'object' && this.hasOwnProperty('behavior')):
                    that = this.behavior;
                    break;
                case (typeof this === 'object' && !this.hasOwnProperty('behavior')):
                    that = this;
                    break;
                default:
                    break;
            }
            var canvas = jcanvas.get(0);
            var ctx = canvas.getContext("2d");
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            var binaryImage = commonFunc._getBinaryImage(imgData, canvas.width, (this.__PRODUCTCONFIG__.radiusCoefficient || 1.2));
            if (!that.__inEdgeDetectionRange__) {
                that.__inEdgeDetectionRange__ = true;
                var postEData = {};
                postEData.imgData = binaryImage;
                postEData.filterTimes = 0;
                postEData.id = that.__ID__;
                workerCoordinator._postEdgeMessage(JSON.stringify(postEData));
            }
            if (!that.__inSkeletonDetectionRange__) {
                that.__inSkeletonDetectionRange__ = true;
                var postSData = {};
                postSData.binaryImg = binaryImage;
                postSData.skeletonLimit = 0;
                postSData.id = that.__ID__;
                workerCoordinator._postSkeletonMessage(JSON.stringify(postSData));
            }
        },
        _getDom: function() {
            return this.__DOM__;
        },
        _registerListener: function(type, key, func) {
            switch (type) {
                case 'leave':
                    if (!this._leaveListener) this._leaveListener = [];
                    commonFunc._registerClosureListener(this._leaveListener, key, func);
                    break;
                case 'back':
                    if (!this._backListener) this._backListener = [];
                    commonFunc._registerClosureListener(this._backListener, key, func);
                    break;
                case 'turn':
                    if (!this._turnListener) this._turnListener = [];
                    commonFunc._registerClosureListener(this._turnListener, key, func);
                    break;
                default:
                    break;
            }
        },
        _unRegisterListener: function(type, key) {
            switch (type) {
                case 'leave':
                    commonFunc._unRegisterClosureListener(this._leaveListener, key);
                    break;
                case 'back':
                    commonFunc._unRegisterClosureListener(this._backListener, key);
                    break;
                case 'turn':
                    commonFunc._unRegisterClosureListener(this._turnListener, key);
                    break;
                default:
                    break;
            }
        },
        _destroy: function() {
            workerCoordinator._unRegisterWorker(this.__ID__, 'edge');
            workerCoordinator._unRegisterWorker(this.__ID__, 'skeleton');
            this._leaveListener = null;
            this._backListener = null;
            this._turnListener = null;
            this.__items__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
            this.__ID__ = null;
            this.__EDGE__ = null;
            this.__SKELETON__ = null;
            this.__storeSkeleton__.length = 0;
            this.__storeSkeleton__ = null;
            this.__inEdgeDetectionRange__ = null;
            this.__inSkeletonDetectionRange__ = null;
        }
    };
    return Behavioragent;
})();