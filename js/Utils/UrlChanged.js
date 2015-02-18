var SPM = SPM || {};

SPM.UrlChanged = {
    onChanged: function(callback) {
        if ($(".urlchagned").length == 0) {
            this._initialize();
        }
        $(this).on('urlChanged', callback);
    },

    _initialize: function() {
        if ($(".urlchagned").length == 0) {
             $("body").append("<div class='urlchanged'></div>");
        }
        SPM.CodeInjector.injectCode('\
            (function(history){\
                var pushState = history.pushState;\
                history.pushState = function(state) {\
                    if (typeof history.onpushstate == "function") {\
                        history.onpushstate({state: state});\
                    }\
                    if ($(".urlchanged").length > 0) {\
                        $(".urlchanged").append("h");\
                    }\
                    \
                    return pushState.apply(history, arguments);\
                }\
            })(window.history);\
        ');


        // select the target node
        var target = document.querySelector('.urlchanged');

        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            $(this).trigger('urlChanged');
          }.bind(this));
        }.bind(this));

        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true };

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    }
}