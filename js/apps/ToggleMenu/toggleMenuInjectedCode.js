$("body").on("click", ".section_holder h2:not(#channels_header)", function() {
    $(this).toggleClass("SPM-plus");
    $(this).parent().toggleClass("SPM-only-unread");
})