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
