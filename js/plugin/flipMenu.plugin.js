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
})("flipMenu", this, function() {
    'use strict';
    var __anchor__ = null;
    var __self__ = null;
    var __data__ = null;
    var init = function() {
        if (__self__ && __self__.length) __self__.empty();
        __self__ = $('<section></section>').addClass('ac-container');
    };
    var getTimeRange = function(inner) {
        var ranges = (inner.indexOf('.') > 0) ? inner.substring(0, inner.indexOf('.')).split('-') : inner.split('-');
        if (ranges.length !== 2) return '';
        return commonFunc._getShownDifferentTime((new Date(commonFunc._toFloat(ranges[0]))), commonFunc._toFloat(ranges[1]));
        /*
        return ((new Date(commonFunc._toFloat(ranges[0]))).Format('hh:mm:ss') +
            ' ~ ' + (new Date(commonFunc._toFloat(ranges[1]))).Format('hh:mm:ss'));
        */
    };
    var setData = function(data, needDetail) {
        if (!data || !data.length) return;
        for (var i = 0; i < data.length; i++) {
            var oneRecord = $('<div></div>');
            var html = '<input id="ac-' + i + '" name="accordion" type="checkbox" />';
            html += '<label for="ac-' + i + '">' +
                (new Date(commonFunc._toFloat(data[i].name))).Format('yyyy-MM-dd hh:mm:ss') + '</label>';
            if (data[i].data && data[i].data.length) {
                html += '<article class="ac-medium" id="flip_container_' + i + '">';
                html += '<a class="nav-button prev" id="flip_prev_' + i + '"></a>';
                html += '<ul id="flip_lst_' + i + '">';
                for (var j = 0; j < data[i].data.length; j++) {
                    html += '<li>';
                    html += '<img src="' + data[i].data[j].path + '" />';
                    html += '<p>' + getTimeRange(data[i].data[j].name) + '</p>';
                    html += '</li>';
                }
                html += '</ul>';
                if (needDetail) html += '<div class="more-mark" id="flip_detailData_' + i + '"><img src="./asset/images/more.png" /></div>';
                html += '<a class="nav-button next" id="flip_next_' + i + '"></a>';
                html += '</article>';
            }
            oneRecord.html(html);
            __self__.append(oneRecord);
        }
    };
    var checkNavButton = function(id) {
        var scrollLeft = $('#flip_container_' + id).scrollLeft();
        $('#flip_prev_' + id).removeClass('hidden');
        $('#flip_next_' + id).removeClass('hidden');
        if (scrollLeft <= 0) $('#flip_prev_' + id).addClass('hidden');
        if (scrollLeft >= $('#flip_lst_' + id + ' li').width() * $('#flip_lst_' + id + ' li').length - $('#flip_container_' + id).width() - 10)
            $('#flip_next_' + id).addClass('hidden');

        if ($('#flip_container_' + id).length && $('#flip_container_' + id).offset() !== undefined) {
            $('#flip_prev_' + id).offset({ left: $('#flip_container_' + id).offset().left });
            $('#flip_next_' + id).offset({ left: $('#flip_container_' + id).offset().left + $('#flip_container_' + id).width() - $('#flip_next_' + id).width() - 3 });
        }
    };
    var moreDetailInfoListener = function() {
        var idx = commonFunc._toInt(this.id.replace('flip_detailData_', ''));
        if (idx < 0 || idx >= __data__.length) return;
        cubePresentation.setKeepRecordData(__data__[idx]);
        cubePresentation.show();
    };
    var scollPrevListener = function() {
        var id = commonFunc._toInt(this.id.replace('flip_prev_', ''));
        $('#flip_container_' + id).scrollLeft($('#flip_container_' + id).scrollLeft() - $('#flip_lst_' + id + ' li').width());
        checkNavButton(id);
    };
    var scollNextListener = function() {
        var id = commonFunc._toInt(this.id.replace('flip_next_', ''));
        $('#flip_container_' + id).scrollLeft($('#flip_container_' + id).scrollLeft() + $('#flip_lst_' + id + ' li').width());
        checkNavButton(id);
    };
    var checkHasScroll = function() {
        setTimeout(function() {
            for (var i = 0; i < __data__.length; i++) checkNavButton(i);
        }, 800);
    };
    return {
        _config: function(config) {
            if (!config) return;
            if (config.anchorElement) __anchor__ = config.anchorElement;
            init();
            if (config.data && config.data.length) {
                __data__ = config.data.clone();
                setData(config.data, config.needDetail);
            }
            if (config.autoAppend) __anchor__.append(__self__);
        },
        _bindListener: function() {
            if (!__data__ || !__data__.length) return;
            $('.plugin-container .ac-container input').on('change', checkHasScroll);
            setTimeout(function() {
                for (var i = 0; i < __data__.length; i++) {
                    checkNavButton(i);
                    /*
                    var sum = __data__[i].data.length || 0;
                    if ($('#flip_lst_' + i + ' li').width() * sum > $('#flip_container_' + i).width())
                        $('#flip_container_' + i + ' a.nav-button').removeClass('hidden');
                    else $('#flip_container_' + i + ' a.nav-button').addClass('hidden');
                    */
                }
                $('.plugin-container .ac-container .nav-button.prev').on('click', scollPrevListener);
                $('.plugin-container .ac-container .nav-button.next').on('click', scollNextListener);
            }, 800);
            /*
            __anchor__.append($('<div id="slideShow" class="slides-wrapper"></div>'));
            cubePresentation.config({
                wrapper: document.getElementById('slideShow')
            });
            cubePresentation.init();
            cubePresentation.hide();
            $('.more-mark').on('click', moreDetailInfoListener);
            */
        },
        _destroy: function() {
            $('.more-mark').off('click');
            $('.plugin-container .ac-container .nav-button.prev').off('click');
            $('.plugin-container .ac-container .nav-button.next').off('click');
            $('.plugin-container .ac-container input').off('change');
            __data__ = null;
            __self__.empty();
            __anchor__.empty();
        }
    };
});