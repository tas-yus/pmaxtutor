var User = require("./../models/user");
var Course = require("./../models/course");
var method = require("./../method");
var forEach = require('async-foreach').forEach;

var checkExpiry = function() {
    User.find({}).populate("courses.course").populate("parts.part").exec().then((users) => {
      console.log("checkExpiry Run!")
        forEach(users, function (user) {
            var ctr = 0;
            var done = this.async()
            console.log(user.username);
            if (user.parts.length === 0) done();
            forEach(user.parts, function (partBundle) {
                // done1 = this.async();
                // if (partBundle.expired) done1();
                if (partBundle.expiredAt < new Date().getTime()) {
                    partBundle.expired = true;
                    console.log(user.username + "\'s " + partBundle.part.title + " has expired!");
                }
                ctr++;
                // done1();
                if (ctr === user.parts.length) {
                  user.save((err) => {
                     if (err) return console.log(err);
                  });
                  var ctr1 = 0;
                  forEach(user.courses, function (courseBundle) {
                    if (method.checkIfCourseShouldExpired(courseBundle, user.parts)) {
                        courseBundle.expired = true;
                        Course.findById(courseBundle.course._id.toString(), (err, course) => {
                          if (err) return console.log(err);
                          course.users = course.users.filter(function(courseUser) {return courseUser.toString() !== user._id.toString() } );
                          if (!method.checkIfCourseContainsUserOfId(course.expiredUsers, user._id.toString())) course.expiredUsers.push(user);
                          course.save((err) => {
                            if (err) return console.log(err);
                            console.log(user.username + "\'s " + courseBundle.course.title + " has expired!")
                            ctr1++;
                            if (ctr1 === user.courses.length) done();
                          });
                        });
                    } else {
                      ctr1++;
                      if (ctr1 === user.courses.length) done();
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
