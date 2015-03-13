
var SPM = SPM || {};

(function() {


var _boardsIds = {
    arborium: "54b94910f186c08595048a8f",
    seeds: "54b7c3955fdb8e63ba5819d8"
}

var _connector = null;
var _builder = null;


var _trelloProjectReader = null;
var _projectStorage = null;
var _projectManager = null;
var _buildModel = function() {

    _builder = SPM.Model.Project.TrelloProjectBuilder;
    _builder.setUtils(SPM.Utils);

    // Build storages
    _trelloProjectReader = SPM.Model.Project.TrelloProjectReader;
    _trelloProjectReader.setTrelloConnector(_connector);
    _trelloProjectReader.setProjectBuilder(_builder);

    _projectStorage = SPM.Model.Project.ProjectStorage;
    _projectStorage.setMe(SPM.Model.MemberManager.me);
    _projectStorage.setUtils(SPM.Utils);

    // build manager
    _projectManager = SPM.Model.Project.ProjectManager;
    _projectManager.addStorage(_projectStorage);
    _projectManager.addStorage(_trelloProjectReader);

    return _trelloProjectReader.setBoards(_boardsIds);


}

SPM.Initializer = {

    /**
    * Let's go!
    */
    currentProjectName: null,
    date: moment(),
    init: function() {
        _connector = SPM.connector.TrelloConnector;
        _connector
            .initConnection()
            .then(function() {
                return SPM.Model.MemberManager.setMe();
            }.bind(this))
            .then(function() {
                return _buildModel.apply(this);
            })
            .then(function() {
                SPM.PanelRenderer.setBoards(_trelloProjectReader.getBoards());
                SPM.Apps.ProjectPanel.PanelInitalizer.init();
                SPM.Apps.MyProjects.MyProjectsInitializer.setBoardIds(_boardsIds);
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
            SPM.Model.Project.ProjectManager.updateProjectById(id).then(function(project) {
                SPM.Apps.ProjectPanel.PanelInitalizer.updateProject(project);
                SPM.Apps.MyProjects.MyProjectsInitializer.updateProject(project);
            })
        } else {
            return false;
        }
    }
}

window.onload = function() {
    SPM.Initializer.init();
}


})();