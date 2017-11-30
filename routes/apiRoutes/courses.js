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
  var sort = req.query.sort;
  var order = req.query.order;
  var limit = req.query.limit? Number(req.query.limit) : 100;
  var skip = req.query.skip? Number(req.query.skip) : 0;
  var sortObject = sort? new Object: null;
  // var queryObject =
  if (order === 1 || order === -1) {
    sortObject[sort] = order? order : 1;
  }
  var query = req.query;
  delete query.sort; delete query.order; delete query.limit; delete query.skip;
  Course.find(query).sort(sortObject).skip(skip).limit(limit).exec((err, courses) => {
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
router.post("/", (req, res) => {
  if (!req.body.title) {
    return res.status(400).send("โปรดใส่ชื่อคอร์ส");
  }
  if (!req.body.image) {
    return res.status(400).send("โปรดเลือกภาพ");
  }
  var course = new Course({
      title: req.body.title,
      code: method.createCode(req.body.title),
      description: req.body.description,
      video: req.body.video,
      price: req.body.price,
      image: req.body.image + '.jpg'
  });
  course.save().then((course) => {
    res.status(201).send(course);
  }).catch((err) => {
    res.status(400).send("Something went wrong");
  });
});

// UPDATE COURSE

// UP DATE PART AND ORDER AND VIDEO IF NAME HAS CHANGEd.
router.put("/:id", (req, res) => {
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
