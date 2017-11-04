var express = require("express");
var router = express.Router();
var Course = require("./../models/course");
var Part = require("./../models/part");
var Video = require("./../models/video");
var User = require("./../models/user");
var Order = require("./../models/order");
var middleware = require("./../middleware");
var method = require("./../method");
var checkExpiry = require("./../method/checkExpiry");
var config = require("./../config");
var mongoose = require("mongoose");
var forEach = require('async-foreach').forEach;
var async = require('async');
var fs = require("fs");

// ALL COURSES
router.get("/", (req, res) => {
  Course.find({}).sort({order:1}).exec((err, courses) => {
    if (err) return console.log(err);
    res.render("courses/index", {courses});
  });
});

// NEW COURSE
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  var removeExtension = method.removeExtension
  fs.readdir(__dirname + config.imagePath, (err, imgPaths) => {
    res.render("courses/new", { imgPaths, removeExtension });
  });
});

// CREATE COURSE
router.post("/", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  var fileUploaded = false;
  var path;
  if (!req.files.file && !req.body.chosenImage) {
    req.flash("error", "โปรด upload ไฟล์ หรือเลือกภาพที่ต้องการ");
    return res.redirect(`/courses/new`);
  } else if (req.files.file) {
    fileUploaded = true;
    path = req.body.fileName? req.body.fileName + ".jpg" : method.createCode(req.body.title) + ".jpg";
  } else {
    fileUploaded = false;
    path = req.body.chosenImage;
  }
  let file = req.files.file;
  async.waterfall([
    function(callback) {
      var newCourse = {
          title: req.body.title,
          code: method.createCode(req.body.title),
          description: req.body.description,
          video: req.body.video,
          price: req.body.price,
          image: path
      };
      Course.create(newCourse, (err, course) => {
        if (err) return console.log(err);
        callback();
      });
    },
    function(callback) {
      if(!file) return callback();
      file.mv(__dirname + config.imagePath + path, (err) => {
        if (err) return console.log(err);
        callback();
      });
    }
  ], (err) => {
    res.redirect("/dashboard");
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
  var user = req.user;
  var checkedCourses = method.createArray(req.body.checkedCourses);
  async.eachSeries(checkedCourses, (checkedCourse, cb1) => {
    if (method.checkCourseOwnership(user.courses, checkedCourse.toString()) === false) {
      user.courses.push({course: mongoose.Types.ObjectId(checkedCourse)});
      async.waterfall([
        function(callback) {
          Course.findById(checkedCourse.toString()).populate("parts").exec((err, course) => {
            if (err) return console.log(err);
            course.users.push(user);
            callback(null, course);
          });
        },
        function(course, callback) {
          course.save((err) => {
            if (err) return console.log(err);
            callback(null, course);
          });
        },
        function(course, callback) {
          async.eachSeries(course.parts, (part, cb2) => {
            user.parts.push({
              part: part._id,
              expiredAt: method.getExpiredDate()
            });
            part.users.push(user);
            async.waterfall([
              function(callback) {
                part.save((err) => {
                  if (err) return console.log(err);
                  callback(null, part);
                });
              },
              function(part, callback) {
                Video.find({part: part.title}, (err, videos) => {
                  if (err) return console.log(err);
                  callback(null, videos);
                });
              },
              function(videos, callback) {
                async.forEach(videos, (video, cb3) => {
                  user.videos.push({
                    video: video._id
                  });
                  cb3();
                }, (err) => {
                  console.log(err);
                  callback();
                });
              }
            ], (err) => {
              console.log(err);
              cb2();
            });
          }, (err) => {
            console.log(err);
            callback();
          });
        }
      ], (err) => {
        console.log(err);
        cb1();
      });
    }
  }, (err) => {
    user.cartCourses = [];
    user.save((err) => {
      if (err) return console.log(err);
      res.redirect("/dashboard");
    });
  });
});

// EDIT COURSE
router.get("/:courseCode/edit", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  var removeExtension = method.removeExtension
  Course.findOne({code: req.params.courseCode}, (err, course) => {
    if (err) return console.log(err);
    if (!course) return res.redirect("/courses");
    fs.readdir(__dirname + config.imagePath, (err, imgPaths) => {
      if (err) return console.log(err);
      res.render("courses/edit", {course, imgPaths, removeExtension});
    });
  });
});

// SHOW COURSE
router.get("/:courseCode", async (req, res) => {
  try {
    var course = await Course.findOne({code: req.params.courseCode});
    if (!course) return res.redirect("/courses");
  } catch(err) {
    return console.log(err);
  }
  try {
    var parts = await Part.find({course: course.title}).populate("videos").exec();
  } catch(err) {
    return console.log(err);
  }
  try {
    var videos = await Video.find({course: course.title});
  } catch(err) {
    return console.log(err);
  }
  var array = videos.map(function(vid){return vid.duration});
  var averageHours = method.getAverageHours(array);
  var checkPartOwnership = method.checkPartOwnership;
  var checkCourseOwnership = method.checkCourseOwnership;
  var checkCartCourseOwnership = method.checkCartCourseOwnership;
  res.render("courses/show", {course, parts, averageHours, checkPartOwnership, checkCourseOwnership, checkCartCourseOwnership});
});

// UPDATE COURSE
router.put("/:courseCode", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
  try {
    var course = await Course.findOne({code: req.params.courseCode}).populate("parts").exec();
    if (!course) return res.redirect("/courses");
  } catch(err) {
    return console.log(err);
  }
  try {
    var parts = await Video.populate(course.parts, {path: "videos"});
  } catch(err) {
    return console.log(err);
  }
  var changedTitle = (course.title !== req.body.title);
  var photoStatus;
  var path;
  if (!req.files.file && !req.body.chosenImage) {
    photoStatus = "none";
  } else if (req.files.file) {
    photoStatus = "uploaded";
    path = req.body.fileName? req.body.fileName + ".jpg" : method.createCode(req.body.title) + ".jpg";
  } else {
    photoStatus = "chosen"
    path = req.body.chosenImage;
  }
  course.title = req.body.title;
  course.code = method.createCode(req.body.title);
  course.price = req.body.price;
  course.description = req.body.description;
  course.video = req.body.video;
  let file = req.files.file;
  async.waterfall([
    // change Title of Part and videos
    function(callback) {
      if (!changedTitle) return callback();
      async.eachSeries(parts, (part, cb1) => {
        part.course = req.body.title;
        async.eachSeries(part.videos, (video, cb2) => {
          video.course = req.body.title;
          video.save((err) => {
            if (err) return console.log(err);
            cb2();
          });
        }, (err) => {
          part.save((err) => {
            console.log(err);
            cb1();
          });
        });
      }, (err) => {
        callback();
      });
    },
    // change Title of Order
    function(callback) {
      if (!changedTitle) return callback(null, null);
      Order.find({course: course._id.toString()}, (err, orders) => {
        if (err) return console.log(err);
        callback(null, orders);
      });
    },
    function(orders, callback) {
      if (!changedTitle) return callback();
      async.eachSeries(orders, (order, cb3) => {
        order.course = course._id;
        order.save((err) => {
          if (err) return console.log(err);
          cb3();
        });
      }, (err) => {
        callback();
      });
    },
    // deal with file
    function(callback) {
      if (photoStatus !== "uploaded") return callback();
      file.mv(__dirname + config.imagePath + path, (err) => {
        if (err) return console.log(err);
        callback();
      });
    },
    function(callback) {
      if (photoStatus === "none") return callback();
      course.image = path;
      callback();
    }
  ], (err) => {
    course.save((err) => {
      if (err) return console.log(err);
      res.redirect("/dashboard");
    });
  });
});

// LEARN COURSE
router.get("/:courseCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, async (req, res) => {
  try {
    var course = await Course.findOne({code: req.params.courseCode}).populate({path: "parts", select: "code title videos"}).exec();
    if (!course) return res.redirect("/courses");
  } catch(err) {
    return console.log(err);
  }
  try {
    var parts = await Video.populate(course.parts, {path: "videos"});
  } catch(err) {
    return console.log(err);
  }
  var checkPartOwnership = method.checkPartOwnership;
  var isFinished = method.isFinished;
  var createCode = method.createCode;
  if (req.user.isAdmin) {
    res.render("courses/learn", {course, parts, checkPartOwnership, isFinished, createCode});
  } else {
    var numFinishedVideos = method.getCourseInArrayById(req.user.courses, course._id.toString()).numFinishedVideos;
    var getPartInUserArrayByCourseTitle = method.getPartInUserArrayByCourseTitle;
    res.render("courses/learn", {course, getPartInUserArrayByCourseTitle,
      checkPartOwnership, isFinished, createCode, numFinishedVideos});
  }
});

//BUY
router.get("/:courseCode/buy", middleware.isLoggedIn, middleware.canBuy, (req, res) => {
  Course.findOne({code: req.params.courseCode}).populate({path: "parts", select: "title"}).exec((err, course) => {
    if (err) return console.log(err);
    if (!course) return res.redirect("/courses");
    var parts = method.getBuyableParts(course.parts, req.user.parts);
    res.render("courses/buy", {course, parts});
  });
});

router.post("/:courseCode/buy", middleware.isLoggedIn, middleware.canBuy, async (req, res) => {
  if (!req.body.selectedParts) {
    req.flash("error", "โปรดเลือกคอร์สที่ต้องการจะซื้อ");
    return res.redirect(`/courses/${req.params.courseCode}/buy`);
  }
  var insertedParts = method.createArray(req.body.selectedParts);
  try {
    var course = await Course.findOne({code: req.params.courseCode});
    if (!course) return res.redirect("/courses");
  } catch(err) {
    return console.log(err);
  }
  var user = req.user;
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
    course.users.push(user);
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
        if (!course) return res.redirect("/courses");
        var parts = method.getExtendableParts(course.parts, req.user.parts);
        res.render("courses/extend", {course, parts});
    });
});

router.post("/:courseCode/extend", middleware.isLoggedIn, middleware.canExtend, async (req, res) => {
  var selectedParts = method.createArray(req.body.selectedParts);
  var user = req.user;
  try {
    var course = await Course.findOne({code: req.params.courseCode});
    if (!course) return res.redirect("/courses");
  } catch(err) {
    return console.log(err);
  }
  async.eachSeries(selectedParts, (selectedPart, cb1) => {
    async.waterfall([
      function(callback) {
        var targetedPartBundle = method.getPartInArrayById(user.parts, selectedPart.toString());
        targetedPartBundle.expired = false;
        targetedPartBundle.checked = false;
        targetedPartBundle.expiredAt = method.getExpiredDate();
        Part.findById(selectedPart.toString(), (err, part) => {
          if (err) return console.log(err);
          callback(null, part);
        });
      },
      function(part, callback) {
        var newOrder = {
          course, part, user, type: "extend"
        };
        Order.create(newOrder, (err, order) => {
          if (err) return console.log(err);
          user.orders.push(order);
          part.expiredUsers = part.expiredUsers.filter(function(expiredUser) { return expiredUser.toString() !== user._id.toString()});
          part.users.push(user);
          callback(null, part);
        });
      },
      function(part, callback) {
        part.save((err) => {
          if (err) return console.log(err);
          callback();
        });
      },
    ], (err) => {
      cb1();
    });
  }, (err) => {
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
  });
});

// Add to cart ********
router.post("/:courseCode/cart", middleware.isLoggedIn, middleware.canAdd, (req, res) => {
  var user = req.user;
  Course.findOne({code: req.params.courseCode}, (err, course) => {
    if (err) return console.log(err);
    if (!course) return res.redirect("/courses");
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
