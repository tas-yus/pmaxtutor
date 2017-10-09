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

// LEARN VID
router.get("/:vidCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, middleware.canLearn, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    var checkPartOwnership = method.checkPartOwnership;
    Course.findOne({code: courseCode}).populate("parts").exec((err, course) => {
      if (err) return console.log(err);
      Video.populate(course.parts, {path: "videos"}, (err, parts) => {
        if (err) return console.log(err);
        Video.findOne({code: req.params.vidCode}).sort({order:1}).populate("questions").populate("resources").exec((err, vid) => {
            if (err) return console.log(err);
            User.populate(vid.questions, {path: "author", select: "username"}, (err, questions) => {
                if (err) return console.log(err);
                Answer.populate(questions, {path: "answers", select: "author body"}, (err, questions) => {
                    if (err) return console.log(err);
                    User.populate(questions, {path: "answers.author", select: "username", model: User}, (err, questions) => {
                        if (err) return console.log(err);
                        var user = req.user;
                        user.mostRecentVideo = vid;
                        user.save((err) => {
                          if (err) return console.log(err);
                          res.render("videos/index", {vid, course, courseCode, partCode, questions, checkPartOwnership});
                        })
                    });
                });
            });
        });
      });
    });
});

// NEW VIDS
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    fs.readdir(__dirname + config.videoPath, (err, vidPaths) => {
      res.render("videos/new", {courseCode, partCode, vidPaths});
    });
});

// CREATE VIDS **** sucks
router.post("/", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
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
    Course.findOne({code: req.params.courseCode}, (err, course) => {
      if (err) return console.log(err);
      course.numVideos++;
      if (fileUploaded) {
        let file = req.files.file;
        Part.findOne({code: req.params.partCode}, (err, part) => {
          if (err) return console.log(err);
          file.mv(__dirname + config.videoPath + path, (err) => {
            if (err) return console.log(err);
            getVideoInfo(__dirname + config.videoPath + path).then(info => {
                var newVid = {
                    title: req.body.title,
                    path,
                    course: part.course,
                    part: part.title,
                    duration: method.toClockTime(info.format.duration)
                };
                Video.create(newVid, (err, vid) => {
                   if (err) return console.log(err);
                   part.videos.push(vid);
                   part.duration = method.toClockTime(method.toTime(part.duration) + Number(info.format.duration));
                   part.save((err) => {
                     if (err) return console.log(err);
                     course.save((err) => {
                       res.redirect(`/courses/${req.params.courseCode}/learn`);
                     });
                   });
                });
            }).catch((err) => {
              console.log(err);
            });
          });
        });
      } else {
        Part.findOne({code: req.params.partCode}, (err, part) => {
          if (err) return console.log(err);
          getVideoInfo(__dirname + config.videoPath + path).then(info => {
              var newVid = {
                  title: req.body.title,
                  path,
                  course: part.course,
                  part: part.title,
                  duration: method.toClockTime(info.format.duration)
              };
              Video.create(newVid, (err, vid) => {
                 if (err) return console.log(err);
                 part.videos.push(vid);
                 part.duration = method.toClockTime(method.toTime(part.duration) + Number(info.format.duration));
                 part.save((err) => {
                   if (err) return console.log(err);
                   course.save((err) => {
                     res.redirect(`/courses/${req.params.courseCode}/learn`);
                   });
                 });
              });
          }).catch((err) => {
            console.log(err);
          });
        });
      }
    });
});

// DELETE VID
router.delete("/:vidCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Part.findOne({code: req.params.partCode}).populate("videos").exec((err, part) => {
       if (err) {
           return console.log(err);
       }
       part.videos.filter(function(vid) { return vid.code !== req.params.videoCode });
       part.save((err) => {
          if (err) {
              return console.log(err);
          }
          Video.findOneAndRemove({code: req.params.vidCode}, (err) => {
                if (err) {
                    return console.log(err);
                }
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
    console.log(nextVidCode);
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
