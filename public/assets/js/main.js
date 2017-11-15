/* global $ */

$("document").ready(function(){
    setTimeout(function(){
        $("div.alert").remove();
    }, 3000 ); // 3 secs
});

$(".list-group-item").click(function() {
	if (!$(this).hasClass('active')) {
		$(this).toggleClass("active");
		$(".list-group-item.active").not(this).toggleClass("active");
	}
});

$( function() {
  $( ".draggable" ).draggable();
} );
