var express = require("express");
var router = express.Router({mergeParams: true});
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

function fetchPart(id) {
  return new Promise((resolve, reject) => {
    Part.findById(id).populate({
      path: "videos",
      model: "Video",
    }).exec().then((part) => {
      resolve(part);
    }).catch((err) => {
      reject(err);
    });
  });
};

// ALL PARTs
router.get("/", (req, res) => {
  Part.find({course: req.params.courseId}).populate("videos").exec().then((parts) => {
    if (!parts) {
      return res.status(400).send("Cannot find parts");
    }
    res.status(200).json(parts);
  }).catch((err) => {
    console.log(err);
    return res.status(400).send("Something is wrong with the database");
  });
});

router.get("/:id", (req, res) => {
  fetchPart(req.params.id).then((part) => {
    if (!part) {
      res.status(400).send("Cannot find a part with particular id");
    } else {
      res.status(200).send(part);
    }
  }).catch((err) => {
    res.status(400).send("Something is wrong with the database");
  });
});

// CREATE PART
router.post("/", upload.single("file"), async (req, res) => {
  var path;
  if (!req.file && !req.body.chosenImage) {
    req.flash("error", "โปรด upload ไฟล์ หรือเลือกภาพที่ต้องการ");
    return res.status(400).send("Please upload files or choose existing ones");
  } else if (req.file) {
    path = req.file.filename;
  } else {
    path = req.body.chosenImage;
  }
  var course = await Course.findById(req.params.courseId);
  var newPart = {
    title: req.body.title,
    code: method.createCode(req.body.title),
    description: req.body.description,
    price: req.body.price,
    image: path,
  };
  var part = await Part.create(newPart);
  course.parts.push(part);
  course.save((err) => {
    if (err) return res.status(400).send("Something is wrong with the database");
    res.status(200).send(part);
  });
});


// *** FROM HERE
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
