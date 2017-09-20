var User = require("./../models/user");
var Course = require("./../models/course");
var method = require("./../method");

var checkExpiry = function() {
    User.find({}).populate("courses.course").populate("parts.part").exec().then((users) => {
        users.forEach((user) => {
            var ctr = 0;
            user.parts.forEach((partBundle) => {
                if (partBundle.expiredAt < new Date().getTime()) {
                    partBundle.expired = true;
                }
                ctr++;
                if (ctr === user.parts.length) {
                    var ctr2 = 0;
                    user.courses.forEach((courseBundle) => {
                        if (method.checkIfCourseShouldExpired(courseBundle, user.parts)) {
                            courseBundle.expired = true;
                            Course.findById(courseBundle.course._id.toString(), (err, course) => {
                              if (err) return console.log(err);
                              course.users = course.users.filter(function(courseUser) {return courseUser.toString() !== user._id.toString() } );
                              if (!method.checkIfCourseContainsUserOfId(course.expiredUsers, user._id.toString())) course.expiredUsers.push(user);
                              course.save((err) => {
                                if (err) return console.log(err);
                              });
                            });
                            ctr2++;
                            if (ctr2 === user.courses.length) {
                              user.save((err) => {
                                 if (err) return console.log(err);
                              });
                            }
                        } else {
                          ctr2++;
                          if (ctr2 === user.courses.length) {
                              user.save((err) => {
                                 if (err) return console.log(err);
                              });
                          }
                        }
                    });
                }
            });
        });
    }).catch((err) => {
       console.log(err);
    });
};

module.exports = checkExpiry;
