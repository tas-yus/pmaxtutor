var User = require("./../models/user");
var Course = require("./../models/course");
var method = require("./../method");
var forEach = require('async-foreach').forEach;

var checkExpiry = function() {
    User.find({}).populate("courses.course").populate("parts.part").exec().then((users) => {
        forEach(users, function (user) {
            var ctr = 0;
            var done = this.async()
            forEach(user.parts, function (partBundle) {
                if (partBundle.expiredAt < new Date().getTime()) {
                    partBundle.expired = true;
                }
                forEach(user.courses, function (courseBundle) {
                  if (method.checkIfCourseShouldExpired(courseBundle, user.parts)) {
                      courseBundle.expired = true;
                      Course.findById(courseBundle.course._id.toString(), (err, course) => {
                        if (err) return console.log(err);
                        course.users = course.users.filter(function(courseUser) {return courseUser.toString() !== user._id.toString() } );
                        if (!method.checkIfCourseContainsUserOfId(course.expiredUsers, user._id.toString())) course.expiredUsers.push(user);
                        course.save((err) => {
                          if (err) return console.log(err);
                          ctr++;
                          if (ctr === user.parts.length) {
                            user.save((err) => {
                               if (err) return console.log(err);
                               done();
                            });
                          }
                        });
                      });
                  } else {
                    done();
                  }
                });
            });
        });
    }).catch((err) => {
       console.log(err);
    });
};

module.exports = checkExpiry;
