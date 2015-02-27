var SPM = SPM || {};
SPM.Models = SPM.Models || {};

var parseLeader = function (project) {
    var leader = SPM.Utils.parseGetValueFromKey(project.desc, 'leader');
    if (!leader) {
        project.errors.noLeader = true;
        return false;
    }
    leader = SPM.Utils.unaccent(leader);
    if(leader[0] === '@') {
        // With the @name syntax
        leader = leader.slice(1);
    }
    var leaderFound = project.members.some(function (member) {
        var memberName = SPM.Utils.unaccent(member.fullName.toLowerCase());
        if (memberName.indexOf(leader) !== -1) {
            member.isLeader = true;
            return true;
        }
        return false;
    });
    if (leaderFound) {
        // Leader first
        project.members.sort(function (member1, member2) {
            return (member1.isLeader) ? -1 : (member2.isLeader) ? 1 : 0;
        });
    } else {
        project.errors.unknownLeader = true;
    }
    return leaderFound;
}

var parseSlack = function(project) {
    var slack = SPM.Utils.parseGetValueFromKey(project.desc, '(slack|channel|chanel|chan)');
    if (!slack) {
        return
    }
    if(slack[0] === '[') {
        // With the [name](url) syntax
        var index = slack.indexOf(']');
        slack = slack.slice(1, index);
    }
    if (slack[0] === '#') {
        // With the # syntax
        slack = slack.slice(1)
    }
    if(slack.indexOf('p-') !== 0) {
        return null;
    }
    project.slack = slack;
    return project.slack;
}

var checkErrors = function (project) {
    if (project.idMembers.length > 5) {project.errors.tooManyMembers = true};
    if (project.idMembers.length < 2) {project.errors.tooFewMembers = true};
    if (project.name.match(/^#?p-.*/)) {project.errors.titleIsSlackChan = true};
};

var initProject = function(project) {
    project.errors = {};
    var leader = parseLeader(project);
    var slack = parseSlack(project);
    // Need to 2x the line break for ISO trello markdown rendering
    project.desc = SPM.Utils.doubleLineBreak(project.desc);
    // Capitalize first letter
    project.name = project.name.charAt(0).toUpperCase() + project.name.slice(1);
    checkErrors(project);
    SPM.Storages.ProjectStorage.saveProject(project);
    return project;
};


SPM.Models.ProjectManager = {
    isMyProject: function(project) {
        return _.find(project.members, function(member) {
            return SPM.Models.MemberManager.me.id == member.id;
        })
    },

    findProject: function(query) {
        return SPM.TrelloConnector.request("get","/search", {
            "query": '"'+query+'"',
            "idOrganizations": _.map(SPM.Models.BoardManager.boards, function(board) {return board.idOrganization}),
            "idBoards" : _.map(SPM.Models.BoardManager.boards, function(board) {return board.id}),
            "modelTypes": "cards",
            "card_members": true
        })
        .then(function(result) {
            var cards = result.cards;
            cards = _.filter(cards, function(project) {
                return !project.closed;
            })
            var card;
            if (! cards.length) {
                card = null;
            } else {
                cards.forEach(function (card) {
                    initProject(card)
                })
            }
            return cards;
        }.bind(this));
    },

    findById: function(id) {
        return SPM.TrelloConnector.request("get", "/cards/" + id, {
            "members": true,
            "filter": "open"
        }).then(function (card) {
            // filter cards to keep only the one in the orga board
            initProject(card);
            return card;
        });
    },

    findMyProjects: function () {
        return SPM.TrelloConnector.request("get", "/members/me/cards", {
            "members": true,
            "filter": "open",
            "limit": 1000
        }).then(function (cards) {
            // filter cards to keep only the one in the orga board
            var cards = cards
                .filter(function (card) {
                    return SPM.Models.BoardManager.isRegistredBoard(card.idBoard);
                })
                .map(initProject);
            this.myProjects = true;
            return SPM.Storages.ProjectStorage.getProjectsByUser(SPM.Models.MemberManager.me);
        }).catch(function() {
            console.warn("no data findMyProjects");
        });
    },

    findProjectByChannelName: function (channelName) {
        return this.findProject(channelName)
            .then(function (projects) {
                projects = projects.filter(function (project) {
                    return project.slack == channelName
                });
                if (projects.length > 1) {
                    console.warn("More than one Trello cards found for the project " + channelName);
                    _.map(projects, function(project) {
                        project.errors.moreThanOneTrelloCard = projects;
                    });
                }
                if (projects.length == 0) {
                    console.warn("No Trello cards found for the project " + channelName);
                    SPM.Storages.ProjectStorage.noProjectForChannel(channelName);
                    projects = null
                } else {
                    projects = projects[0];
                }
                return projects;
            });
    },
    myProjects: false,
    getMyProjects: function () {
        var myProjects = SPM.Storages.ProjectStorage.getProjectsByUser(SPM.Models.MemberManager.me);
        if (!this.myProjects || myProjects.length == 0) {
            return this.findMyProjects().then(function(projects) {
                return Promise.resolve(SPM.Storages.ProjectStorage.getProjectsByUser(SPM.Models.MemberManager.me));
            })
        } else {
            return Promise.resolve(myProjects);
        }
        return SPM.Storages.ProjectStorage.getProjectsByUser(SPM.Models.MemberManager.me)
            .catch(function () {
                return this
                    .findMyProjects()
                    .then(this.getMyProjects.bind(this))
            }.bind(this))
    },

    getProjectByChannelName: function (channelName) {
        return SPM.Storages.ProjectStorage.getByChannelName(channelName)
            .catch(function () {
                return this
                    .findProjectByChannelName(channelName)
                    .then(this.getProjectByChannelName.bind(this, channelName))
            }.bind(this))
    }

}