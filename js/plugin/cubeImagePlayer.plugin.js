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
})("cubePresentation", this, function() {
    'use strict';
    var wrapper = null;
    var elParent = null;
    var defClass = null;
    var slides = null;
    var slidesNum = null;
    var nextButton = document.createElement('a');
    var prevButton = document.createElement('a');
    var currentSlide = 0;

    var goNext = function() {
        if (slides[currentSlide + 1]) {
            ++currentSlide;
            step();
        }
    };

    var goBack = function() {
        if (slides[currentSlide - 1]) {
            --currentSlide;
            step();
        }
    };

    var step = function() {
        showSlide(currentSlide);
        window.location.hash = currentSlide;
        checkButtons();
        return false;
    };

    var checkButtons = function() {
        $(nextButton).removeClass('hidden');
        $(prevButton).removeClass('hidden');
        if (currentSlide === 0) $(prevButton).addClass('hidden');
        else if (currentSlide === slidesNum - 1) $(nextButton).addClass('hidden');
    };

    var keyUpEv = function(event) {
        if (event.keyCode === 37) {
            goBack();
        } else if (event.keyCode === 39) {
            goNext();
        }
    };

    var showSlide = function(step) {
        var i = slidesNum;
        if (-1 < step && step < i) {
            $('.plugin-container .slide.current').off('click');
            while (i--) {
                slides[i].className = defClass;
            }
            slides[step].className += ' current';
            $(slides[step]).on('click', hideMe);

            if (step > 0) {
                slides[step - 1].className += ' prev';
            }
            if (step + 1 < slidesNum) {
                slides[step + 1].className += ' next';
            }
        } else {
            return false;
        }
    };
    /*
        var cb_addEventListener = function(obj, evt, fnc) {
            if (obj && obj.addEventListener) {
                obj.addEventListener(evt, fnc, false);
                return true;
            } else if (obj && obj.attachEvent) {
                return obj.attachEvent('on' + evt, fnc);
            }
            return false;
        };
    */
    var hideMe = function() {
        $(wrapper).empty();
        $(wrapper).hide();
        $(nextButton).addClass('hidden');
        $(prevButton).addClass('hidden');
    };
    return {
        config: function(_params) {
            var params = _params || {};
            wrapper = params.wrapper || document.getElementById('slideShow');
            slides = params.slides || wrapper.getElementsByClassName('slide');
            slidesNum = slides.length;
            defClass = params.defClass || 'slide';
            elParent = $(wrapper).parent();
        },
        init: function() {
            if (!wrapper) {
                config();
            }
            if (!elParent) {
                document.body.appendChild(nextButton);
                document.body.appendChild(prevButton);
            } else {
                elParent.append(nextButton);
                elParent.append(prevButton);
            }
            nextButton.className = 'next nav-button';
            prevButton.className = 'prev nav-button';

            $(nextButton).on('click', goNext);
            $(prevButton).on('click', goBack);
            //$(nextButton).on('keyup', keyUpEv);
            //cb_addEventListener(nextButton, 'click', goNext);
            //cb_addEventListener(prevButton, 'click', goBack);
            //cb_addEventListener(document, 'keyup', keyUpEv);
        },
        setKeepRecordData: function(data) {
            if (!data || !data.data || !data.data.length) return;
            $(wrapper).empty();
            var containerTable = '';
            for (var i = 0; i < data.data.length; i++) {
                containerTable += '<section class="slide">';
                var timestamps = data.data[i].name.substring(0, data.data[i].name.lastIndexOf('.')).split('-');
                var endTime = new Date(commonFunc._toFloat(commonFunc._toFloat(timestamps[1])));
                containerTable += '<label>时间：</label>';
                containerTable += '<span>' + (new Date(commonFunc._toFloat(timestamps[0]))).Format('yyyy-MM-dd hh:mm:ss');
                containerTable += '  ~  ' + endTime.Format('yyyy-MM-dd hh:mm:ss') + '</span>';
                containerTable += '<label>持续：</label>';
                containerTable += '<span>' + commonFunc._getShownDifferentTime(endTime, commonFunc._toFloat(timestamps[0])) + '</span>';
                containerTable += '<img src="' + data.data[i].path + '" />';
                containerTable += '</section>';
            }
            $(wrapper).html(containerTable);
            currentSlide = 0;
            slidesNum = data.data.length;
            showSlide(currentSlide);
            checkButtons();
        },
        hide: function() {
            hideMe();
        },
        show: function() {
            $(wrapper).show();
            checkButtons();
        }
    };
});