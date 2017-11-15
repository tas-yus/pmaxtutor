var checkable = $(".checkable");

$(document).ready(() => {
  // var updatedVideoCodes = [];
  // var localStorage = window.localStorage;
  // if (localStorage.numFinishedVideos && localStorage.courseBundle) {
  //   var courseBundle = JSON.parse(localStorage.courseBundle);
  //   if(localStorage.numFinishedVideos === localStorage.numVideos) {
  //     $(".main-button").text(`${courseBundle.course.title} Completed!`);
  //   } else {
  //     if ($(".main-button").text() == `${courseBundle.course.title} Completed!`) {
  //       if (courseBundle.mostRecentVideo.video) {
  //           $(".main-button").text(`ดู ${courseBundle.mostRecentVideo.video.title} ต่อ`);
  //       } else {
  //         $(".main-button").text(`Start ${courseBundle.course.title}`);
  //       }
  //     }
  //   }
  //   var numVideos = $(".progress-bar").attr("numVideos");
  //   var newWidth = (localStorage.numFinishedVideos/numVideos)*100;
  //   $(".progress-bar").css("width", newWidth + "%");
  //   $("#num-finished-videos").text(localStorage.numFinishedVideos);
  // }
  // if (localStorage.updatedVideoCodes) {
  //   var videoCodes = JSON.parse(localStorage.updatedVideoCodes);
  //   videoCodes.forEach((vidCode) => {
  //     $(`#${vidCode}`).children().removeClass("fa-circle-o");
  //     $(`#${vidCode}`).children().addClass("fa-check-circle-o");
  //   });
  // }
  checkable.click(function(e) {
    e.preventDefault();
    var url = "/api/users/videos/" + $(this).parent().attr("id");
    // updatedVideoCodes.push($(this).parent().attr("id"));
    var done = $(this).hasClass("fa-check-circle-o");
    var body = {
      done: !done
    };
    $.ajax({
      type: "PUT",
      url,
      data: body,
      dataType: "json",
    }).done((courseBundle) => {
      if (!done) {
        $(this).removeClass("fa-circle-o");
        $(this).addClass("fa-check-circle-o");
      } else {
        $(this).removeClass("fa-check-circle-o");
        $(this).addClass("fa-circle-o");
      }
      var numFinishedVideos = courseBundle.numFinishedVideos;
      var numVideos = $(".progress-bar").attr("numVideos");
      var newWidth = (numFinishedVideos/numVideos)*100;
      $(".progress-bar").css("width", newWidth + "%");
      $("#num-finished-videos").text(numFinishedVideos);
      // window.localStorage.numFinishedVideos = numFinishedVideos;
      // window.localStorage.courseBundle = JSON.stringify(courseBundle);
      // window.localStorage.updatedVideoCodes = JSON.stringify(updatedVideoCodes);
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
