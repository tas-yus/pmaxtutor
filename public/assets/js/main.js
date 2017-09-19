/* global $ */

$("document").ready(function(){
    setTimeout(function(){
        $("div.alert").remove();
    }, 4000 ); // 5 secs

});

var numVidAdds = 1;

$("#add-vids").click(() => {
	if(numVidAdds < 20) numVidAdds++;
	printInputs(numVidAdds);
});

$("#remove-vids").click(() => {
	if(numVidAdds > 1) numVidAdds--;
	printInputs(numVidAdds);
});

function printInputs(num) {
	var html = "";
	for (var i = 0; i < num; i++) {
	    html += "<input type='text' name='video' placeholder='video url'>";
	}
	html += "<button>Add</button>";
	$("#form-vidNew").html(html);
}

$(".list-group-item").click(function() {
	if (!$(this).hasClass('active')) {
		$(this).toggleClass("active");
		$(".list-group-item.active").not(this).toggleClass("active");
	}
});

var height1 = $(".jumbotron").height() + 100;
$('#part-list').affix({
      offset: {
        top: height1
      }
});

var height2 = ($(".jumbotron").height() - $("#aside-show-courses .container").height())/2 + $("img").height() + $("nav").height() + 95;
$('.inner').affix({
      offset: {
        top: height2
      }
});

$("#aside-show-courses").on("affixed.bs.affix", function() {
	$("#aside-show-courses img").toggleClass("hidden");
});

$("#aside-show-courses").on("affixed-top.bs.affix", function() {
	$("#aside-show-courses img").toggleClass("hidden");
});

var $myGroup = $('#myGroup');
$myGroup.on('show.bs.collapse','.collapse', function() {
    $myGroup.find('.collapse.in').collapse('hide');
});

$("#checkAllRadios").on("click" , function () {
	var allRadios = $("input[type=checkbox]");
	if ($(this).is(":checked")) {
		allRadios.prop("checked", true);
	} else {
		allRadios.prop("checked", false);
	}
});
