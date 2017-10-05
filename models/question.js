var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connect("mongodb://localhost/pmaxapp", {useMongoClient: true}));

var QuestionSchema = new mongoose.Schema({
    title: String,
    body: String,
    code: Number,
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
        default: []
    }],
    createdAt: {
        type: Number,
        default: new Date().getTime()
    }
});

QuestionSchema.plugin(autoIncrement.plugin,
    {
        model: 'Question',
        field: 'code',
        startAt: 100,
        incrementBy: 1
    });
module.exports = mongoose.model("Question", QuestionSchema);
