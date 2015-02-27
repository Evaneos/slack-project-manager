var SPM = SPM || {};
SPM.ViewHelpers = SPM.ViewHelpers || {};

SPM.ViewHelpers.SectionRenderer = {

    sections: [],

    addSection: function(id, title, channels, isProjectSection) {
        // First use, initialize
        if (this.sections.length == 0) {
            this._initialize();
        }


        // create object section
        // @todo replace by class
        var section = _.find(this.sections, function(s) { return s.id == id}) || {};
        section.title = title;
        section.isProjectSection = isProjectSection;
        section.channels = channels;
        section.id = id;

        // add it to the sections
        this.sections.push(section);

        // add dom
        this.addSectionDivIfNotExist(section);

        this.updateMenuItem(section);
    },

    _initialize: function() {
        this.initTemplate();
        SPM.CodeInjector.injectFile("js/ViewHelpers/MenuSectionViewHelper/menuSectionInjectedCode.js");

        SPM.Utils.onDomChanged("#channel-list", function() {
            this.update();
        }.bind(this));
    },

    update: function(section) {
        for (var i = 0 ; i < this.sections.length ; i++) {
            this.updateMenuItem(this.sections[i]);
        }
    },


    addSectionDivIfNotExist: function(section) {
        if ($("#"+section.id).length == 0) {
            var div = '<div id="' + section.id + '" class="SPM-section-added section_holder"></div>';
            var index = 0;
            if ($("#starred_div").length > 0) {
                var index = 1;
            }
            $("#channels_scroller").children().eq(index).before(div);
        }

        this.template.update(section.id, {
            channels: section.channels,
            title: section.title,
            isProjectSection: section.isProjectSection
        });

    },

    updateMenuItem: function(section) {
        $("#" + section.id + " li.channel").each(function(index) {
            var id = $(this).find(".channel_name").attr("data-channel-id");
            if ($(this)[0].outerHTML != $("#channel-list .channel_" + id + ", #starred-list .channel_"+id)[0].outerHTML) {
                $(this).replaceWith($("#channel-list .channel_" + id + ",#starred-list .channel_"+id).clone());
            }
        });
        SPM.CodeInjector.injectCode("TS.client.channel_pane.makeSureActiveChannelIsInView();");
    },

    template: null,
    initTemplate: function() {
        if (this.template === null) {
            this.template = new EJS({url: chrome.extension.getURL('js/ViewHelpers/MenuSectionViewHelper/menuSection.ejs')});
        }
    },


}