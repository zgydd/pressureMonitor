;
var Serialpackage = (function serialpackageClosure() {
    'use strict';

    function Serialpackage() {
        this.__charts__ = {};
        this.__serialData__ = {
            origin: [],
            heart: [],
            breath: [],
            rHeart: '--',
            rBreath: '--',
            motion: '未知',
            status: '未知',
            product: '未知',
            dateLine: []
        };
        this.__privateParams__ = {
            dataLength: 1500
        };
        this.__constMontion__ = ['正常', '信号学习中', '信号过弱', '有微弱动作', '有动作'];
        this.__constProductType__ = ['未知', '床垫', '坐垫', '跌倒垫', '离床垫'];
        this.__constStatus__ = ['故障', '在床', '离床'];
        this.__constSitStatus__ = ['正坐', '左倾', '右倾', '前倾', '后倾'];
        this.__DOM__ = $('<div><div class="chart" id="heartWave"></div><div class="chart" id="breathWave"></div></div>').addClass('chart-container');
        nodeSerialport._init(this.dataHandle.bind(this), this.disConnectHandle.bind(this));
        setInterval(nodeSerialport._findPort, 2000);
    };
    Serialpackage.prototype = {
        dataHandle: function(event) {
            var data = JSON.parse(event.data);
            var dateLineUpdeted = false;
            var lengthFlg = {
                origin: this.__privateParams__.dataLength,
                heart: this.__privateParams__.dataLength,
                breath: this.__privateParams__.dataLength,
                dateLine: this.__privateParams__.dataLength
            };
            if (data.hasOwnProperty('origin') && commonFunc._isArray(data.origin)) {
                for (var i = 0; i < data.origin.length; i++) {
                    this.__serialData__.origin.push(data.origin[i]);
                    if (!dateLineUpdeted) this.__serialData__.dateLine.push((new Date()).Format('hh:mm:ss S'));
                }
                lengthFlg.origin = data.origin.length;
                if (!dateLineUpdeted) lengthFlg.dateLine = data.origin.length;
                dateLineUpdeted = true;
            }
            if (data.hasOwnProperty('heart') && commonFunc._isArray(data.heart)) {
                for (var i = 0; i < data.heart.length; i++) {
                    this.__serialData__.heart.push(data.heart[i]);
                    if (!dateLineUpdeted) this.__serialData__.dateLine.push((new Date()).Format('hh:mm:ss S'));
                }
                lengthFlg.heart = data.heart.length;
                if (!dateLineUpdeted) lengthFlg.dateLine = data.heart.length;
                dateLineUpdeted = true;
            }
            if (data.hasOwnProperty('breath') && commonFunc._isArray(data.breath)) {
                for (var i = 0; i < data.breath.length; i++) {
                    this.__serialData__.breath.push(data.breath[i]);
                    if (!dateLineUpdeted) this.__serialData__.dateLine.push((new Date()).Format('hh:mm:ss S'));
                }
                lengthFlg.breath = data.breath.length;
                if (!dateLineUpdeted) lengthFlg.dateLine = data.breath.length;
                dateLineUpdeted = true;
            }
            if (this.__serialData__.origin.length > this.__privateParams__.dataLength) this.__serialData__.origin.splice(0, lengthFlg.origin);
            if (this.__serialData__.heart.length > this.__privateParams__.dataLength) this.__serialData__.heart.splice(0, lengthFlg.heart);
            if (this.__serialData__.breath.length > this.__privateParams__.dataLength) this.__serialData__.breath.splice(0, lengthFlg.breath);
            if (this.__serialData__.dateLine.length > this.__privateParams__.dataLength) this.__serialData__.dateLine.splice(0, lengthFlg.dateLine);
            if (data.hasOwnProperty('rHeart') && typeof data.rHeart === 'number' /*&& data.motion !== 1*/ ) this.__serialData__.rHeart = data.rHeart;
            if (data.hasOwnProperty('rBreath') && typeof data.rBreath === 'number' /*&& data.motion !== 1*/ ) this.__serialData__.rBreath = data.rBreath;
            if (data.hasOwnProperty('motion') && typeof data.motion === 'string') {
                var idxMotion = commonFunc._binary2Int(data.motion);
                if (idxMotion < this.__constMontion__.length) this.__serialData__.motion = this.__constMontion__[idxMotion];
                else this.__serialData__.motion = '未知' + idxMotion;
            }
            var pdIdx = -1;
            var staIdx = -1;
            if (data.hasOwnProperty('pdType') && typeof data.pdType === 'string') pdIdx = commonFunc._binary2Int(data.pdType);
            switch (pdIdx) {
                case 1:
                case 3:
                case 4:
                    if (data.hasOwnProperty('status') && typeof data.status === 'string') staIdx = commonFunc._binary2Int(data.status);
                    if (staIdx >= 0 && staIdx < this.__constStatus__.length) this.__serialData__.status = this.__constStatus__[staIdx];
                    else this.__serialData__.status += ':' + staIdx;
                    break;
                case 2:
                    if (data.hasOwnProperty('sitStatus') && typeof data.sitStatus === 'string') staIdx = commonFunc._binary2Int(data.sitStatus);
                    if (staIdx >= 0 && staIdx < this.__constSitStatus__.length) this.__serialData__.status = this.__constSitStatus__[staIdx];
                    else this.__serialData__.status += ':' + staIdx;
                    break;
                default:
                    break;
            }
            if (pdIdx >= 0 && pdIdx < this.__constProductType__.length) this.__serialData__.product = this.__constProductType__[pdIdx];
            else this.__serialData__.product += ':' + pdIdx;
            for (var i = this.__serialData__.origin.length - lengthFlg; i < this.__serialData__.origin.length; i++) {
                var libResult = libBridge._getAstruct(this.__serialData__.origin[i], this.__serialData__.heart[i], this.__serialData__.breath[i], this.__serialData__.rHeart, this.__serialData__.rBreath);
                this.__serialData__.origin[i] = libResult.origin;
                this.__serialData__.heart[i] = libResult.heart;
                this.__serialData__.breath[i] = libResult.breath;
                //this.__serialData__.rHeart = libResult.rHeart;
                //this.__serialData__.rBreath = libResult.rBreath;
            }
            if (pdIdx === 1 && (staIdx === 0 || staIdx === 2)) {
                this.__serialData__.rHeart = '--';
                this.__serialData__.rBreath = '--';
            }
            if (this.__serialData__.hasOwnProperty('heart') && commonFunc._isArray(this.__serialData__.heart)) this.__charts__.heart.setOption(heartWave._refreshData(this.__serialData__.heart, this.__serialData__.dateLine, this.__serialData__.rHeart));
            if (this.__serialData__.hasOwnProperty('breath') && commonFunc._isArray(this.__serialData__.breath)) this.__charts__.breath.setOption(breathWave._refreshData(this.__serialData__.breath, this.__serialData__.dateLine, this.__serialData__.rBreath));
            $('#heartRate').html(this.__serialData__.rHeart);
            $('#breathRate').html(this.__serialData__.rBreath);
        },
        disConnectHandle: function() {},
        _getDom: function() {
            return this.__DOM__;
        },
        _initChart: function() {
            this.__charts__.breath = echarts.init(document.getElementById('breathWave'));
            this.__charts__.heart = echarts.init(document.getElementById('heartWave'));
            this.__charts__.breath.setOption(breathWave._init());
            this.__charts__.heart.setOption(heartWave._init());
            setTimeout(function() {
                $('main>div.left>article.sign-container').css('height', 'auto');
            }, 0);
        },
        _destory: function() {
            this.__charts__ = null;
            this.__serialData__ = null;
            this.__privateParams__ = null;
            this.__constMontion__ = null;
            this.__constProductType__ = null;
            this.__constStatus__ = null;
            this.__constSitStatus__ = null;
            this.__DOM__.empty();
            this.__DOM__ = null;
        }
    };
    return Serialpackage;
})();