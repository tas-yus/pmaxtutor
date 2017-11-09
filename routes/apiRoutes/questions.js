var express = require("express");
var router = express.Router({mergeParams: true});
var Course = require("./../../models/course");
var Part = require("./../../models/part");
var Video = require("./../../models/video");
var User = require("./../../models/user");
var Order = require("./../../models/order");
var Answer = require("./../../models/answer");
var Question = require("./../../models/question");
var middleware = require("./../../middleware");
var method = require("./../../method");
var checkExpiry = require("./../../method/checkExpiry");
var config = require("./../../config");
var mongoose = require("mongoose");
var forEach = require('async-foreach').forEach;
var async = require('async');
var fs = require("fs");
var path = require("path");

// QUESTIONS
router.get("/questions", async (req, res) => {
  var course = await Course.findOne({code: req.params.courseCode}).populate("questions").exec();
  var questions = await User.populate(course.questions, {path: "author", select: "username"});
  questions = await Answer.populate(questions, {path: "answers", select: "author body"});
  questions = await User.populate(questions, {path: "answers.author", select: "username", model: User});
  res.status(400).send(questions);
});

// CREATE QUESTIONS
router.post("/parts/:partCode/videos/:vidCode/questions", async (req, res) => {
  console.log(req.body.question);
  var newQuestion = req.body.question;
  newQuestion.author = req.user;
  var video = await Video.findOne({code: req.params.vidCode});
  newQuestion.video = video._id;
  var question =  await Question.create(newQuestion);
  var course = await Course.findOne({code: req.params.courseCode});
  newQuestion.video = video;
  video.questions.push(question);
  course.questions.push(question);
  video.save().then(() => {
    return course.save();
  }).then(() => {
    res.status(201).send(question);
  }).catch((err) => {
    res.status(400).send("Something is wrong with the database.");
  });
});

module.exports = router;
