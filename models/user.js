var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    courses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        expired: {
            type: Boolean,
            default: false
        },
        _id: false
    }],
    parts: [{
        part: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Part"
        },
        expiredAt: {
            type: Number,
            default: new Date().getTime() + 10000
        },
        expired: {
            type: Boolean,
            default: false
        },
        _id: false
    }],
    videos: [{
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        finished: {
            type: Boolean,
            default: false
        },
        _id: false
    }],
    cartCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
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
    answers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Answer",
            default: []
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    },
    numFinishedVideos: {
        type: Number,
        default: 0
    }
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.index({username: "text"});

module.exports = mongoose.model("User", UserSchema);
