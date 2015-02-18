var TSM = TSM || {};
TSM.openPanel = function() {
    TS.client.ui._displayFlexTab("projects",true);
    TS.view.resizeManually();
    /*
    $(".tab-pane.active").removeClass("active");
    $("#projects_tab").addClass("active");
    if ($(".flex_pane_showing #flex_toggle").length == 0) {
        $("#flex_toggle").trigger('click');
    }
    */
}

$( "body" ).on( "click", ".SPM-title", function() {

    TSM.openPanel()
});
if ($(".urlchanged").length == 0) {
     $("body").append("<div class='urlchanged'></div>");
}

TS.client.channel_pane.makeSureActiveChannelIsInView = function() {

    var a = $("#col_channels").find("li.active");
    a.first().scrollintoview({
        offset: "top",
        px_offset: 50
    })
}