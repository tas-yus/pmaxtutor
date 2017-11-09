var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connect("mongodb://localhost/pmaxapp", {useMongoClient: true}));

var VideoSchema = new mongoose.Schema({
    title: String,
    code: Number,
    partTitle: String,
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part"
    },
    thumbnail: String,
    courseTitle: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    path: String,
    duration: String,
    resources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            default: []
        }
    ],
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            default: []
        }
    ],
    previewAllowed: {
        type: Boolean,
        default: false
    },
    order: Number
});

VideoSchema.plugin(autoIncrement.plugin,
    {
        model: 'Video',
        field: 'code',
        startAt: 100,
        incrementBy: 1
    });
module.exports = mongoose.model("Video", VideoSchema);
