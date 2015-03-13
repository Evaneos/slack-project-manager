var SPM = SPM || {};
SPM.Model = SPM.Model || {};

SPM.Model.ChannelManager = {
    channelNames: [],
    getChannelNames: function() {
        this.initChannels();
        return this.channelNames;
    },

    getProjectChannelNames: function () {
        return this.getChannelNames().filter(this.isProjectChannel.bind(this));
    },
    /*
    * function which returns the list of channels which don't begin by 'p-'
     */
    getNotProjectChannels: function() {
        return _.filter(this.getChannelNames(), function(channelName) {
            return !this.isProjectChannel(channelName);
        }.bind(this)).map(function (channelName) {
            return this.createChannel(channelName);
        }.bind(this))
    },

    channelIds: [],
    getChannelIds: function() {
        this.initChannels();
        return this.channelIds;
    },

    /*
    * This is to know that channelIds and channelNames are up-to-date.
     */
    initChannels: function(force) {
        if (force || this.channelIds.length == 0) {
            // Get Channels in Channels list
            this.channelIds = $.map($("#channel-list a.channel_name, #starred-list a.channel_name"), function(a, index) {
                return $(a).attr("data-channel-id");
            });

            this.channelNames = $.map($("#channel-list li a.channel_name .overflow_ellipsis, #starred-list li a.channel_name .overflow_ellipsis"), function(li, index) {
                return $(li).text().replace(/(\r\n|\n|\r|\s+)/gm,"").slice(1);
            });

            // Get Channels in Starred List

        }
    },

    getChannelIdFromChannelName: function(channelName) {
        return this.channelIds[_.indexOf(this.channelNames, channelName)];
    },

    isProjectChannel:function (channelName) {
        return channelName.indexOf('p-') === 0;
    },


    createChannel: function (channelOrProject) {
        // 1 - If it's a channel
        if (typeof channelOrProject === "string") {
            var id = this.getChannelIdFromChannelName(channelOrProject)
            return  {
                name: channelOrProject,
                slackId: id
            };
        }
        // 2 - If it's a project
        var project = channelOrProject;
        var channel = {}
        if (project.slack) {
            channel.name = project.slack
            channel.slackId = this.getChannelIdFromChannelName(project.slack)
        } else {
            channel.name = project.name;
        }
        channel.project = project;
        return channel;
    }

}