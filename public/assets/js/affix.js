if ($(window).width() > 768) {
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
    if (!$("#aside-show-courses img").hasClass("hidden")) {
      $("#aside-show-courses img").addClass("hidden");
    }
  });

  $("#aside-show-courses").on("affixed-top.bs.affix", function() {
    if ($("#aside-show-courses img").hasClass("hidden")) {
      $("#aside-show-courses img").removeClass("hidden");
    }
  });
}

var sizeTimer;
$(window).on("resize", function() {
  var isWindowSmallEnough = $(window).width() <= 768;
  if (isWindowSmallEnough) {
    $(".inner").removeClass("affix");
    $("#aside-show-courses").off();
  } else {
    $("#aside-show-courses").on("affixed.bs.affix", function() {
      if (!$("#aside-show-courses img").hasClass("hidden")) {
        $("#aside-show-courses img").addClass("hidden");
      }
    });
    $("#aside-show-courses").on("affixed-top.bs.affix", function() {
      if ($("#aside-show-courses img").hasClass("hidden")) {
        $("#aside-show-courses img").removeClass("hidden");
      }
    });
  }
});
