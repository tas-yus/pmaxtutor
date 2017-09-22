var mongoose = require("mongoose");

var PartSchema = new mongoose.Schema({
    course: String,
    title: String,
    code: String,
    image: String,
    description: String,
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
