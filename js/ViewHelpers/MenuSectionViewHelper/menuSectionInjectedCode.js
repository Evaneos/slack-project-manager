$( "body" ).on( "click", ".SPM-section-added .channel_name", function() {
    var id = $(this).attr("data-channel-id");
    //$("#channels").hide();
    $("#channel-list [data-channel-id="+id+"], #starred-list [data-channel-id="+id+"]").trigger('click');
    /*
    setTimeout(function() {
        $("#channels").show();
    }, 10);
*/
});

/*
$( "body" ).on( "click", ".SPM-no-slack", function() {

    $("#channels_header").trigger('click');$(".new_channel_btn").trigger('click');
    var timer = setInterval(function() {
        if($("#channel_create_title").length > 0) {
            clearInterval(timer);
            $("#channel_create_title").val("p-" + $(this).find(".overflow-ellipsis")
                .text()
                .trim()
                .slice(2)
                .replace( /\s\s+/g, ' ' )
                .replace(/\s+/g, '-')
                .toLowerCase());
            $("#channel_purpose_input").val($(this).nextAll('.SPM-desc').first().html());

        }

    }.bind(this), 100);


});

*/
$( "body" ).on( "click", ".SPM-no-slack", function() {

    alert($(this).nextAll('.SPM-project-informations').children('.SPM-error').attr('data-text'));

});

if ($("#sidebar_behavior").length > 0) {
    $("body").addClass('SPM-not-show-all');
}

$("body").on('change', '#sidebar_behavior_select', function() {
    if ($("#sidebar_behavior").length > 0) {
        $("body").addClass('SPM-not-show-all');
    } else {
        $("body").removeClass('SPM-not-show-all');
    }
})