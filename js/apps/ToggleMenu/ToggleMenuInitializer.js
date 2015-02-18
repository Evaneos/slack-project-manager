var SPM = SPM || {};
SPM.Apps = SPM.Apps || {};
SPM.Apps.ToggleMenu = SPM.Apps.ToggleMenu || {};

SPM.Apps.ToggleMenu.ToggleMenuInitializer = {
    init: function() {
        SPM.CodeInjector.injectFile("js/apps/ToggleMenu/toggleMenuInjectedCode.js");
        return true;
    }
}