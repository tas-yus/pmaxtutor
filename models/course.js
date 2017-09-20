var mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
    title: String,
    code: {
        type: String,
        unique: true
    },
    image: String,
    description: String,
    video: String,
    price: Number,
    parts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Part",
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
    ],
    resources: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            default: []
        }

    ],
    order: "Number",
}, { emitIndexErrors: true });

module.exports = mongoose.model("Course", CourseSchema);
