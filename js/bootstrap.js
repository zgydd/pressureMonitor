'use strict';
$(document).ready(function() {
    pageController._init();
    pageController._registerDataListener();
    var env = logic._init();
    rootScope._set('_ENV_', env);
    logic._enterInitStream();
});