var SPM = SPM || {};
SPM.Model = SPM.Model || {};
SPM.Model.Project = SPM.Model.Project || {};

var _storages = [];

var _getFromStorageI = function(methodName, args, i) {
    if (typeof _storages[i] == 'undefined') {
        return Promise.reject('storage ' + i + ' not defined');
    }
    if (typeof _storages[i][methodName] == 'undefined') {
        return Promise.reject('the method ' + methodName + ' is not defined for the ' + i + 'th storage');
    }
    return _storages[i][methodName].apply(_storages[i], args);
}

var _getFromStorage = function(methodName, args, i) {
    if (typeof i == 'undefined') {
        i = 0;
    }
     // @todo execute method with args
    return _getFromStorageI(methodName, args, i)
    .then(function(result) {
        return _updatePreviousCache(i, result, methodName, args).then(function(result) {
            return result;
        });
    }.bind(this))
    .catch(function () {
        i ++;
        if (i == _storages.length) {
            return Promise.reject('nothing in all storages :(');
        }
        return _getFromStorage(methodName, args, i);
    }.bind(this))
}

var _updatePreviousCache = function(n, result, methodName, args) {
    if (n-1 > 0) {
        for (var i = n - 1 ; i >= 0 ; i --) {
            this._storages[i].saveResult(result, methodName, args);
        }
    }
    return Promise.resolve(result);
}

SPM.Model.Project.ProjectManager = {

    addStorage: function(storage) {
        _storages.push(storage);
    },

    isMyProject: function(project) {
        return _.find(project.members, function(member) {
            return SPM.Model.MemberManager.me.id == member.id;
        })
    },

    getMyProjects: function () {
        return _getFromStorage("getMyProjects", []);
    },

    getProjectByChannelName: function (channelName) {
        return _getFromStorage("getProjectByChannelName", [channelName]);
    },

    updateProjectById: function(id) {
        return _getFromStorage("getById", [id])
        .then(function(project) {
            return _getFromStorage("removeProjet", [project])
        })
        .then(function() {
            return _getFromStorage("getById", [id]);
        });
    },

    getById: function(id) {
        return _getFromStorage("getById", [id]);
    }

}