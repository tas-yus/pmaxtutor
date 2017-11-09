var express = require("express");
var router = express.Router({mergeParams: true});
var Question = require("./../../models/question");
var User = require("./../../models/user");
var Answer = require("./../../models/answer");

// CREATE ANSWER
router.post("/", (req, res) => {
  var newAnswer = req.body.answer;
  newAnswer.author = req.user;
  Question.findOne({code: req.params.questionCode}, (err, question) => {
    if (err) return console.log(err);
    newAnswer.question = question;
    Answer.create(newAnswer, async (err, answer) => {
      if (err) return res.status(400).send("Something went wrong");
      var answer = await User.populate(answer, {path: "author", select: "username"});
      res.status(201).send(answer);
      question.answers.push(answer);
      question.save((err) => {
        if (err) return console.log(err);
      });
    });
  });
});

module.exports = router;
