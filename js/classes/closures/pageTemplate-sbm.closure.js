;
var Pagetemplate = (function pagetemplateClosure() {
    'use strict';

    function Pagetemplate(productInfo, anchorElement) {
        if (!productInfo || !productInfo.hasOwnProperty('com') || !productInfo.hasOwnProperty('type') || !productInfo.hasOwnProperty('size') || !productInfo.size.hasOwnProperty('x') || !productInfo.size.hasOwnProperty('y')) return;
        this.__USECONFIG__ = rootScope._get('_ENV_').useConfig[productInfo.com];
        this.__PRODUCTCONFIG__ = JSON.parse(JSON.stringify(rootScope._get('_ENV_').systemConfig[productInfo.type]));
        if (!this.__PRODUCTCONFIG__) return;
        this.inSampling = false;
        this.__ID__ = productInfo.com;
        if (this.__PRODUCTCONFIG__.features.indexOf('W008') >= 0) {
            workerCoordinator._initBodyPartDataCollection();
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('M001') >= 0) {
            this.heatmap = new Heatmapagent(productInfo);
            $('main>div.left>article.heatmap-container>.container').append(this.heatmap._getDom());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('W008') >= 0) {
            this.bodyPartCollection = new Bodypartcollectionagent(productInfo, this.heatmap._getSize(), this.__PRODUCTCONFIG__.features);
            this.heatmap._append(this.bodyPartCollection._getSpineView());
            $('main>div.left>article.heatmap-container>.human').append(this.bodyPartCollection._getSpine());
        }
        if (this.__PRODUCTCONFIG__.features.indexOf('P004') >= 0) {
            this.serialpackage = new Serialpackage(productInfo);
            $('main>div.left>article.sign-container').append(this.serialpackage._getDom());
            var that = this;
            setTimeout(function() {
                that.serialpackage._initChart();
            }, 0);
        }
        //Features connection listener
        confirm._init($('article.over-lay'), this.__ID__);
        confirm._putOk('user', this._currentUserChanged.bind(this));
        var currentUser = {
            id: commonFunc._getRandomKey(10),
            height: 0,
            weight: 0
        }
        rootScope._set('_USER_', currentUser);
        $('main>div.head>div.right>span').html(currentUser.id);
        $('main>div.head>div.right>i.fa-caret-down').on('click', function() {
            confirm._setActived('user');
        });
        $('main>div.head>div.right>button').on('click', this.dualSampling.bind(this));
    };
    Pagetemplate.prototype = {
        dualSampling: function(event) {
            event.stopPropagation();
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__ID__].lang];
            if (this.inSampling) {
                $('main>div.head>div.right>button').attr('z-lang', 'C048');
                $('main>div.head>div.right>button').html(activedLang.C048);
                this.bodyPartCollection._stopSampling();
            } else {
                var currentUser = rootScope._get('_USER_');
                $('main>div.head>div.right>button').attr('z-lang', 'C049');
                $('main>div.head>div.right>button').html(activedLang.C049);
                this.bodyPartCollection._startSampling();
                $('main>div.head>div.right>span').html(currentUser.id);
                $('main>div.right>article.suggest-container>div').empty();
                $('main>div.right>article.suggest-container>div').removeClass('sug-note')
                $('main>div.right>article.suggest-container>div').append(this.bodyPartCollection._getDom());
            }
            this.inSampling = !this.inSampling;
        },
        _currentUserChanged: function() {
            var currentUser = rootScope._get('_USER_');
            $('main>div.head>div.right>span').html(currentUser.id);
            var env = rootScope._get('_ENV_');
            var activedLang = env.languageMap[env.useConfig[this.__ID__].lang];
            $('main>div.head>div.right>button').attr('z-lang', 'C049');
            $('main>div.head>div.right>button').html(activedLang.C049);
            this.inSampling = true;
            this.bodyPartCollection._startSampling();
            $('main>div.right>article.suggest-container>div').empty();
            $('main>div.right>article.suggest-container>div').removeClass('sug-note')
            $('main>div.right>article.suggest-container>div').append(this.bodyPartCollection._getDom());
        },
        _destroy: function() {
            workerCoordinator._checkCloseWorker();
            if (this.heatmap) {
                this.heatmap._destroy();
                this.heatmap = null;
            }
            if (this.bodyPartCollection) {
                this.bodyPartCollection._destroy();
                this.bodyPartCollection = null;
            }
            if (this.statisticsCollection) {
                this.statisticsCollection._destroy();
                this.statisticsCollection = null;
            }
            this.__PRODUCTCONFIG__ = null;
            this.__USECONFIG__ = null;
            this.__ID__ = null;
        },
        _refresh: function() {
            if (this.hasOwnProperty('heatmap')) {
                this.heatmap._repaint(this.__PRODUCTCONFIG__);
            }
        }
    };
    return Pagetemplate;
})();