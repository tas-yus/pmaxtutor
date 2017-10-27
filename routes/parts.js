var express = require("express");
var router = express.Router({mergeParams: true});
var Course = require("./../models/course");
var Part = require("./../models/part");
var Video = require("./../models/video");
var Order = require("./../models/order");
var User = require("./../models/user");
var middleware = require("./../middleware");
var method = require("./../method");

// LEARN PART
router.get("/:partCode/learn", middleware.isLoggedIn, middleware.canAccessLearn, middleware.canLearn, (req, res) => {
  const render = async () => {
    var course = await Course.findOne({code: req.params.courseCode});
    var part = await Part.findOne({code: req.params.partCode});
    var videos = await Video.find({ part: part.title }).populate("resources").exec();
    res.render("parts/index", {part, course, videos});
  }
  render();
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
  file.mv(__dirname + '/../public/assets/images/' + path).then( async () => {
    var course = await Course.findOne({code: req.params.courseCode});
    var newPart = {
      title: req.body.title,
      code: method.createCode(req.body.title),
      description: req.body.description,
      price: req.body.price,
      image: path,
      course: course.title
    };
    var part = await Part.create(newPart);
    course.parts.push(part);
    course.save((err) => {
      if (err) return console.log(err);
      res.redirect(`/courses/${course.code}/parts/${part.code}/videos/new`);
    });
  }).catch((err) => {
    console.log(err);
  });
});

// EDIT PART
router.get("/:partCode/edit", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  Course.findOne({code: req.params.courseCode}, (err, course) => {
    if (err) return console.log(err);
    Part.findOne({code: req.params.partCode}, (err, part) => {
      if (err) return console.log(err);
      res.render("parts/edit", {part, course});
    });
  });
});

// UPDATE PART
router.put("/:partCode", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
  var part = await Part.findOne({code: req.params.partCode});
  var oldPartId = part._id.toString();
  var oldPart = part.title;
  var changedTitle = Boolean(part.title !== req.body.title);
  part.title = req.body.title;
  part.code = method.createCode(req.body.title);
  part.price = req.body.price;
  part.description = req.body.description;
  var course = await Course.findOne({code: req.params.courseCode});
  course.parts = course.parts.filter(function(part) { return part.toString() !== oldPartId });
  course.parts.push(part);
  course.save((err) => {
    if (err) {
        return console.log(err);
    }
  });
  if(changedTitle) {
    var videos = await Video.find({part: oldPart});
    videos.forEach((vid) => {
      vid.part = req.body.title;
      vid.save((err) => {
          if (err) return console.log(err);
      });
    });
  }
  part.save((err) => {
    if (err) return console.log(err);
  });
  let file = req.files.file;
  if (file) {
    var path = part.image;
    file.mv(__dirname + '/../public/assets/images/' + path, (err) => {
      if (err) return console.log(err);
      res.redirect("/dashboard");
    });
  } else {
    res.redirect("/dashboard");
  }
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
