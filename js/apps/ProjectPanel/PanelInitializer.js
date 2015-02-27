var SPM = SPM || {};
SPM.Apps = SPM.Apps || {};
SPM.Apps.ProjectPanel = SPM.Apps.ProjectPanel || {};

SPM.Apps.ProjectPanel.PanelInitalizer = {
    init: function() {
        SPM.CodeInjector.injectFile("js/apps/ProjectPanel/panelInjectedCode.js");

        SPM.UrlChanged.onChanged(function() {
            this.onChanged();
        }.bind(this));
        this.onChanged();
        return true;

    },

    renderCurrentProject: function() {
        return SPM.Models.ProjectManager
            .getProjectByChannelName(this.currentProjectName)
            .then(function(project) {
                return (project)?
                    SPM.PanelRenderer.render(project):
                    SPM.PanelRenderer.renderNoProject();
            });
    },

    onChanged: function(force) {

        var projectName = SPM.Utils.getProjectNameFromUrl(document.URL);
        if (force || this.currentProjectName !== projectName) {
            this.currentProjectName = projectName;
            if (this.currentProjectName) {
               this.renderCurrentProject();
            } else {
                SPM.PanelRenderer.reset();
                SPM.PanelRenderer.closePanel();
            }
        }

    },

    updateProject: function(project) {
        this.onChanged(true);
    }
}