var express = require("express");
var router = express.Router({mergeParams: true});
var Video = require("./../models/video");
var Course = require("./../models/course");
var Question = require("./../models/question");
var User = require("./../models/user");
var Answer = require("./../models/answer");

// QUESTIONS
router.get("/questions", async (req, res) => {
  var course = await Course.findOne({code: req.params.courseCode}).populate("questions").exec();
  var questions = await User.populate(course.questions, {path: "author", select: "username"});
  questions = await Answer.populate(questions, {path: "answers", select: "author body"});
  questions = await User.populate(questions, {path: "answers.author", select: "username", model: User});
  res.render("questions/index", {questions, course});
});

// CREATE QUESTIONS
router.post("/parts/:partCode/videos/:vidCode/questions", async (req, res) => {
  var newQuestion = req.body.question;
  newQuestion.author = req.user;
  var video = await Video.findOne({code: req.params.vidCode});
  var question =  await Question.create(newQuestion);
  var course = await Course.findOne({code: req.params.courseCode});
  newQuestion.video = video;
  video.questions.push(question);
  course.questions.push(question);
  video.save().then(() => {
    return course.save();
  }).then(() => {
    res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/videos/${req.params.vidCode}/learn`);
  }).catch((err) => {
     console.log(err);
  });
});

module.exports = router;
