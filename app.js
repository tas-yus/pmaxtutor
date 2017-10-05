var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var localStrategy = require("passport-local");
var app = express();
var Course = require("./models/course");
var User = require("./models/user");
var Part = require("./models/part");
var Video = require("./models/video");
var middleware = require("./middleware");
var seedDB = require("./seed");
var methodOverride = require("method-override");
var fileUpload = require('express-fileupload');
var Promise = require("bluebird");
var schedule = require('node-schedule');
var checkExpiry = require("./method/checkExpiry");

// ======== ROUTES ========
var indexRoutes = require("./routes/index");
var courseRoutes = require("./routes/courses");
var userRoutes = require("./routes/users");
var partRoutes = require("./routes/parts");
var videoRoutes = require("./routes/videos");
var resourceRoutes = require("./routes/resources");
var questionRoutes = require("./routes/questions");
var answerRoutes = require("./routes/answers");
// ========================

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost:27017/pmaxapp", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(fileUpload());
app.use(flash());
seedDB();

app.use(require("express-session")({
    secret: "Hello World Hope You're Listening",
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    var user = req.user;
    Course.populate(user, {path: "courses.course"}, (err, user) => {
      if (err) return console.log(err);
      Course.populate(user, {path: "cartCourses"}, (err, user) => {
        if (err) return console.log(err);
        Part.populate(user, {path: "parts.part"}, (err, user) => {
          if (err) return console.log(err);
          Video.populate(user, {path: "videos.video"}, (err, user) => {
            if (err) return console.log(err);
            Video.populate(user, {path: "mostRecentVideo", select: "code part title"}, (err, user) => {
              res.locals.user = user;
              res.locals.error = req.flash("error");
              res.locals.success = req.flash("success");
              next();
            });
          });
        });
      });
    });
});

// ======== ROUTES ========
app.use("/", indexRoutes);
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/courses/:courseCode/parts", partRoutes);
app.use("/courses/:courseCode/parts/:partCode/videos", videoRoutes);
app.use("/courses/:courseCode/parts/:partCode/videos/:vidCode/resources", resourceRoutes);
app.use("/courses/:courseCode", questionRoutes);
app.use("/courses/:courseCode/parts/:partCode/videos/:vidCode/questions/:questionCode/answers", answerRoutes);
// ========================

// AGENDA

// when delete course all resources should be deleted and all parts and all vids associated with it should be dispatched!
// Invoice model (confirmation) + Credit card validation
// choose from old file? when upload
// Notifications
// video player
// Checkout Cart (add user to parts)
// logging
// fix affix onw SHOW PAGE
// Sign Up - includes other info + in the database
// Add video model to course
// When a new video is added, all user enrolled should own those videos as well + numVids should increase;

schedule.scheduleJob('0 * * * * *', function(){
    checkExpiry();
});

app.get("/test", (req, res) => {
    res.render("videos/test");
});

app.listen(3000, () => {
   console.log("Server started");
});
