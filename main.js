var SPM = SPM || {};
        console.log("-6")

SPM.Initializer = {
    boardsIds: {
        arborium: "54b94910f186c08595048a8f",
        seeds: "54b7c3955fdb8e63ba5819d8"
    },

    /**
    * Let's go!
    */
    currentProjectName: null,
    init: function() {
        this.initDate();
        SPM.TrelloConnector
            .initConnection()
            .then(function() {
                return SPM.Models.MemberManager.setMe();
            }.bind(this))
            .then(function() {
                return SPM.Models.BoardManager.init(this.boardsIds);
            }.bind(this))
            .then(function () {
                SPM.Apps.ProjectPanel.PanelInitalizer.init();
                SPM.Apps.MyProjects.MyProjectsInitializer.init();
                SPM.Apps.ToggleMenu.ToggleMenuInitializer.init();
                //SPM.Apps.CheckTrelloSlack.CheckTrelloSlackInitializer.init();

            }.bind(this))
            .catch(function (error) {
                console.error(error);
            })
    },
    initDate: function() {

        moment.locale("fr");
        moment.locale('fr', {
            relativeTime : {
                future: "%s",
                past:   "%s",
                s:  "J",
                m:  "J",
                mm: "J",
                h:  "J",
                hh: "J",
                d:  "J-1",
                dd: "J-%d",
                M:  "M-1",
                MM: "M-%d",
                y:  "Y-1",
                yy: "Y-%d"
            }
        });
    }
}

window.onload = function() {
    SPM.Initializer.init();
}