var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var app = express();
var Course = require("./models/course");
var User = require("./models/user");
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
    res.locals.user = req.user;
    next();
});

// ======== ROUTES ========
app.use("/", indexRoutes);
app.use("/users", userRoutes);
app.use("/", courseRoutes);
app.use("/:courseCode", partRoutes);
app.use("/:courseCode/:partCode", videoRoutes);
app.use("/", resourceRoutes);
app.use("/:courseCode", questionRoutes);
app.use("/:courseCode/:partCode/:vidCode/:questionCode", answerRoutes);
// ========================

// AGENDA
// Implement Questions and Answers to all route possible
// Done routes: ---->

// Invoice model + Credit card validation

// Course model => expired
// User manage =>

// Add res to Course model

// video player

// flash masseges

// Checkout Cart ******

// extend routes

// Extend Now instead of buy now

schedule.scheduleJob('0,30 * * * * *', function(){
    checkExpiry();
});

app.get("/courses/checkout", middleware.isLoggedIn, (req, res) => {
    User.findById(req.user._id).populate("cartCourses").exec((err, user) => {
        if (err) {
            return console.log(err);
        }
        var cartCourses = user.cartCourses;
        res.render("courses/checkout", {cartCourses});
    });
});

// fix minor bugs ******
app.post("/courses/checkout", middleware.isLoggedIn, (req, res) => {
    User.findById(req.user._id, (err, user) => {
        if (err) {
            return console.log(err);
        }
        if (Array.isArray(req.body.buyCourses)) {
            req.body.buyCourses.forEach((buyCourse) => {
                user.courses.push(mongoose.Types.ObjectId(buyCourse));
                Course.findByIdAndUpdate(buyCourse,
                {
                    $push: {user}
                }, (err, course) => {
                    if (err) {
                        return console.log(err);
                    }
                });
            });
        } else {
            user.courses.push(mongoose.Types.ObjectId(req.body.buyCourses));
            Course.findByIdAndUpdate(req.body.buyCourses,
            {
                $push: {user}
            }, (err, course) => {
                if (err) {
                    return console.log(err);
                }
            });
        }
        user.cartCourses = [];
        user.save((err, data) => {
            if (err) {
                return console.log(err);
            }

        });
        res.redirect("/dashboard");
    });
});

// Add to cart ********

app.post("/courses/:id/cart", middleware.isLoggedIn, (req, res) => {
    Course.findById(req.params.id, (err, course) => {
       if (err) {
           return console.log(err);
       }
       User.findById(req.user._id, (err, user) => {
          if (err) {
              return console.log(err);
          } else {
              if(user.courses.indexOf(course._id) === -1 && user.cartCourses.indexOf(course._id) === -1) {
                    user.cartCourses.push(course);
                    user.save((err, data) => {
                        if (err) {
                             return console.log(err);
                        }
                    });
              }
              res.redirect("/dashboard");
          }
       });
    });
});

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

app.listen(3000, () => {
   console.log("Server started");
});
