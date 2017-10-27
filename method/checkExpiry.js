var User = require("./../models/user");
var Course = require("./../models/course");
var method = require("./../method");
var Part = require("./../models/part");
var Order = require("./../models/order");
var forEach = require('async-foreach').forEach;
var async = require('async');

var checkExpiry = async function() {
  var users = await User.find({}).populate("courses.course").populate("parts.part").exec();
  forEach(users, async function (user) {
    var ctr = 0;
    var done = this.async()
    console.log(user.username);
    if (user.parts.length === 0) done();
    forEach(user.parts, async function (partBundle) {
      // done1 = this.async();
      // if (partBundle.expired) done1();
      if (!partBundle.checked && partBundle.expiredAt < new Date().getTime()) {
        partBundle.expired = true;
        partBundle.checked = true;
        var part = await Part.findById(partBundle.part._id.toString());
        var course = await Course.findOne({title: part.course});
        var newOrder = {
          course, part, user, type: "expired"
        };
        var order = await Order.create(newOrder);
        user.orders.push(order);
        part.users = part.users.filter(function(partUser) {return partUser.toString() !== user._id.toString() } );
        if (!method.checkIfPartContainsUserOfId(part.expiredUsers, user._id.toString())) part.expiredUsers.push(user);
        part.save((err) => {
          if (err) return console.log(err);
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
                      console.log(user.username + "\'s " + courseBundle.course.title + " has expired!");
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
      }
    });
  });
};

module.exports = checkExpiry;
