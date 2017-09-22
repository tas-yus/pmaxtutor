var methodObj = {};
var User = require("./../models/user");

methodObj.getPartInArrayById = function (arr, id) {
    var result  = arr.filter(function(o){
        if (o.part._id) {
            return o.part._id.toString() === id;
        } else {
            return o.part.toString() === id;
        }
    });
    return result? result[0] : null; // or undefined
};

methodObj.getCourseInArrayByTitle = function (courseArray, title) {
    var result  = courseArray.filter(function(courseBundle){return courseBundle.course.title === title;} );
    return result? result[0] : null; // or undefined
};

methodObj.getPartInUserArrayByCourseTitle = function (partArray, courseTitle) {
    var result  = partArray.filter(function(partBundle){return partBundle.part.course === courseTitle;} );
    return result? result : null; // or undefined
};

methodObj.getPartInPartArrayByCourseTitle = function (partArray, courseTitle) {
    var result  = partArray.filter(function(part){return part.course === courseTitle;} );
    return result? result : null; // or undefined
};

methodObj.getCourseInArrayById = function(arr, id) {
    var result  = arr.filter(function(o){
        if (o.course._id) {
            return o.course._id.toString() === id;
        } else {
            return o.course.toString() === id;
        }
    });
    return result? result[0] : null; // or undefined
};

methodObj.createCode = function(str) {
    var result;
    result = str.toLowerCase();
    result = result.trim();
    result = result.replace(/ /g, "-");
    return result;
};

methodObj.toClockTime = function(timeInSec) {
    var min = Math.floor(timeInSec/60);
    var sec = Math.floor(timeInSec % 60);
    if (sec < 10) sec = "0" + sec;
    var time = "";
    time = time + min + ":" + sec;
    return time;
};

methodObj.toTime = function(str) {
	var array = str.split(":");
	var sec = array[array.length-1];
	if(sec[0] === "0") sec = sec.substr(1);
	var time = Number(array[0]) * 60 + Number(sec);
	return time;
};

methodObj.getAverageHours = function(timeArray) {
    var total = 0;
    timeArray.forEach((clockTime) => {
        total += methodObj.toTime(clockTime);
    });
    var avg = (total/3600).toFixed(1);
    return avg;
};

methodObj.checkCourseOwnership = function(courseArray, courseId) {
    if(courseArray.length === 0) return false;
    for(var i = 0; i < courseArray.length; i++) {
        var userCourseBundle = courseArray[i];
        if (userCourseBundle.course._id) {
             if (userCourseBundle.course._id.toString() !== courseId) continue;
        } else {
             if (userCourseBundle.course.toString() !== courseId) continue;
        }
        if (userCourseBundle.expired) return "expired";
        else return true;
    }
    return false;
};

methodObj.checkPartOwnership = function(partArray, partId) {
    if(partArray.length === 0) return false;
    for(var i = 0; i < partArray.length; i++) {
        var userPartBundle = partArray[i];
        if (userPartBundle.part._id) {
            if (userPartBundle.part._id.toString() !== partId) continue;
        } else {
            if (userPartBundle.part.toString() !== partId) continue;
        }
        if (userPartBundle.expired) return "expired";
        else return true;
    }
    return false;
};

methodObj.getBuyableParts = function(populatedCoursePartArray, userPartArray) {
    var buyableParts = [];
    populatedCoursePartArray.forEach((part) => {
        if (methodObj.checkPartOwnership(userPartArray, part._id.toString()) !== true &&
            methodObj.checkPartOwnership(userPartArray, part._id.toString()) !== "expired") {
            buyableParts.push(part);
        }
    });
    return buyableParts;
};

methodObj.getExtendableParts = function(populatedCoursePartArray, userPartArray) {
    var extendableParts = [];
    populatedCoursePartArray.forEach((part) => {
       if (methodObj.checkPartOwnership(userPartArray, part._id.toString()) === "expired") {
           extendableParts.push(part);
       }
    });
    return extendableParts;
};

methodObj.checkIfPartsOfCourseNameExisted = function(populatedUserPartArray, courseTitle) {
    for(var i = 0; i < populatedUserPartArray.length; i++) {
        var userPartBundle = populatedUserPartArray[i];
        if (userPartBundle.part.course === courseTitle) return true;
    }
    return false;
};

methodObj.checkIfCourseShouldExpired = function(populatedUserCourseBundle, populatedUserPartArray) {
    if (populatedUserPartArray.length === 0) return false;
    for (var i = 0; i < populatedUserPartArray.length; i++) {
        var populatedUserPartBundle = populatedUserPartArray[i];
         if (populatedUserPartBundle.part.course === populatedUserCourseBundle.course.title &&
            !populatedUserPartBundle.expired) {
              return false;
          }
    }
    return true;
};

methodObj.checkIfCourseContainsUserOfId = function (courseUserArray, id) {
    for (var i = 0; i < courseUserArray.length; i++) {
      var courseUser = courseUserArray[i];
      if (courseUser.toString() === id) return true;
    }
    return false;
};

methodObj.checkIfPartContainsUserOfId = function (partUserArray, id) {
    for (var i = 0; i < partUserArray.length; i++) {
      var partUser = partUserArray[i];
      if (partUser.toString() === id) return true;
    }
    return false;
};

methodObj.searchUsersByUsername = function (str) {
  User.find({username : new RegExp(str, 'i')}, (err, users) => {
    if (err) return console.log(err);
    return users;
  });
}

module.exports = methodObj;
