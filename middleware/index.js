var Course = require("./../models/course");
var Part = require("./../models/part");
var method = require("./../method");
var config = require("./../config");

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
            req.flash("error", "โปรดต่ออายุคอร์สต่อไปนี้เพื่อเข้าดู");
            res.redirect(`/courses/${req.params.courseCode}/extend`);
        } else {
            req.flash("error", "โปรดซื้อคอร์สต่อไปนี้เพื่อเข้าดู");
            res.redirect(`/courses/${req.params.courseCode}/buy`);
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
                req.flash("error", "โปรดต่ออายุบทนี้เพื่อเข้าดู");
                res.redirect(`/courses/${req.params.courseCode}/parts/${req.params.partCode}/extend`);
            } else {
                req.flash("error", "โปรดซื้อบทนี้เพื่อเข้าดู");
                res.redirect(`/courses/${req.params.courseCode}/buy`);
            }
        });
    });
};

middlewareObj.canBuy = function(req, res, next) {
    if (req.user.isAdmin) {
        req.flash("error", "สำหรับสมาชิกทั่วไปเท่านั้น");
        return res.redirect(`/${req.params.courseCode}/learn`);
    }
    Course.findOne({code: req.params.courseCode}).populate("parts").exec().then((course) => {
        var buyableParts = method.getBuyableParts(course.parts, req.user.parts);
        if (buyableParts.length === 0) {
            req.flash("error", "ไม่มีบทที่คุณสามารถซื้อได้");
            res.redirect(`/courses/${req.params.courseCode}/learn`);
        } else {
            next();
        }
    });
};

middlewareObj.canAdd = function(req, res, next) {
    if (req.user.isAdmin) {
        req.flash("error", "สำหรับสมาชิกทั่วไปเท่านั้น");
        return res.redirect(`/${req.params.courseCode}/learn`);
    }
    Course.findOne({code: req.params.courseCode}).exec().then((course) => {
        if (method.checkCartCourseOwnership(req.user.cartCourses, course._id.toString()) === true) {
            req.flash("error", "คุณมีคอร์สนี้ในตะกร้าเรียบร้อยแล้ว");
            res.redirect(`/courses/checkout`);
        } else if (method.checkCourseOwnership(req.user.courses, course._id.toString())) {
            req.flash("error", "คุณมีคอร์สนี้อยู่แล้ว หากต้องการซื้อแยกโปรดคลิก \"ซื้อ\" ");
            res.redirect(`/courses/${req.params.courseCode}/learn`);
        } else {
            next();
        }
    });
};

middlewareObj.canExtend = function(req, res, next) {
    if (req.user.isAdmin) {
        req.flash("error", "สำหรับสมาชิกทั่วไปเท่านั้น");
        return res.redirect(`/${req.params.courseCode}/learn`);
    }
    Course.findOne({code: req.params.courseCode}).populate("parts").exec().then((course) => {
        var extendableParts = method.getExtendableParts(course.parts, req.user.parts);
        if (extendableParts.length === 0) {
            req.flash("error", "ไม่มีบทที่จำเป็นต้องต่ออายุ");
            res.redirect(`/courses/${req.params.courseCode}/learn`);
        } else {
            next();
        }
    });
};

middlewareObj.isAdmin = function(req, res, next) {
    if (req.user.isAdmin === true) {
        return next();
    }
    req.flash("error", "เฉพาะ admin เท่านั้น");
    res.redirect("/dashboard");
};

middlewareObj.noDuplicateLogin = function(req, res, next) {
    if (!req.user) {
        return next();
    }
    res.redirect("/dashboard");
};

middlewareObj.checkRememberMe = function(req, res, next) {
    if(req.body.rememberMe) {
      req.session.cookie.maxAge = config.cookieAge;
    }
    next();
};

module.exports = middlewareObj;
