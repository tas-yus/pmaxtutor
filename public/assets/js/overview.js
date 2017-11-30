var checkable = $(".checkable");

$(document).ready(() => {
  checkable.click(function(e) {
    e.preventDefault();
    var url = "/api/users/videos/" + $(this).parent().attr("id");
    $.ajax({
      type: "PUT",
      url,
      dataType: "json",
    }).done((data) => {
      var videoBundle = data.videoBundle;
      if (videoBundle.finished) {
        $(this).removeClass("fa-circle-o");
        $(this).addClass("fa-check-circle-o");
      } else {
        $(this).removeClass("fa-check-circle-o");
        $(this).addClass("fa-circle-o");
      }
      var courseBundle = data.courseBundle;
      var numFinishedVideos = courseBundle.numFinishedVideos;
      var numVideos = $(".progress-bar").attr("numVideos");
      var newWidth = (numFinishedVideos/numVideos)*100;
      $(".progress-bar").css("width", newWidth + "%");
      $("#num-finished-videos").text(numFinishedVideos);
      if (numFinishedVideos == numVideos) {
        $(".main-button").text(`${courseBundle.course.title} Completed!`);
      } else {
        if ($(".main-button").text() == `${courseBundle.course.title} Completed!`) {
          if (courseBundle.mostRecentVideo.video) {
              $(".main-button").text(`ดู ${courseBundle.mostRecentVideo.video.title} ต่อ`);
          } else {
            $(".main-button").text(`Start ${courseBundle.course.title}`);
          }
        }
      }
    }).fail((err) => {
      console.log(err);
    });
  });
});
