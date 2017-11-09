var express = require("express");
var router = express.Router({mergeParams: true});
var Course = require("./../models/course");
var Part = require("./../models/part");
var Video = require("./../models/video");
var Order = require("./../models/order");
var User = require("./../models/user");
var middleware = require("./../middleware");
var method = require("./../method");
var fs = require("fs");
var config = require("./../config");
var async = require("async");
var path = require("path");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: __dirname + config.imagePath,
  filename: function (req, file, cb) {
    var filename = req.body.fileName? req.body.fileName : method.createCode(req.body.title);
    filename += path.extname(file.originalname);
    cb(null, filename);
  }
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2mb, in bytes
  }
});

// LEARN PART
router.get("/:partCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, middleware.canLearn, (req, res) => {
  const render = async () => {
    var course = await Course.findOne({code: req.params.courseCode});
    var part = await Part.findOne({code: req.params.partCode});
    var videos = await Video.find({ part: part._id }).populate("resources").exec();
    res.render("parts/index", {part, course, videos});
  }
  render();
});

// NEW PART
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
    var courseCode = req.params.courseCode;
    var removeExtension = method.removeExtension;
    fs.readdir(__dirname + config.imagePath, (err, imgPaths) => {
      res.render("parts/new", {courseCode, imgPaths, removeExtension});
    });
});

// CREATE PART **fix
router.post("/", middleware.isLoggedIn, middleware.isAdmin, upload.single("file"), async (req, res) => {
  var path;
  if (!req.file && !req.body.chosenImage) {
    req.flash("error", "โปรด upload ไฟล์ หรือเลือกภาพที่ต้องการ");
    return res.redirect(`/courses/${req.params.courseCode}/parts/new`);
  } else if (req.file) {
    path = req.file.filename;
  } else {
    path = req.body.chosenImage;
  }
  var course = await Course.findOne({code: req.params.courseCode});
  var newPart = {
    title: req.body.title,
    code: method.createCode(req.body.title),
    description: req.body.description,
    price: req.body.price,
    image: path,
    course: course._id
  };
  var part = await Part.create(newPart);
  course.parts.push(part);
  course.save((err) => {
    if (err) return console.log(err);
    res.redirect(`/courses/${course.code}/learn`);
  });
});

// EDIT PART
router.get("/:partCode/edit", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  var removeExtension = method.removeExtension;
  Course.findOne({code: req.params.courseCode}, (err, course) => {
    if (err) return console.log(err);
    Part.findOne({code: req.params.partCode}, (err, part) => {
      if (err) return console.log(err);
      fs.readdir(__dirname + config.imagePath, (err, imgPaths) => {
        if (err) return console.log(err);
        res.render("parts/edit", {part, course, imgPaths, removeExtension});
      });
    });
  });
});

// UPDATE PART
router.put("/:partCode", middleware.isLoggedIn, middleware.isAdmin, upload.single("file"), async (req, res) => {
  var part = await Part.findOne({code: req.params.partCode});
  var course = await Course.findOne({code: req.params.courseCode});
  var oldPartId = part._id.toString();
  var changedTitle = Boolean(part.title !== req.body.title);
  var path;
  if (req.file) {
    path = req.file.filename;
  } else if (req.body.chosenImage) {
    path = req.body.chosenImage;
  } else {
    path = part.image;
  }
  part.title = req.body.title;
  part.code = method.createCode(req.body.title);
  part.price = req.body.price;
  part.description = req.body.description;
  part.image = path;
  part.save((err) => {
    if (err) return console.log(err);
  });
  async.waterfall([
    function(callback) {
      if (!changedTitle) return callback(null, null);
      Video.find({part: oldPartId}, (err, videos) => {
        if (err) return console.log(err);
        callback(null, videos);
      });
    },
    function(videos, callback) {
      if (!changedTitle) return callback();
      async.eachSeries(videos, (vid, cb1) => {
        vid.part = req.body.title;
        vid.save((err) => {
          if (err) return console.log(err);
          cb1();
        });
      }, (err) => {
        callback();
      });
    }
  ], (err) => {
    if (err) return console.log(err);
    res.redirect("/dashboard");
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

router.post("/:partCode/extend", middleware.isLoggedIn, middleware.canExtend, async (req, res) => {
   var extendedPart = req.body.extendedPart;
   var course = await Course.findOne({code: req.params.courseCode});
   var user = req.user;
   var targetedPartBundle = method.getPartInArrayById(user.parts, extendedPart.toString());
   targetedPartBundle.expired = false;
   targetedPartBundle.checked = false;
   targetedPartBundle.expiredAt = method.getExpiredDate();
   var part = await Part.findById(targetedPartBundle.part._id.toString());
   var newOrder = {
     course, part, user, type: "extend"
   };
   var order = await Order.create(newOrder);
   user.orders.push(order);
   part.expiredUsers = part.expiredUsers.filter(function(expiredUser) { return expiredUser.toString() !== user._id.toString()});
   part.users.push(user);
   part.save((err) => {
     if (err) return console.log(err);
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

module.exports = router;
