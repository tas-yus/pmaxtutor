var express = require("express");
var router = express.Router({mergeParams: true});
var Video = require("./../models/video");
var Course = require("./../models/course");
var Resource = require("./../models/resource");
var fs = require("fs");
var middleware = require("./../middleware");
var method = require("./../method");
var Promise = require("bluebird");
var config = require("./../config");

// NEW RESOURCES
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    var videoCode = req.params.vidCode;
    res.render("resources/new", {courseCode, partCode, videoCode});
});

// CREATE RESOURCES
router.post("/", (req, res) => {
    if (!req.files.file) {
        return res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/videos/${req.params.vidCode}/resources/new`);
    }
    let file = req.files.file;
    var path = method.createCode(req.body.title) + ".pdf";
    var newResource = {
        title: req.body.title,
        path
    };
    var createResource = Resource.create(newResource);
    var findCourse = Course.findOne({code: req.params.courseCode});
    var findVideo = Video.findOne({code: req.params.vidCode});
    return Promise.join(createResource, findCourse, findVideo, (resource, course, vid) => {
        course.resources.push(resource);
        vid.resources.push(resource);
        course.save().then(() => {
            file.mv(__dirname + config.resourcePath + path, (err) => {
                if (err) {
                    return console.log(err);
                }
            });
            return vid.save();
        }).then(() => {
            res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/learn`);
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
       console.log(err);
    });
});

// DELETE RESOURCE
// when delete vid resources should all go
// actually delete res files
router.delete("/:resourceCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Course.findOne({code: req.params.courseCode}).populate({path: "resources", select: "code"}).exec().then((course) => {
        course.resources = course.resources.filter(function(res) { return res.code !== req.params.resourceCode });
        return course.save();
    }).then(() => {
        return Video.findOne({code: req.params.vidCode}).populate({path: "resources", select: "code"}).exec();
    }).then((vid) => {
        vid.resources = vid.resources.filter(function(res) { return res.code !== req.params.resourceCode });
        return vid.save();
    }).then(() => {
        return Resource.findOneAndRemove({code: req.params.resourceCode});
    }).then((resource) => {
        var path = __dirname + config.resourcePath + resource.path;
        fs.stat(path, (err, stats) => {
            console.log(stats);
            if (err) {
                return console.error(err);
            }
            fs.unlink(path, (err) => {
                if(err) return console.log(err);
                console.log('file deleted successfully');
            });
        });
        res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/learn`);
    });
});

module.exports = router;
