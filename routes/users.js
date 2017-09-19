var express = require("express");
var router = express.Router();
var User = require("./../models/user");
var Course = require("./../models/course");
var mongoose = require("mongoose");
var middleware = require("./../middleware");
var method = require("./../method");

// USERS GET
router.get("/", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
   User.find({isAdmin: false}).populate({path: "courses.course", select:"title"}).exec((err, users) => {
       if (err) {
           console.log(err);
           return res.render("register");
       }
       res.render("users/index", {users});
   });
});

// USERS NEW
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    res.render("users/new");
});

// USERS CREATE
router.post("/", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            return console.log(err);
        } 
        res.redirect("/users"); 
    }); 
});

// USERS EDIT
router.get("/:id/courses/edit", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    User.findById(req.params.id).populate("courses.course").populate("parts.part").exec((err, user) => {
        if (err) return console.log(err);
        Course.find({}).populate("parts").exec((err, courses) => {
            if (err) return console.log(err);
            res.render("users/edit", {user, courses, getBuyableParts: method.getBuyableParts, getPartInArrayByCourseTitle: method.getPartInArrayByCourseTitle});
        });
    });
});

// USERS UPDATE
router.put("/:id/:courseCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    if(!req.body.addParts) return res.redirect("/users");
    User.findById(req.params.id).populate("parts.part").exec((err, user) => {
        if (err) return console.log(err);
        Course.findOne({code: req.params.courseCode}, (err, course) => {
            if (err) return console.log(err);
            var addParts = [];
            if (!Array.isArray(req.body.addParts)) {
                addParts.push(req.body.addParts);
            } else {
                addParts = req.body.addParts;
            }
            if (!method.checkCourseOwnership(user.courses, course._id.toString())) {
                user.courses.push({course});
                course.users.push(user);
            }
            var ctr = 0;
            addParts.forEach((addPart) => {
                if (method.checkPartOwnership(user.parts, addPart.toString()) !== true &&
                    method.checkPartOwnership(user.parts, addPart.toString()) !== "expired") {
                    user.parts.push({part: mongoose.Types.ObjectId(addPart)});
                }
                ctr++;
                if (ctr === addParts.length) {
                    user.save((err) => {
                        if (err) return console.log(err);
                        course.save((err) => {
                            if (err) return console.log(err);
                            res.redirect("/users");
                        });
                    });
                }
            });
        });
    });
});

router.delete("/:id/:courseCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    if(!req.body.removeParts) return res.redirect("/users");
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) return console.log(err);
        User.findById(req.params.id).populate("parts.part").exec((err, user) => {
            if (err) return console.log(err);
            var removeParts = [];
            if (!Array.isArray(req.body.removeParts)) {
                removeParts.push(req.body.removeParts);
            } else {
                removeParts = req.body.removeParts;
            }
            var ctr = 0;
            removeParts.forEach((removePart) => {
                if (method.checkPartOwnership(user.parts, removePart.toString())) {
                    user.parts = user.parts.filter(function(partBundle) { return partBundle.part._id.toString() !== removePart.toString() });
                }
                ctr++;
                if (ctr === removeParts.length) {
                    if (!method.checkIfPartsOfCourseNameExisted(user.parts, course.title)) {
                        user.courses = user.courses.filter(function(courseBundle) { return courseBundle.course.toString() !== course._id.toString() });
                        course.users = course.users.filter(function(courseUser) { return courseUser.toString() !== user._id.toString() });
                        user.save((err) => {
                            if (err) return console.log(err);
                            course.save((err) => {
                                if (err) return console.log(err);
                                res.redirect("/users");
                            });
                        });
                    } else {
                        user.save((err) => {
                            if (err) return console.log(err);
                            res.redirect("/users");
                        });
                    }
                }
            });
        });
    });
});

module.exports = router;