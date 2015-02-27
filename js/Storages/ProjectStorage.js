var SPM = SPM || {};
SPM.Storages = SPM.Storages || {};

SPM.Storages.ProjectStorage = {
	projects: {},
	projectsByChannel: {},
	myProjects: undefined,

	saveProject: function(project) {
		this.projects[project.id] = project;
		if (project.slack) {
			this.projectsByChannel[project.slack] = project.id;
		}
		return project
	},

	saveMyProjects: function (projects) {
		this.myProjects = [];
		projects.forEach(function (project) {
			this.saveProject(project);
			this.myProjects.push(project.id);
		}.bind(this))
		return projects;
	},

	getProjectsByUser: function (user) {
        var myProjects = _.filter(this.projects, function(project) {
            return _.find(project.members, function(member) {
                return member.id == user.id
            }.bind(this));
        }.bind(this));
        if (myProjects.length > 0) {
            return Promise.resolve(myProjects);
        } else {
            return Promise.reject("No data")
        }
	},

	noProjectForChannel: function (channelName) {
		this.projectsByChannel[channelName] = false;
	},

	getByChannelName: function (channelName) {
		var projectId = this.projectsByChannel[channelName]
		return (projectId === undefined)?
			Promise.reject("No data"):
			Promise.resolve(this.projects[projectId]);
	}
}