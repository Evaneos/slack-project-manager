
var SPM = SPM || {};

(function() {

SPM.connector = SPM.connector || {};
SPM.connector.TrelloConnector = {
    initConnection: function(success, error) {
        return new Promise(function(success, error) {
            Trello.authorize({
                type: 'popup',
                name: 'trello-slack',
                persist: true,
                expiration: 'never',
                success: success,
                error: error
            })
        });
    },

    request: function (method, pathOrId, params) {
        var methodThis;
	    var method = method
	    		.split(".")
	    		.reduce(function (trelloFunc, method) {
                    methodThis = trelloFunc;
		    		return trelloFunc[method];
		    	}, Trello)
    	return new Promise(function(success, error) {
			method.call(methodThis, pathOrId, params || {}, success, error);
    	})
        // Little log proxy for Trello API errors :)
        .catch(function (error) {
            console.error("Error in Trello API: ", error);
            return error;
        })
    }
};

})();