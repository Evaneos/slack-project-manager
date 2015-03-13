var SPM = SPM || {};
(function() {

SPM.Model = SPM.Model || {};
SPM.Model.Project = SPM.Model.Project || {};

var _projects = {};
var _projectsByChannel = {};
var _projectsByUser = {};
var _projectsBySearch = {};
var _me = null;
var _utils = null;

SPM.Model.Project.ProjectStorage = {
    setMe: function(me) {
        _me = me;
    },

    setUtils: function(utils) {
        _utils = utils;
    },

	saveProject: function(project) {
		_projects[project.id] = project;
		if (project.slack) {
			_projectsByChannel[project.slack] = project.id;
		}
        if (project.members) {
            _.map(project.members, function(member) {
                if (typeof _projectsByUser[member.id] == 'undefined') {
                    _projectsByUser[member.id] = [];
                }
                _projectsByUser[member.id].push(project);
            })
        }
		return project;
	},

    removeProjet: function(project) {
        if (_utils.removeFromObject(project.id, _projects)) {
            if (project.slack) {
                _utils.removeFromObject(project.slack, _projectsByChannel);
            }
            if (project.members) {
                _.map(project.members, function(member) {
                    _utils.removeFromObject(member.id, _projectsByUser);
                })
            }
            return Promise.resolve(project);

        } else {
            return Promise.reject('not here');
        };
    },

	saveProjects: function (projects) {
		projects.forEach(function (project) {
			this.saveProject(project);
		}.bind(this))
		return projects;
	},

    searchProject: function(search) {
        var projectId = _projectsBySearch[search]
        return (projectId === undefined)?
            Promise.reject("No data"):
            Promise.resolve(_projects[projectId]);
    },

	getProjectsByUser: function (user) {
        var projects = _.filter(_projects, function(project) {
            return _.find(project.members, function(member) {
                return member.id == user.id
            }.bind(this));
        }.bind(this));
        if (projects.length > 0) {
            return Promise.resolve(projects);
        } else {
            return Promise.reject("No data")
        }
	},

    getMyProjects: function() {
        return this.getProjectsByUser(_me);
    },

	noProjectForChannel: function (channelName) {
		_projectsByChannel[channelName] = false;
	},

    noProjectForUser: function (user) {
        _projectsByUser[user.id] = false;
    },

	getProjectByChannelName: function (channelName) {
		var projectId = _projectsByChannel[channelName]
		return (projectId === undefined)?
			Promise.reject("No data"):
			Promise.resolve(_projects[projectId]);
	},

    saveResult: function(result, methodName, arguments) {
        if (_utils.isArray(result)) {
            this.saveProjects(result);
        } else {
            this.saveProject(result);
        }
        return true;
    },

    getById: function(id) {
        if (typeof _projects[id] != 'undefined') {
            return Promise.resolve(_projects[id]);
        } else {
            return Promise.reject('not here');
        }

    }
}

})();