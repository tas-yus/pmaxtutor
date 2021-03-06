// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]"
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;

// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

var overview = false;
var qa = false;
var queryString = window.location.search;
queryString = queryString.substring(1);
var queries = queryString.split("=");

$(document).ready(function() {
  var defaultVolume = 1;
  var videoPlayer = $('#videoPlayer');
  if (!isSafari) {
    videoPlayer[0].play();
    $(".glyphicon-play").attr("class", "glyphicon glyphicon-pause");
  }
  var fadeout = null;
  $("html").mousemove(function() {
    $(".videoControls").fadeIn("medium");
    $(".videoLabels").children().not("#myModal").fadeIn("medium");
    if (fadeout != null) {
      clearTimeout(fadeout);
    }
    fadeout = setTimeout(hide_playlist, 3000);
  });
  function hide_playlist() {
    $(".videoControls").stop().fadeOut("medium");
    $(".videoLabels").children().not("#myModal").stop().fadeOut("medium");
  }
  $(".btnPlay").click(function() {
    if (videoPlayer[0].paused) {
      videoPlayer[0].play();
      $(".glyphicon-play").attr("class", "glyphicon glyphicon-pause");
    } else {
      videoPlayer[0].pause();
      $(".glyphicon-pause").attr("class", "glyphicon glyphicon-play");
    }
    return false;
  });
  videoPlayer.on("timeupdate", function() {
    $(".current").text(toClockTime(Math.round(videoPlayer[0].currentTime)));
  });
  videoPlayer.on("loadedmetadata", function() {
    if (queries[0] === "start" && queries[1] >= 0 && queries[1] <= videoPlayer[0].duration) {
      videoPlayer[0].currentTime = queries[1];
    }
    $(".duration").text(toClockTime(Math.round(videoPlayer[0].duration)));
  });
  $(".btnMute").click(function(e) {
    if (!videoPlayer[0].muted) {
      videoPlayer[0].muted = true;
      defaultVolume = $("#volume-bar").val();
      videoPlayer[0].volume = 0;
      $("#volume-bar").val(0);
      $(".glyphicon-volume-up").attr("class", "glyphicon glyphicon-volume-off");
    } else {
      videoPlayer[0].muted = false;
      videoPlayer[0].volume = defaultVolume;
      $("#volume-bar").val(defaultVolume);
      $(".glyphicon-volume-off").attr("class", "glyphicon glyphicon-volume-up");
    }
    e.preventDefault();
  });

  $(".btnFullscreen").on("click", function(e) {
    if( window.innerHeight == screen.height) {
      videoPlayer[0].webkitExitFullscreen();
      videoPlayer[0].mozExitFullscreen();
    } else {
      videoPlayer[0].webkitEnterFullscreen();
      videoPlayer[0].mozRequestFullScreen();
    }
    return false;
  });

  videoPlayer.on('timeupdate', updateProgressBar);

  function updateProgressBar() {
    var videoPlayer = $('#videoPlayer');
     var progressBar = $('#progress-bar');
     var percentage = Math.floor((100 / videoPlayer[0].duration) *
     videoPlayer[0].currentTime);
     progressBar.val(percentage);
     progressBar.html(percentage + '% played');
     if (videoPlayer[0].currentTime === videoPlayer[0].duration) {
       $(".glyphicon-pause").attr("class", "glyphicon glyphicon-play");
     }
  }

  var progressBar = $("#progress-bar");
  progressBar.on("click", seek);

  function seek(e) {
    var videoPlayer = $('#videoPlayer');
    var shouldPlay = true;
    if (videoPlayer[0].paused) {
      $(".glyphicon-pause").attr("class", "glyphicon glyphicon-play");
      shouldPlay = false;
    } else {
      videoPlayer[0].pause();
    }
    var percent = e.offsetX / progressBar.width();
    progressBar.val(percent*100);
    videoPlayer[0].currentTime = percent * videoPlayer[0].duration;
    if (shouldPlay) {
      $(".glyphicon-play").attr("class", "glyphicon glyphicon-pause");
      videoPlayer[0].play();
    }
  }


  var volumeBar = $("#volume-bar");
  volumeBar.on("click", seekVolume);

  function seekVolume(e) {
    var videoPlayer = $('#videoPlayer');
    if (videoPlayer[0].muted) {
      videoPlayer[0].muted = false;
      $(".glyphicon-volume-off").attr("class", "glyphicon glyphicon-volume-up");
    }
    var volume = e.offsetX / volumeBar.width();
    volumeBar.val(volume);
    videoPlayer[0].volume = volume;
  }


  $(".medium-quality").click(function(e) {
    videoPlayer[0].playbackRate = 1.0;
    var time = videoPlayer[0].currentTime;
    var videoFile = "/assets/videos/small.mp4"
    $('#videoPlayer source').attr("src", videoFile);
    videoPlayer[0].load();
    videoPlayer[0].currentTime = time;
    videoPlayer[0].play();
    e.preventDefault();
  });
  $(".high-quality").click(function(e) {
    videoPlayer[0].playbackRate = 1.0;
    var time = videoPlayer[0].currentTime;
    var videoFile = "/assets/videos/test.mp4"
    $('#videoPlayer source').attr("src", videoFile);
    videoPlayer[0].load();
    videoPlayer[0].currentTime = time;
    videoPlayer[0].play();
    e.preventDefault();
  });
  $(".btnBack").click(function(e) {
    var time = videoPlayer[0].currentTime - 15;
    if (time < 0) time = 0;
    videoPlayer[0].currentTime = time;
    e.preventDefault();
  });
  $(".btnForward").click(function(e) {
    var time = videoPlayer[0].currentTime + 15;
    if (time > videoPlayer[0].duration) time = videoPlayer[0].duration;
    videoPlayer[0].currentTime = time;
    e.preventDefault();
  });
  $(".super-fast").click(function(e) {
    videoPlayer[0].playbackRate = 2.0;
    e.preventDefault();
  });
  $(".fast").click(function(e) {
    videoPlayer[0].playbackRate = 1.5;
    e.preventDefault();
  });
  $(".slightly-fast").click(function(e) {
    videoPlayer[0].playbackRate = 1.25;
    e.preventDefault();
  });
  $(".normal").click(function(e) {
    videoPlayer[0].playbackRate = 1.0;
    e.preventDefault();
  });
  $(".slow").click(function(e) {
    videoPlayer[0].playbackRate = 0.75;
    e.preventDefault();
  });
  $(".super-slow").click(function(e) {
    videoPlayer[0].playbackRate = 0.50;
    e.preventDefault();
  });
  function toClockTime(timeInSec) {
      var min = Math.floor(timeInSec/60);
      var sec = Math.floor(timeInSec % 60);
      if (sec < 10) sec = "0" + sec;
      var time = "";
      time = time + min + ":" + sec;
      return time;
  }
  var $video  = $('video'),
  $window = $(window);
  $(window).resize(function(){
      var height = $window.height();
      $video.css('height', height);
      var videoWidth = $video.width(),
          windowWidth = $window.width(),
      marginLeftAdjust =   (windowWidth - videoWidth) / 2;
      $video.css({
          'height': height,
          'marginLeft' : marginLeftAdjust
      });
      if ((qa || overview) && $(window).width() < 960) {
        videoPlayer[0].pause();
        $(".glyphicon-pause").attr("class", "glyphicon glyphicon-play");
      }
      if ((qa || overview) && $(window).width() < 1100) {
        $(".videoTime").addClass("tiny");
      } else {
        $(".videoTime").removeClass("tiny");
      }
  }).resize();
  videoPlayer.on("ended", () => {
    $("#done").trigger('click');
  })

  var myTag = $("script").last();
  var src = myTag[myTag.length-1].src;
  var link = src.split("?")[1].split("&")[0];
  var nextVidCode = src.split("?")[1].split("&")[1];
  if (!nextVidCode) {
    $(".nextVideo a").text("End Part");
  }
  $(".nextVideo a").attr("href", link);
  $("body").click(function(e) {
    if (e.clientY > $(".videoLabels").outerHeight(true) && e.clientY < $(window).height() - 20 - ($(".videoControls").outerHeight(true))) {
      if(!videoPlayer[0].paused) {
        videoPlayer[0].pause();
        $(".glyphicon-pause").attr("class", "glyphicon glyphicon-play");
      } else {
        videoPlayer[0].play();
        $(".glyphicon-play").attr("class", "glyphicon glyphicon-pause");
      }
    }
  });
  $("#overview-btn").on("click", () => {
    if (!overview) {
      overview = true;
      if (qa) {
        qa = false;
        $(".questions-and-answers").removeClass("opened");
        $(".inner-right").removeClass("wrapper-right-opened");
        $(".video-content").removeClass("content-small");
      }
      $(".course-overview").addClass("opened");
      $(".inner-left").addClass("wrapper-left-opened");
      $(".video-content").addClass("content-small");
    } else {
      overview = false;
      $(".course-overview").removeClass("opened");
      $(".inner-left").removeClass("wrapper-left-opened");
      $(".video-content").removeClass("content-small");
    }
  });
  $("#QA-btn").on("click", () => {
    if (!qa) {
      qa = true;
      if (overview) {
        overview = false;
        $(".course-overview").removeClass("opened");
        $(".inner-left").removeClass("wrapper-left-opened");
        $(".video-content").removeClass("content-small");
      }
      $(".questions-and-answers").addClass("opened");
      $(".inner-right").addClass("wrapper-right-opened");
      $(".video-content").addClass("content-small");
    } else {
      qa = false;
      $(".questions-and-answers").removeClass("opened");
      $(".inner-right").removeClass("wrapper-right-opened");
      $(".video-content").removeClass("content-small");
    }
  });
  // $(".course-overview").on("click", () => {
  //   overview = false;
  //   qa = false;
  //   $(".course-overview").removeClass("opened");
  //   $(".video-content").removeClass("content-small");
  // });
  // $(".questions-and-answers").on("click", () => {
  //   overview = false;
  //   qa = false;
  //   $(".questions-and-answers").removeClass("opened");
  //   $(".video-content").removeClass("content-small");
  // });

  $("#dashboard-btn").on("click", function(e) {
    e.preventDefault();
    $(".loader-wrapper").removeClass("hidden");
    var videoCode = (window.location.href.split("videos/")[1]).split("/learn")[0];
    var url = "/api/users/videos/" + videoCode;
    var body = {
      start: videoPlayer[0].currentTime
    };
    setTimeout(() => {
      $.post(url, body).done((data) => {
        console.log(data);
        window.location.href = $("#dashboard-btn").attr("href");
      }).fail((err) => {
        console.log(err);
      });
    }, 200);
  });
    // $(window).on("unload", () => {
    //   $(".loader-wrapper").removeClass("hidden");
    //   var videoCode = (window.location.href.split("videos/")[1]).split("/learn")[0];
    //   var url = "/api/users/videos/" + videoCode;
    //   var body = {
    //     start: videoPlayer[0].currentTime
    //   };
    //   $.ajax({
    //     type: 'POST',
    //     url,
    //     data: body,
    //     dataType: json,
    //     async: false,
    //   }).done((data) => {
    //     console.log(data);
    //   }).fail((err) => {
    //     console.log(err);
    //   });
    // });
});
