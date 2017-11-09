var express = require("express");
var router = express.Router();
var User = require("./../models/user");
var Course = require("./../models/course");
var Part = require("./../models/part");
var passport = require("passport");
var middleware = require("./../middleware");
var method = require("./../method");

// REGISTER
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
  var newUser = new User(req.body.user);
  newUser.username = req.body.username;
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

router.post("/login", middleware.noDuplicateLogin, middleware.checkRememberMe, passport.authenticate("local",
  {
    successRedirect: "/dashboard",
    failureRedirect: "/courses",
    failureFlash: "Invalid username or password",
    successFlash: "เข้าสู้ระบบเรียบร้อยแล้ว"
  }),(req, res) => {
});

// LOGOUT
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "ออกจากระบบการใช้งานเรียบร้อย!");
  req.session.destroy((err) => {
    if (err) return console.log(err);
    res.redirect("/courses");
  });
});

// DASHBOARD
// more efficient population!!!!!
router.get("/dashboard", middleware.isLoggedIn, async (req, res) => {
  var courses = await Course.find({}).populate("users").populate("expiredUsers").populate("parts").exec();
  var parts = await Part.find({}).populate("users").populate("expiredUsers").exec();
  var getPartInArrayByCourseId = method.getPartInArrayByCourseId;
  res.render("users/dashboard", {courses, parts, getPartInArrayByCourseId});
});

module.exports = router;
