var express = require("express");
var router = express.Router({mergeParams: true});
var Course = require("./../models/course");
var Part = require("./../models/part");
var Video = require("./../models/video");
var User = require("./../models/user");
var middleware = require("./../middleware");
var method = require("./../method");

// LEARN PART
router.get("/:partCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, middleware.canLearn, (req, res) => {
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) {
            return console.log(err);
        }
        Part.findOne({code: req.params.partCode}, (err, part) => {
            if(err) {
                return console.log(err);
            }
            Video.find({ part: part.title }).populate("resources").exec((err, videos) => {
                if(err) {
                    return console.log(err);
                }
                res.render("parts/index", {part, course, videos});
            });
        });
    });
});

// NEW PART
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var courseCode = req.params.courseCode;
    res.render("parts/new", {courseCode});
});

// CREATE PART
router.post("/", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    if (!req.files.file) {
        return res.redirect(`/courses/${req.params.courseCode}/parts/new`);
    }
    let file = req.files.file;
    var path = req.body.image + ".jpg";
    file.mv(__dirname + '/../public/assets/images/' + path, (err) => {
        if (err) {
            return console.log(err);
        }
    });
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) {
            return console.log(err);
        }
        var newPart = {
            title: req.body.title,
            code: method.createCode(req.body.title),
            description: req.body.description,
            price: req.body.price,
            image: path,
            course: course.title
        };
        Part.create(newPart, (err, part) => {
            if (err) {
                return console.log(err);
            }
            course.parts.push(part);
            course.save((err) => {
                if (err) {
                    return console.log(err);
                }
                res.redirect(`/courses/${course.code}/parts/${part.code}/videos/new`);
            });
        });
    });
});

// EDIT PART
router.get("/:partCode/edit", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) {
            return console.log(err);
        }
        Part.findOne({code: req.params.partCode}, (err, part) => {
           if (err) {
               return console.log(err);
           }
           res.render("parts/edit", {part, course});
        });
    });
});

// UPDATE PART
router.put("/:partCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Part.findOne({code: req.params.partCode}, (err, part) => {
        if (err) {
            return console.log(err);
        }
        // change course parts to the new name
        var oldPartId = part._id.toString();
        var oldPart = part.title;
        var changedTitle = Boolean(part.title !== req.body.title);
        part.title = req.body.title;
        part.code = method.createCode(req.body.title);
        part.price = req.body.price;
        part.description = req.body.description;
        Course.findOne({code: req.params.courseCode}, (err, course) => {
           if (err) {
               return console.log(err);
           }
           course.parts = course.parts.filter(function(part) { return part.toString() !== oldPartId });
           course.parts.push(part);
           course.save((err) => {
              if (err) {
                  return console.log(err);
              }
           });
           if(changedTitle) {
               Video.find({part: oldPart}, (err, videos) => {
                   if (err) {
                       return console.log(err);
                   }
                   videos.forEach((vid) => {
                      vid.part = req.body.title;
                      vid.save((err) => {
                          if (err) return console.log(err);
                      });
                   });
               });
           }
        });
        part.save((err) => {
            if (err) {
                return console.log(err);
            }
        });
        let file = req.files.file;
        if (file) {
            var path = part.image;
            file.mv(__dirname + '/../public/assets/images/' + path, (err) => {
                if (err) {
                    return console.log(err);
                }
                res.redirect("/dashboard");
            });
        } else {
            res.redirect("/dashboard");
        }
    });
});

// EXTEND PART
router.get("/:partCode/extend", middleware.isLoggedIn, middleware.canExtend, (req, res) => {
    var courseCode = req.params.courseCode;
    var partCode = req.params.partCode;
    Part.findOne({code: partCode}).then((part) => {
        res.render("parts/extend", {courseCode, partCode, part});
    }).catch((err) => {
        console.log(err);
    });
});

router.post("/:partCode/extend", middleware.isLoggedIn, middleware.canExtend, (req, res) => {
   var extendedPart = req.body.extendedPart;
   Course.findOne({code: req.params.courseCode}, (err, course) => {
     if (err) return console.log(err);
     User.findById(req.user._id.toString()).populate("parts.part").populate("courses.course").exec((err, user) => {
       if (err) return console.log(err);
       var targetedPartBundle = method.getPartInArrayById(user.parts, extendedPart.toString());
       targetedPartBundle.expired = false;
       targetedPartBundle.expiredAt += 10000;
       var userCourseBundle = method.getCourseInArrayById(user.courses, course._id.toString());
       if (!method.checkIfCourseShouldExpired(userCourseBundle, user.parts)) {
           var userCourse = method.getCourseInArrayById(user.courses, course._id.toString());
           userCourse.expired = false;
       }
       user.save((err) => {
         if (err) return console.log(err);
         res.redirect("/dashboard");
       });
     });
   });
});

module.exports = router;
