var SPM = SPM || {};
(function() {

SPM.Model = SPM.Model || {};
SPM.Model.Project = SPM.Model.Project || {};


/*
* connector Trello
 */
var _connector = null;

/*
* ProjectBuilder
 */
var _projectBuilder = null;

/*
* array of boards in which all queries of projects will be done
 */
var _boards = [];

var initLists = function (board) {
    return SPM.connector.TrelloConnector.request("get", "boards/" + board.id + "/lists")
        .then(function (lists) {
            board.lists = lists;
            return board;
        })
}

var isRegistredBoardId = function (id) {
    return _boards.some(function (board) {
        return board.id === id;
    })
}

SPM.Model.Project.TrelloProjectReader = {

    setTrelloConnector: function(connector) {
        _connector = connector;
    },

    setProjectBuilder: function(builder) {
        _projectBuilder = builder;
    },

    setBoards: function(boardIds) {
        return Promise
        // 1- Getting all the boards
        .all(_.map(boardIds, function(boardId) {
            return _connector.request("boards.get", boardId)
        }))
        // 2 - Gettin' all the list for all the boards
        .then(function (boards) {
            _boards = boards;
            return Promise.all(boards.map(function (board) {
                return initLists(board);
            }));
        })
    },

    getBoards: function() {
        return _boards;
    },

    searchProject: function(query) {
        return _connector.request("get","/search", {
            "query": '"'+query+'"',
            "idOrganizations": _.map(this._boards, function(board) {return board.idOrganization}),
            "idBoards" : _.map(this._boards, function(board) {return board.id}),
            "modelTypes": "cards",
            "card_members": true
        })
        .then(function(result) {
            var cards = result.cards;

            // remove archived project
            cards = _.filter(cards, function(project) {
                return !project.closed;
            })
            var card;
            if (! cards.length) {
                card = null;
            } else {
                cards.forEach(function (card) {
                    _projectBuilder.build(card);
                })
            }
            return Promise.resolve(cards);
        }.bind(this));
    },

    getById: function(id) {
        return SPM.connector.TrelloConnector.request("cards.get", id, {
            "members": true,
            "filter": "open"
        }).then(function (card) {
            // filter cards to keep only the one in the orga board
            _projectBuilder.build(card);
            return card;
        });
    },

    getMyProjects: function () {
        return SPM.connector.TrelloConnector.request("get", "/members/me/cards", {
            "members": true,
            "filter": "open",
            "limit": 1000
        }).then(function (cards) {
            // filter cards to keep only the one in the orga board
            var cards = cards
                .filter(function (card) {
                    return isRegistredBoardId(card.idBoard);
                })
                .map(_projectBuilder.build);
            return Promise.resolve(cards);
        }).catch(function() {
            console.warn("no data getMyProjects");
        });
    },

    getProjectByChannelName: function (channelName) {

        return this.searchProject(channelName)
            .then(function (projects) {
                projects = projects.filter(function (project) {
                    return project.slack == channelName
                });
                if (projects.length > 1) {
                    console.warn("More than one Trello cards found for the project " + channelName);
                    _.map(projects, function(project) {
                        project.errors.moreThanOneTrelloCard = projects;
                    });
                    // @todo sort by created_at date DESC
                    project = projects[0];
                }
                if (projects.length == 0) {
                    console.warn("No Trello cards found for the project " + channelName);
                    projects = null
                } else {
                    project = projects[0];
                }
                return project;
            });
    },

    saveResult: function(result, methodName, arguments) {
        return true;
    },

    removeProjet: function(project) {
        return Promise.resolve(project);
    }
}


})();