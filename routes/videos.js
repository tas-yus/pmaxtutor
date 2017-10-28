var express = require("express");
var router = express.Router({mergeParams: true});
var Part = require("./../models/part");
var Course = require("./../models/course");
var Video = require("./../models/video");
var User = require("./../models/user");
var Answer = require("./../models/answer");
var getVideoInfo = require('get-video-info');
var middleware = require("./../middleware");
var method = require("./../method");
var config = require("./../config");
var fs = require("fs");
var async = require("async");

// LEARN VID
router.get("/:vidCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, middleware.canLearn, async (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    var checkPartOwnership = method.checkPartOwnership;
    var course = await Course.findOne({code: courseCode}).populate("parts").exec();
    var parts = await Video.populate(course.parts, {path: "videos"});
    var video = await Video.findOne({code: req.params.vidCode}).sort({order:1}).populate("questions").populate("resources").exec();
    var questions = await User.populate(video.questions, {path: "author", select: "username"});
    questions = await Answer.populate(questions, {path: "answers", select: "author body"});
    questions = await User.populate(questions, {path: "answers.author", select: "username", model: User});
    var user = req.user;
    user.mostRecentVideo = video;
    user.save((err) => {
      if (err) return console.log(err);
      res.render("videos/index", {vid: video, course, courseCode, partCode, questions, checkPartOwnership});
    })
});

// NEW VIDS
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    fs.readdir(__dirname + config.videoPath, (err, vidPaths) => {
      res.render("videos/new", {courseCode, partCode, vidPaths});
    });
});

// CREATE VIDS
router.post("/", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
  var fileUploaded = false;
  var path;
  if (!req.files.file && !req.body.chosenVideo) {
    return res.redirect("/courses");
  } else if (req.files.file) {
    fileUploaded = true;
    path = method.createCode(req.body.title) + ".mp4";
  } else {
    fileUploaded = false;
    path = req.body.chosenVideo;
  }
  var course = await Course.findOne({code: req.params.courseCode});
  course.numVideos++;
  course.save((err) => {
    if (err) return console.log(err);
  });
  let file = req.files.file;
  async.waterfall([
    function(callback) {
      Part.findOne({code: req.params.partCode}).populate("users").populate("expiredUsers").exec((err, part) => {
        if (err) return console.log(err);
        callback(null, part);
      });
    },
    function(part, callback) {
      if (!file) return callback(null,part);
      file.mv(__dirname + config.videoPath + path, (err) => {
        if (err) return console.log(err);
        callback(null, part)
      });
    },
    function(part, callback) {
      getVideoInfo(__dirname + config.videoPath + path).then((info) => {
        callback(null, part, info);
      }).catch((err) => {
        console.log(err);
      });
    },
    function(part, info, callback) {
      var newVid = {
          title: req.body.title,
          path,
          course: part.course,
          part: part.title,
          duration: method.toClockTime(info.format.duration)
      };
      Video.create(newVid, (err, vid) => {
         if (err) return console.log(err);
         callback(null, part, vid, info);
      });
    },
    function(part, vid, info, callback) {
      part.videos.push(vid);
      part.duration = method.toClockTime(method.toTime(part.duration) + Number(info.format.duration));
      part.save((err) => {
        if (err) return console.log(err);
        callback(null, part, vid);
      });
    },
    function(part, vid, callback) {
      async.eachSeries(part.users, (user, cb) => {
        user.videos.push({video: vid});
        user.save((err) => {
          if (err) return console.log(err);
          cb();
        });
      }, (err) => {
        callback(null, part, vid);
      });
    },
    function(part, vid, callback) {
      async.eachSeries(part.expiredUsers, (user, cb) => {
        user.videos.push({video: vid});
        user.save((err) => {
          if (err) return console.log(err);
          cb();
        });
      }, (err) => {
        callback(null, vid);
      });
    }
  ], (err) => {
    console.log(err);
    res.redirect(`/courses/${req.params.courseCode}/learn`);
  });
});

// DELETE VID
router.delete("/:vidCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  Part.findOne({code: req.params.partCode}).populate("videos").exec((err, part) => {
    if (err) return console.log(err);
    part.videos.filter(function(vid) { return vid.code !== req.params.videoCode });
    part.save((err) => {
      if (err) return console.log(err);
      Video.findOneAndRemove({code: req.params.vidCode}, (err) => {
        if (err) return console.log(err);
        res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/learn`);
      });
    });
  });
});

// DONE VID
router.post("/:vidCode/done", (req, res) => {
  Video.findOne({code: req.params.vidCode}, (err, video) => {
    if (err) return console.log(err);
    var user = req.user;
    var targetedVideo = method.getVideoInArrayById(user.videos, video._id.toString());
    var nextVidCode = req.body.next;
    if (!user.isAdmin && !targetedVideo.finished) {
      targetedVideo.finished = true;
      user.numFinishedVideos++;
      user.save((err) => {
        if (err) return console.log(err);
        if (nextVidCode) {
          res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/videos/${nextVidCode}/learn`);
        } else {
          req.flash("success", `จบ ${req.params.partCode}`);
          res.redirect(`/courses/${req.params.courseCode}/learn`);
        }
      });
    } else {
      if (nextVidCode) {
        res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/videos/${nextVidCode}/learn`);
      } else {
        req.flash("success", `จบ ${req.params.partCode}`);
        res.redirect(`/courses/${req.params.courseCode}/learn`);
      }
    }
  });
});

module.exports = router;
