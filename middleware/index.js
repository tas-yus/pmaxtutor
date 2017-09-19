var Course = require("./../models/course");
var Part = require("./../models/part");
var method = require("./../method");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "โปรดลงชื่อเข้าใช้งาน");
    res.redirect("/login");
};

middlewareObj.canAccessLearn = function (req, res, next) {
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) return console.log(err);
        if (req.user.isAdmin || method.checkCourseOwnership(req.user.courses, course._id.toString()) === true) {
            return next();
        } else if (method.checkCourseOwnership(req.user.courses, course._id.toString()) === "expired") {
            res.redirect(`/${req.params.courseCode}/extend`);
        } else {
            res.redirect(`/${req.params.courseCode}/buy`);
        }
    });
};

middlewareObj.canLearn = function(req, res, next) {
    Course.findOne({code: req.params.courseCode}, (err, course) => {
        if (err) return console.log(err);
        Part.findOne({code: req.params.partCode}, (err, part) => {
            if (err) return console.log(err);
            if (req.user.isAdmin || method.checkPartOwnership(req.user.parts, part._id.toString()) === true) {
                return next();
            } else if (method.checkPartOwnership(req.user.parts, part._id.toString()) === "expired") {
                res.redirect(`/${req.params.courseCode}/${req.params.partCode}/extend`);
            } else {
                res.redirect(`/${req.params.courseCode}/buy`);
            }
        });
    });
};

middlewareObj.canBuy = function(req, res, next) {
    if (req.user.isAdmin) {
        return res.redirect(`/${req.params.courseCode}/learn`);
    }
    Course.findOne({code: req.params.courseCode}).populate("parts").exec().then((course) => {
        var buyableParts = method.getBuyableParts(course.parts, req.user.parts);
        if (buyableParts.length === 0) {
            res.redirect(`/${req.params.courseCode}/learn`);
        } else {
            next();
        }
    });
};

middlewareObj.canExtend = function(req, res, next) {
    if (req.user.isAdmin) {
        return res.redirect(`/${req.params.courseCode}/learn`);
    }
    Course.findOne({code: req.params.courseCode}).populate("parts").exec().then((course) => {
        var extendableParts = method.getExtendableParts(course.parts, req.user.parts);
        if (extendableParts.length === 0) {
            res.redirect(`/${req.params.courseCode}/learn`);
        } else {
            next();
        }
    });
};

middlewareObj.isAdmin = function(req, res, next) {
    if (req.user.isAdmin === true) {
        return next();
    }
    res.redirect("/dashboard");
};

middlewareObj.noDuplicateLogin = function(req, res, next) {
    if (!req.user) {
        return next();
    }
    res.redirect("/dashboard");
};

module.exports = middlewareObj;
