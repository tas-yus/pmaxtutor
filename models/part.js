var mongoose = require("mongoose");

var PartSchema = new mongoose.Schema({
    courseTitle: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    title: String,
    code: String,
    image: String,
    description: String,
    duration: String,
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
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
    price: Number,
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    expiredUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ]
});

module.exports = mongoose.model("Part", PartSchema);
