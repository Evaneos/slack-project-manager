var SPM = SPM || {};

/*
    PRIVATE FUNCTIONS
*/

var panelIsHere = function () {
    return $("#flex_contents").length
}
var titleIsHere = function () {
    return $("#active_channel_name").length
}

SPM.PanelRenderer = {

    template: null,
    initTemplate: function() {
        if (this.template === null) {
            this.template = new EJS({url: chrome.extension.getURL('js/apps/ProjectPanel/views/panel.ejs')});
        }
    },

    boards: null,
    project: null,

    setBoards: function(boards) {
        this.boards = boards;
        return this;
    },
    initialized: false,
    render: function(project) {
        if (!this.initialized) {
            this.initTemplate();

            this.initialized = true;
        }
        this.reset();
        this.project = project;
        if (this.project) {
            this.addTitle(SPM.Utils.getDueDate(this.project.due), this.project.name);
        }

        if (this.project.errors && this.project.errors.moreThanOneTrelloCard) {
            var projects = _.reduce(this.project.errors.moreThanOneTrelloCard, function(memo, project) {
                return memo + ' - '+ project.name;
            }, "");
            this.addError('Plusieurs projets pointent vers cette discussion Slack: ' + projects);
        }



        SPM.Utils
            .waitUntil(panelIsHere)
            .then(function () {
                this.addPanel();
                //this.openPanel();
            }.bind(this))
    },

    renderNoProject: function() {
        this.reset();
        this.closePanel();
        this.addError('Vous devez créer une carte Trello (si ce n\'est pas déjà fait) et renseigner ce channel slack.\
                        <a id="SPM-copy-slack-chan" href="#"> Voir le lien.</a></span>');
    },

    reset: function() {
        this.project = null;
        // remove div
        this.panelDiv && this.panelDiv.remove();
        this.titleDiv && this.titleDiv.remove();
        this.errorDiv && this.errorDiv.remove();
    },

    panelDiv: null,
    addPanel: function() {
        // Create the div if not here
        var div = '<div class="tab-pane active" id="projects_tab"></div>';
        this.panelDiv = $(div).appendTo("#flex_contents");

        this.template.update("projects_tab", {
            project: this.project,
            boards: SPM.Models.BoardManager.boards
        });
    },
    titleDiv: null,
    addTitle: function(deadline, title) {
        $(".SPM-title").remove();
        var dom = '<span class="name SPM-title">' +
        ((deadline)? '<span class="SPM-deadline-title">' + deadline + '</span> ' : '') +
        title + '</span>';
        this.titleDiv = $(dom).insertAfter("#active_channel_name");
    },
    errorDiv: null,
    addError: function(message) {
        var dom = '<div id="SPM-notif" class="messages_banner"> \
                    <span id="SPM-chan-error" class="overflow-ellipsis"> ' + message + '\
                </div>';
        this.errorDiv = $(dom).insertBefore("#messages_unread_status");
        var chanName = SPM.Utils.getProjectNameFromUrl(document.URL)
        SPM.CodeInjector.injectCode('\
                $("#SPM-copy-slack-chan").click(function() {\
                    window.prompt("Copier ce texte dans la description de la carte slack", "\\n**Slack** : [' +
                        chanName + '](https://evaneos.slack.com/messages/' +
                        'p-chartioprod](https://evaneos.slack.com/messages/' + chanName + ')\\n\\n");\
                });\
        ');
    },
    openPanel: function () {
        SPM.CodeInjector.injectCode('\
            TSM.openPanel();\
        ');
    },
    closePanel: function () {
        SPM.CodeInjector.injectCode('\
            if ($(".flex_pane_showing #flex_toggle").length !== 0) {\
                $("#flex_toggle").trigger("click");\
            }\
        ');
    }
}
// <span class="emoji-inner" style="background: url(https://slack.global.ssl.fastly.net/19218/img/emoji_twitter_64_indexed_256colors.png);background-position:20.689655172413794% 65.51724137931033%;background-size:3000%" title="fallen_leaf">:fallen_leaf:</span>