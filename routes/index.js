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
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
           req.flash("success", `คุณ ${user.username} ได้ทำการลงทะเบียนเรียบร้อยแล้ว`);
           res.redirect("/dashboard");
        });
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
  req.flash("success", "ออกจากระบบการใช้งานเรียบร้อย!");
  res.redirect("/courses");
});

// DASHBOARD
// more efficient population!!!!!
router.get("/dashboard", middleware.isLoggedIn, (req, res) => {
    var findUser = User.findById(req.user._id).populate({path: "courses.course", select: "code title"}).populate({path: "parts.part", select: "title course"}).populate("cartCourses").exec();
    var findCourses = Course.find({}).populate("users").populate("expiredUsers").populate("parts").exec();
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
