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
})("navController", this, function() {
    'use strict';
    var __privateCollection__ = {
        actived: 'nav-heatmap',
        navList: ['nav-heatmap', 'nav-scale', 'nav-history']
    };
    var checkActived = function() {
        __privateCollection__._DOM_.children().each(function(i, n) {
            $(n).removeClass('actived');
            if (n.id === __privateCollection__.actived) $(n).addClass('actived');
        });
        //pageController._activeNav(__privateCollection__.actived);
    };
    var _changeActivedPage = function(event) {
        var id = event.target.id;
        if (!id) id = $(event.target).parents('li').get(0).id;
        if (!id || id === __privateCollection__.actived) return;
        __privateCollection__.actived = id;
        checkActived();
        pageController._activeNav(id);
    };
    var factory = {
        _init: function(archor) {
            __privateCollection__._DOM_ = $('<ul></ul>').addClass('nav prn-disabled');
            __privateCollection__.heatmap = $('<li id="' + __privateCollection__.navList[0] + '"></li>').append($('<img src="./assets/images/home.png"/>')).append($('<span z-lang="C030"><i class="fab fa-connectdevelop fa-spin"></i></span>')).on('click', _changeActivedPage);
            __privateCollection__.scale = $('<li id="' + __privateCollection__.navList[1] + '"></li>').append($('<img src="./assets/images/form.png"/>')).append($('<span z-lang="N002"><i class="fab fa-connectdevelop fa-spin"></i></span>')).on('click', _changeActivedPage);
            __privateCollection__.history = $('<li id="' + __privateCollection__.navList[2] + '"></li>').append($('<img src="./assets/images/home_lsjv.png"/>')).append($('<span z-lang="N003"><i class="fab fa-connectdevelop fa-spin"></i></span>')).on('click', _changeActivedPage);
            __privateCollection__._DOM_.append(__privateCollection__.heatmap);
            __privateCollection__._DOM_.append(__privateCollection__.scale);
            __privateCollection__._DOM_.append(__privateCollection__.history);
            archor.append(__privateCollection__._DOM_);
            checkActived();
        },
        _resetNav: function(id) {
            if (__privateCollection__.actived === id || __privateCollection__.navList.indexOf(id) < 0) return;
            __privateCollection__.actived = id;
            checkActived();
        }
    };
    return factory;
});