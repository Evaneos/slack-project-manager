var SPM = SPM || {};
SPM.Model = SPM.Model || {};

SPM.Model.MemberManager = {
    me: null,
    setMe: function() {
        return new Promise(function(success, error){
            if (this.me == null) {
                SPM.connector.TrelloConnector.request("get","/members/me").then(function(me) {
                    this.me = me;
                    success();
                }.bind(this));
            } else {
                success();
            }
        }.bind(this));

    }
};