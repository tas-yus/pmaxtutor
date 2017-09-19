var express = require("express");
var router = express.Router({mergeParams: true});
var Video = require("./../models/video");
var Course = require("./../models/course");
var Question = require("./../models/question");
var User = require("./../models/user");
var Answer = require("./../models/answer");
var Promise = require("bluebird");

// QUESTIONS
router.get("/questions", (req, res) => {
    Course.findOne({code: req.params.courseCode}).populate("questions").exec((err, course) => {
        if (err) return console.log(err);
        User.populate(course.questions, {path: "author", select: "username"}, (err, questions) => {
            if (err) return console.log(err);
            Answer.populate(questions, {path: "answers", select: "author body"}, (err, questions) => {
                if (err) return console.log(err);
                User.populate(questions, {path: "answers.author", select: "username", model: User}, (err, questions) => {
                    if (err) return console.log(err);
                    res.render("questions/index", {questions, course});
                });
            });
        });
    });
});

// CREATE QUESTIONS
router.post("/:partCode/:vidCode/questions", (req, res) => {
    var newQuestion = req.body.question;
    newQuestion.author = req.user;
    var findVideo = Video.findOne({code: req.params.vidCode});
    var createQuestion =  Question.create(newQuestion);
    return Promise.join(findVideo, createQuestion, (video, question) => {
        newQuestion.video = video;
        video.questions.push(question);
        video.save().then(() => {
            res.redirect(`/${req.params.courseCode}/${req.params.partCode}/${req.params.vidCode}/learn`);
        }).catch((err) => {
           console.log(err); 
        });
    }).catch((err) => {
        console.log(err);
    });
});

module.exports = router;