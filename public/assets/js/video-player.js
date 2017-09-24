window.onload = function() {

  // Video
  var video = $("#video");

  // Buttons
  var playButton = $("#play-pause");
  var muteButton = $("#mute");
  var fullScreenButton = $("#full-screen");

  // Sliders
  var seekBar = $("#seek-bar");
  var volumeBar = $("#volume-bar");

  // Update the seek bar as the video plays
  video.on("timeupdate", function() {
    // Calculate the slider value
    var value = (100 / video.get(0).duration) * video.get(0).currentTime;

    // Update the slider value
    seekBar.val(value);
  });

  // Event listener for the seek bar
  seekBar.on("change", function() {
    // Calculate the new time
    var time = video.get(0).duration * (seekBar.val() / 100);

    // Update the video time
    video.get(0).currentTime = time;
  });

  // Pause the video when the slider handle is being dragged
  seekBar.mousedown(function() {
    video.get(0).pause();
  });

  // Play the video when the slider handle is dropped
  seekBar.mouseup(function() {
    video.get(0).play();
  });
  fullScreenButton.click(function() {
    if (video.get(0).requestFullscreen) {
      video.get(0).requestFullscreen();
    } else if (video.get(0).mozRequestFullScreen) {
      video.get(0).mozRequestFullScreen(); // Firefox
    } else if (video.get(0).webkitRequestFullscreen) {
      video.get(0).webkitRequestFullscreen(); // Chrome and Safari
    }
  });

  // Event listener for the mute button
  muteButton.click(function() {
    if (video.get(0).muted == false) {
      // Mute the video
      video.get(0).muted = true;

      // Update the button text
      muteButton.html("Unmute");
    } else {
      // Unmute the video
      video.get(0).muted = false;

      // Update the button text
      muteButton.html("Mute");
    }
  });

  // Event listener for the play/pause button
  playButton.click(function() {
    if (video.get(0).paused == true) {
      // Play the video
      video.get(0).play();

      // Update the button text to 'Pause'
      playButton.html("Pause")
    } else {
      // Pause the video
      video.get(0).pause();

      // Update the button text to 'Play'
      playButton.html("Play");
    }
  });

    // Event listener for the volume bar
  volumeBar.on("change", function() {
    // Update the video volume
    video.get(0).volume = volumeBar.val();
  });

}
