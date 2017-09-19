var User = require("./../models/user");
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
                        } 
                        ctr2++;
                        if (ctr2 === user.courses.length) {
                            user.save((err) => {
                               if (err) return console.log(err); 
                            });
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