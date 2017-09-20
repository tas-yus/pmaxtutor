var express = require("express");
var router = express.Router({mergeParams: true});
var Part = require("./../models/part");
var Video = require("./../models/video");
var User = require("./../models/user");
var Answer = require("./../models/answer");
var getVideoInfo = require('get-video-info');
var middleware = require("./../middleware");
var method = require("./../method");
var config = require("./../config");

// LEARN VID
router.get("/:vidCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, middleware.canLearn, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    Video.findOne({code: req.params.vidCode}).populate("questions").populate("resources").exec((err, vid) => {
        if (err) return console.log(err);
        User.populate(vid.questions, {path: "author", select: "username"}, (err, questions) => {
            if (err) return console.log(err);
            Answer.populate(questions, {path: "answers", select: "author body"}, (err, questions) => {
                if (err) return console.log(err);
                User.populate(questions, {path: "answers.author", select: "username", model: User}, (err, questions) => {
                    if (err) return console.log(err);
                     res.render("videos/index", {vid, courseCode, partCode, questions});
                });
            });
        });
    });
});

// NEW VIDS
router.get("/videos/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    res.render("videos/new", {courseCode, partCode});
});

// CREATE VIDS **** sucks
router.post("/videos", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    if (!req.files.file) {
            return res.redirect("/courses");
    }
    let file = req.files.file;
    Part.findOne({code: req.params.partCode}, (err, part) => {
        if (err) {
            return console.log(err);
        }
        var path = method.createCode(req.body.title) + ".mp4";
        file.mv(__dirname + config.videoPath + path, (err) => {
            if (err) {
                return console.log(err);
            }
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
                   part.save((err) => {
                       if (err) return console.log(err);
                       res.redirect(`/${req.params.courseCode}/${req.params.partCode}/learn`);
                   });
                });
            }).catch((err) => {
              console.log(err);
            });
        });
    });
});

// DELETE VID
router.delete("/:videoCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Part.findOne({code: req.params.partCode}).populate("videos").exec((err, part) => {
       if (err) {
           return console.log(err);
       }
       part.videos.filter(function(vid) { return vid.code !== req.params.videoCode });
       part.save((err) => {
          if (err) {
              return console.log(err);
          }
          Video.findOneAndRemove({code: req.params.videoCode}, (err) => {
                if (err) {
                    return console.log(err);
                }
                res.redirect(`/${req.params.courseCode}/${req.params.partCode}/learn`);
            });
       });
    });
});

module.exports = router;
