var express = require("express");
var router = express.Router();
var User = require("./../models/user");
var Course = require("./../models/course");
var passport = require("passport");
var middleware = require("./../middleware");
var Promise = require("bluebird");
var method = require("./../method");

// REGISTER
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password).then((user) => {
        passport.authenticate("local")(req, res, () => {
           res.redirect("/dashboard"); 
        });
    }).catch((err) => {
        if (err) return res.register("/register");
    });
});

// LOGIN
router.get("/login", middleware.noDuplicateLogin, (req, res) => {
   res.render("login"); 
});

router.post("/login", middleware.noDuplicateLogin, passport.authenticate("local", 
    {
        successRedirect: "/dashboard",
        failureRedirect: "/courses"
    }),(req, res) => {
});

// LOGOUT
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/courses");
});

// DASHBOARD
// more efficient population!!!!!
router.get("/dashboard", middleware.isLoggedIn, (req, res) => {
    var findUser = User.findById(req.user._id).populate({path: "courses.course", select: "code title"}).populate({path: "parts.part", select: "title course"}).populate("cartCourses").exec();
    var findCourses = Course.find({}).populate("users").populate("parts").exec();
    return Promise.join(findUser, findCourses, (user, courses) => {
        var userCourses = user.courses;
        var userParts = user.parts;
        var cartCourses = user.cartCourses;
        var getPartInArrayByCourseTitle = method.getPartInArrayByCourseTitle;
        res.render("users/dashboard", {userCourses, userParts, courses, cartCourses, getPartInArrayByCourseTitle}); 
    }).catch((err) => {
        console.log(err);
    });
});

module.exports = router;