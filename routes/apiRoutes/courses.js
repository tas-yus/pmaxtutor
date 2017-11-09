var express = require("express");
var router = express.Router();
var Course = require("./../../models/course");
var Part = require("./../../models/part");
var Video = require("./../../models/video");
var User = require("./../../models/user");
var Order = require("./../../models/order");
var middleware = require("./../../middleware");
var method = require("./../../method");
var checkExpiry = require("./../../method/checkExpiry");
var config = require("./../../config");
var mongoose = require("mongoose");
var forEach = require('async-foreach').forEach;
var async = require('async');
var fs = require("fs");
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

function fetchCourse(id) {
  return new Promise((resolve, reject) => {
    Course.findById(id).populate({
      path: "parts",
      model: "Part",
      populate: {
        path: "videos",
        model: "Video"
      }
    }).exec().then((course) => {
      resolve(course);
    }).catch((err) => {
      reject(err);
    });
  });
};

// ALL COURSES
router.get("/", (req, res) => {
  Course.find({}).sort({order:1}).exec((err, courses) => {
    if (err) {
      return res.status(400).send("There's an error with the database");
    } else {
      res.status(200).json(courses);
    }
  });
});

router.get("/:id", (req, res) => {
  fetchCourse(req.params.id).then((course) => {
    if (!course) {
      res.status(400).send("Cannot find a course with particular id");
    } else {
      res.status(200).send(course);
    }
  }).catch((err) => {
    res.status(400).send("Something is wrong with the database");
  });
});

// CREATE COURSE
router.post("/", upload.single("file"), (req, res) => {
  var path;
  if (!req.file && !req.body.chosenImage) {
    req.flash("error", "โปรด upload ไฟล์ หรือเลือกภาพที่ต้องการ");
    return res.status(400).send("Please upload files or choose existing ones");
  } else if (req.file) {
    path = req.file.filename;
  } else {
    path = req.body.chosenImage;
  }
  var newCourse = {
      title: req.body.title,
      code: method.createCode(req.body.title),
      description: req.body.description,
      video: req.body.video,
      price: req.body.price,
      image: path
  };
  Course.create(newCourse).then((course) => {
    res.status(201).send(course);
  }).catch((err) => {
    res.status(400).send("Something went wrong");
  });
});

// UPDATE COURSE

// UP DATE PART AND ORDER AND VIDEO IF NAME HAS CHANGEd.
router.put("/:id", upload.single("file"), (req, res) => {
  fetchCourse(req.params.id).then((course) => {
    var path;
    if (req.file) {
      path = req.file.filename;
    } else if (req.body.chosenImage) {
      path = req.body.chosenImage;
    } else {
      path = course.image;
    }
    course.title = req.body.title;
    course.code = method.createCode(req.body.title);
    course.price = req.body.price;
    course.description = req.body.description;
    course.video = req.body.video;
    course.image = path;
    course.save((err, course) => {
      if (err) return console.log(err);
      res.status(200).send(course);
    });
  }).catch((err) => {
    res.status(400).send("Something is wrong with the database");
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  Course.findByIdAndRemove(req.params.id).then((course) => {
    res.status(200).send(course);
  }).catch((err) => {
    res.status(400).send("Something is wrong with the database");
  });
});


module.exports = router;
