var express = require("express");
var router = express.Router();
var Course = require("./../models/course");
var Part = require("./../models/part");
var Video = require("./../models/video");
var User = require("./../models/user");
var Order = require("./../models/order");
var middleware = require("./../middleware");
var method = require("./../method");
var Promise = require("bluebird");
var checkExpiry = require("./../method/checkExpiry");
var config = require("./../config");
var mongoose = require("mongoose");
var forEach = require('async-foreach').forEach;
var async = require('async');

// ALL COURSES
router.get("/", (req, res) => {
    Course.find({}).sort({order:1}).exec((err, courses) => {
        if (err) {
           return console.log(err);
        }
        res.render("courses/index", {courses});
    });
});

// NEW COURSE
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    res.render("courses/new");
});

// CREATE COURSE
router.post("/", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    if (!req.files.file) {
        req.flash("error", "โปรด upload ไฟล์");
        return res.redirect("/courses/new");
    }
    let file = req.files.file;
    var path = req.body.image + ".jpg";
    var newCourse = {
        title: req.body.title,
        code: method.createCode(req.body.title),
        description: req.body.description,
        video: req.body.video,
        price: req.body.price,
        image: path
    };
    Course.create(newCourse, (err, course) => {
        if (err) {
            return console.log(err);
        }
        file.mv(__dirname + config.imagePath + path, (err) => {
            if (err) {
                return console.log(err);
            }
            res.redirect("/dashboard");
        });
    });
});

// CHECKOUT COURSE
router.get("/checkout", middleware.isLoggedIn, (req, res) => {
    res.render("courses/checkout");
});

router.post("/checkout", middleware.isLoggedIn, (req, res) => {
  if (!req.body.checkedCourses) {
    req.flash("error", "ไม่มีคอร์สในตะกร้าที่จะซื้อได้");
    return res.redirect("/dashboard");
  }
  var checkedCourses = [];
  var user = req.user;
  if (Array.isArray(req.body.checkedCourses)) {
      checkedCourses = req.body.checkedCourses;
  } else {
      checkedCourses.push(req.body.checkedCourses);
  }
  var ctr1 = 0;
  checkedCourses.forEach(async (checkedCourse) => {
    if (method.checkCourseOwnership(user.courses, checkedCourse.toString()) === false) {
      user.courses.push({course: mongoose.Types.ObjectId(checkedCourse)});
      var course = await Course.findById(checkedCourse.toString()).populate("parts").exec();
      var ctr = 0;
      course.users.push(user);
      course.parts.forEach((part) => {
        user.parts.push({
          part: part._id,
          expiredAt: method.getExpiredDate()
        });
        part.users.push(user);
        part.save((err) => {
          if (err) return console.log(err);
          Video.find({part: part.title}, (err, videos) => {
            if (err) return console.log(err);
            var ctr2 = 0;
            videos.forEach((video) => {
              user.videos.push({
                video: video._id
              });
              ctr2++;
              if (ctr2 === videos.length) {
                ctr++;
                if (ctr === course.parts.length) {
                  user.cartCourses = [];
                  course.save((err) => {
                    if (err) return console.log(err);
                    ctr1++;
                    if (ctr1 === checkedCourses.length) {
                      user.save((err) => {
                        if (err) return console.log(err);
                        res.redirect("/dashboard");
                      });
                    }
                  });
                }
              }
            });
          });
        });
      });
    }
  });
});

// EDIT COURSE
router.get("/:courseCode/edit", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) {
            return console.log(err);
        }
        res.render("courses/edit", {course});
    });
});

// SHOW COURSE
router.get("/:courseCode", async (req, res) => {
  var course = await Course.findOne({code: req.params.courseCode});
  if (!course) {
      return res.redirect("/courses");
  }
  var parts = await Part.find({course: course.title}).populate("videos").exec();
  var videos = await Video.find({course: course.title});
  var array = videos.map(function(vid){return vid.duration});
  var averageHours = method.getAverageHours(array);
  var checkPartOwnership = method.checkPartOwnership;
  var checkCourseOwnership = method.checkCourseOwnership;
  var checkCartCourseOwnership = method.checkCartCourseOwnership;
  res.render("courses/show", {course, parts, averageHours, checkPartOwnership, checkCourseOwnership, checkCartCourseOwnership});
});

// UPDATE COURSE
router.put("/:courseCode", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) return console.log(err);
        course.title = req.body.title;
        course.code = method.createCode(req.body.title);
        course.price = req.body.price;
        course.description = req.body.description;
        course.video = req.body.video;
        course.save((err) => {
            if (err) {
                return console.log(err);
            }
        });
        let file = req.files.file;
        if (file) {
            var path = course.image;
            file.mv(__dirname + config.imagePath + path, (err) => {
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

// LEARN COURSE
router.get("/:courseCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, async (req, res) => {
  var course = await Course.findOne({code: req.params.courseCode}).populate({path: "parts", select: "code title videos"}).exec();
  var parts = await Video.populate(course.parts, {path: "videos"});
  var checkPartOwnership = method.checkPartOwnership;
  var isFinished = method.isFinished;
  var createCode = method.createCode;
  if (req.user.isAdmin) {
      res.render("courses/learn", {course, parts, checkPartOwnership, isFinished, createCode});
  } else {
      var getPartInUserArrayByCourseTitle = method.getPartInUserArrayByCourseTitle;
      res.render("courses/learn", {course, getPartInUserArrayByCourseTitle, checkPartOwnership, isFinished, createCode});
  }
});

//BUY
router.get("/:courseCode/buy", middleware.isLoggedIn, middleware.canBuy, (req, res) => {
  Course.findOne({code: req.params.courseCode}).populate({path: "parts", select: "title"}).exec((err, course) => {
     if (err) return console.log(err);
     var parts = method.getBuyableParts(course.parts, req.user.parts);
     res.render("courses/buy", {course, parts});
  });
});

router.post("/:courseCode/buy", middleware.isLoggedIn, middleware.canBuy, async (req, res) => {
  if (!req.body.selectedParts) {
    req.flash("error", "โปรดเลือกคอร์สที่ต้องการจะซื้อ");
    return res.redirect(`/courses/${req.params.courseCode}/buy`);
  }
  var insertedParts = [];
  var selectedParts = req.body.selectedParts;
  if (Array.isArray(selectedParts)) {
      insertedParts = selectedParts;
  } else {
      insertedParts.push(selectedParts);
  }
  var course = await Course.findOne({code: req.params.courseCode});
  var user = req.user;
  var ctr = 0;
  if (!method.checkCourseOwnership(user.courses, course._id.toString())) {
      user.courses.push({course});
  }
  async.eachSeries(insertedParts, (insertedPart, cb1) => {
    async.waterfall([
      function(callback) {
        Part.findById(insertedPart.toString(), (err, part) => {
          if(err) return console.log(err);
          callback(null, part);
        });
      },
      function(part, callback) {
        console.log(part);
        var newOrder = {
          course, part, user
        }
        Order.create(newOrder, (err, order) => {
          if(err) return console.log(err);
          user.orders.push(order);
          part.users.push(user);
          callback(null, part);
        });
      },
      function(part, callback) {
        part.save((err) => {
          if(err) return console.log(err);
          callback(null, part);
        });
      },
      function(part, callback) {
        var newPart = {
          part: part._id,
          expiredAt: method.getExpiredDate()
        };
        user.parts.push(newPart);
        course.users.push(user);
        user.cartCourses = user.cartCourses.filter(function(cartCourse){return cartCourse.toString() !== course._id.toString()});
        callback(null, part);
      },
      function(part, callback) {
        var videos = part.videos;
        async.each(videos, (video, cb2) => {
          user.videos.push({video});
          cb2();
        }, (err) => {
          callback(err);
        });
      }
    ], (err) => {
      cb1(err);
    });
  }, function(err) {
    if(err) return console.log(err);
    user.save((err, data) => {
      if(err) return console.log(err);
      course.save((err, data) => {
          if (err) return console.log(err);
      });
      console.log(`${user.username} just bought ${course.title} for ${course.price} Baht`, new Date().toDateString());
      res.redirect("/dashboard");
    });
  });
});

// EXTEND
router.get("/:courseCode/extend", middleware.isLoggedIn, middleware.canExtend, (req, res) => {
    Course.findOne({code: req.params.courseCode}).populate({path: "parts", select: "title"}).exec((err, course) => {
        if (err) return console.log(err);
        var parts = method.getExtendableParts(course.parts, req.user.parts);
        res.render("courses/extend", {course, parts});
    });
});

router.post("/:courseCode/extend", middleware.isLoggedIn, middleware.canExtend, (req, res) => {
    var selectedParts = [];
    if (Array.isArray(req.body.selectedParts)) {
        selectedParts = req.body.selectedParts;
    } else {
        selectedParts.push(req.body.selectedParts);
    }
    var ctr = 0;
    Course.findOne({code: req.params.courseCode}, (err, course) => {
      if (err) return console.log(err);
      var user = req.user;
      selectedParts.forEach(async (selectedPart) => {
        var targetedPartBundle = method.getPartInArrayById(user.parts, selectedPart.toString());
        targetedPartBundle.expired = false;
        targetedPartBundle.checked = false;
        targetedPartBundle.expiredAt = method.getExpiredDate();
        var part = await Part.findById(selectedPart.toString());
        var newOrder = {
          course, part, user, type: "extend"
        };
        var order = await Order.create(newOrder);
        user.orders.push(order);
        part.expiredUsers = part.expiredUsers.filter(function(expiredUser) { return expiredUser.toString() !== user._id.toString()});
        part.users.push(user);
        part.save((err) => {
          if (err) return console.log(err);
          ctr++;
          if (ctr === selectedParts.length) {
            var userCourseBundle = method.getCourseInArrayById(user.courses, course._id.toString());
            if (!method.checkIfCourseShouldExpired(userCourseBundle, user.parts)) {
                var userCourse = method.getCourseInArrayById(user.courses, course._id.toString());
                userCourse.expired = false;
                user.save((err) => {
                   if (err) return console.log(err);
                });
                course.expiredUsers = course.expiredUsers.filter(function(courseExpiredUser) {return courseExpiredUser.toString() !== user._id.toString()} );
                course.users.push(user);
                course.save((err) => {
                  if (err) return console.log(err);
                  res.redirect("/dashboard");
                });
            } else {
                user.save((err) => {
                   if (err) return console.log(err);
                   res.redirect("/dashboard");
                });
            }
          }
        });
      });
    });
});

// Add to cart ********
router.post("/:courseCode/cart", middleware.isLoggedIn, middleware.canAdd, (req, res) => {
  var user = req.user;
    Course.findOne({code: req.params.courseCode}, (err, course) => {
       if (err) return console.log(err);
       if(method.checkCourseOwnership(user.courses, course._id.toString()) === false && method.checkCartCourseOwnership(user.cartCourses, course._id.toString()) === false) {
         user.cartCourses.push(course);
         user.save((err, data) => {
             if (err) return console.log(err);
             res.redirect("/dashboard");
         });
       } else {
         res.redirect("/courses");
       }
    });
});

module.exports = router;
