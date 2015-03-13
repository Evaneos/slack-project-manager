var SPM = SPM || {};
SPM.Apps = SPM.Apps || {};
SPM.Apps.MyProjects = SPM.Apps.MyProjects || {};


var numberOfProjects = 0;

var waitUntilChannelsAreHere = function() {
    return SPM.Utils.waitUntil(function() {
        return numberOfProjects != $("#channel-list li").length;
    });
};

var getMyProjectsInBoard = function(boardId) {
    return SPM.Model.Project.ProjectManager.getMyProjects().then(function (projects) {
        return projects
            .filter(function (project) {
                return project.idBoard == boardId;
            })
            .map(function (project) {
                return SPM.Model.ChannelManager.createChannel(project);
            })
    }).catch(function() {
        console.log('bug in getMyProjectsInBoard');
    })
}

var getNotMyProjectFollowed = function() {
    promises = SPM.Model.ChannelManager
    // 1 - Get project or channel name that I follow
        .getProjectChannelNames()
        .map(function (channelName) {
            return SPM.Model.Project.ProjectManager
                .getProjectByChannelName(channelName)
                .then(function (project) {
                    return project || channelName;
                })
                .catch(function() {
                    console.log('getProjectByChannelName has bugged');
                })
        });
    // 2 - Filter those whose I am member and transforms them to channel
    return Promise.all(promises).then(function (projectOrChannelNames) {
            return projectOrChannelNames
                .filter(function (pocn) {
                    return  (typeof pocn === "string" ) || !SPM.Model.Project.ProjectManager.isMyProject(pocn)
                })
                .map(function (pocn) {
                    return SPM.Model.ChannelManager.createChannel(pocn);
                })
        })
        .catch(function() {
            console.log("bug in getting getProjectByChannelName");
        })
}

var _boardsIds = [];

var renderChannels = function() {
    Promise.all([
    // 1 - Get channels by category
        Promise.resolve(SPM.Model.ChannelManager.getNotProjectChannels()),    // Other non project Channels
        getNotMyProjectFollowed(),                                         // Project followed, but not member
        getMyProjectsInBoard(_boardsIds.seeds),              // My project in seed
        getMyProjectsInBoard(_boardsIds.arborium)            // My projects in arborium
    ]).then(function (channel) {
        var myProjectsDone = _.partition(channel[3], function(channel) {
            return ["54b949c70a8cc363f4cbdf74", "54b949ca8aa6d6fba4c87700"].indexOf(channel.project.idList) == -1;
        });
    // 2 - Render the channels
        SPM.ViewHelpers.SectionRenderer.addSection("SPM-other_channe", "AUTRE CHANNELS", channel[0], false);
        SPM.ViewHelpers.SectionRenderer.addSection("SPM-project-followed", "MES PROJETS SUIVIS", channel[1], true);
        SPM.ViewHelpers.SectionRenderer.addSection("SPM-my_project_done", "MES PROJETS FINIS", myProjectsDone[0], true);
        SPM.ViewHelpers.SectionRenderer.addSection("SPM-project", "MES GRAINES", channel[2], true);
        SPM.ViewHelpers.SectionRenderer.addSection("SPM-my_project", "MES PROJETS", myProjectsDone[1], true);
        $("#channel-list").hide();
    }).catch(function() {
        console.log('bug in MyProjects app');
    });
}

SPM.Apps.MyProjects.MyProjectsInitializer = {
    init: function() {
        return waitUntilChannelsAreHere()
            .then(renderChannels);
    },

    updateProject: function(project) {
        renderChannels();
    },

    setBoardIds: function(boardIds) {
        _boardsIds = boardIds;
    }
}


