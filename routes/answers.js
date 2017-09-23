var express = require("express");
var router = express.Router({mergeParams: true});
var Question = require("./../models/question");
var Answer = require("./../models/answer");

// CREATE ANSWER
router.post("/", (req, res) => {
    var newAnswer = req.body.answer;
    newAnswer.author = req.user;
    Question.findOne({code: req.params.questionCode}, (err, question) => {
        if (err) return console.log(err);
        newAnswer.question = question;
        Answer.create(newAnswer, (err, answer) => {
            if (err) return console.log(err);
            question.answers.push(answer);
            question.save((err) => {
                if (err) return console.log(err);
                res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/videos/${req.params.vidCode}/learn`);
            });
        });
    });
});

module.exports = router;
