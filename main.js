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
    date: moment(),
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

        var myFirebaseRef = new Firebase("https://trello.firebaseio.com/");
        myFirebaseRef.child("projects")
        .on("child_added", function(snapshot) {
            this.update(snapshot.val().id, snapshot.val().updated_at);
        }.bind(this));
        myFirebaseRef.child("projects")
        .on("child_changed", function(snapshot) {
            this.update(snapshot.val().id, snapshot.val().updated_at);
        }.bind(this));
    },
    update: function(id, date) {
        if (this.date.isBefore(moment(date))) {
            SPM.Models.ProjectManager.findById(id).then(function(project) {
                SPM.Apps.ProjectPanel.PanelInitalizer.updateProject(project);
                SPM.Apps.MyProjects.MyProjectsInitializer.updateProject(project);
            })
        } else {
            return false;
        }
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