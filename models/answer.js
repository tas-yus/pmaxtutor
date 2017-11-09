var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connect("mongodb://localhost/pmaxapp", {useMongoClient: true}));

var AnswerSchema = new mongoose.Schema({
    body: String,
    code: Number,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

AnswerSchema.plugin(autoIncrement.plugin,
    {
        model: 'Answer',
        field: 'code',
        startAt: 100,
        incrementBy: 1
    });
module.exports = mongoose.model("Answer", AnswerSchema);
