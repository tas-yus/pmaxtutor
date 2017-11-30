var express = require("express");
var router = express.Router();
var config = require("./../../config");
var middleware = require("./../../middleware");
var fs = require("fs");
var path = require("path");
var multer = require("multer");
var method = require("./../../method");
var storage = multer.diskStorage({
  destination: __dirname + config.imageApiPath,
  filename: function (req, file, cb) {
    var filename = req.body.fileName;
    filename += path.extname(file.originalname);
    cb(null, filename);
  }
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2mb, in bytes
  },
  onFileSizeLimit: function (file) {
    file.error = {
        message: "Upload failed",
        status: MARankings.Enums.Status.FILE_TOO_LARGE
    };
  },
  onFileUploadComplete: function (file, req, res) {
    if (file.error){
        res.status(400).send(file.error);
    }
  }
});

// CREATE COURSE
router.post("/upload", middleware.isLoggedIn, middleware.isAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file received");
  }
  res.status(200).send("File Uploaded!");
});

module.exports = router;
