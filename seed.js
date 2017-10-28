var mongoose = require("mongoose");
var Course = require("./models/course");
var User = require("./models/user");
var Part = require("./models/part");
var Video = require("./models/video");
var Resource = require("./models/resource");
var Question = require("./models/question");
var Answer = require("./models/answer");
var Order = require("./models/order");
var forEach = require('async-foreach').forEach;
var method = require("./method");

var data = [
    {
        title: "Chem Olympic 1",
        code: "chem-olympic-1",
        image: "chem1.jpg",
        description: "โครงสร้างอะตอม (Atomic Structure) แนวโน้มตารางธาตุ (Periodic Trend) พันธะเคมี (Chemical Boding) และเนื้อหาขั้นสูงเช่น ฟังก์ชันคลื่น Schrodinger ทฤษฎีพันธะ Hybridization และ Molecular Theory",
        video: "https://www.youtube.com/embed/wQPaykRPI5Q",
        price: 2000,
        order: 1
    },
    {
        title: "Chem Olympic 2",
        code: "chem-olympic-2",
        image: "chem2.jpg",
        description: "พาร์ทคำนวณ เช่น ปริมาณสารสัมพันธ์ (Stoichiometry) สารละลายและความเข้มข้น (Concentration) ของแข็ง ของเหลว แก็ส (Solid, Liquid, Gas)",
        video: "https://www.youtube.com/embed/OOB6_qmwKMI",
        price: 1800,
        order: 2
    },
    {
        title: "Chem Olympic 3",
        code: "chem-olympic-3",
        image: "chem3.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 3
    },
    {
        title: "Chem Olympic 4",
        code: "chem-olympic-4",
        image: "chem4.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 4
    },
    {
        title: "Chem Olympic 5",
        code: "chem-olympic-5",
        image: "chem5.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 5
    },
    {
        title: "Chem Olympic 6",
        code: "chem-olympic-6",
        image: "chem6.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 6
    }
];

var videos = [
    {
        title: "Electron Configuration",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "15:50",
        previewAllowed: true,
        order: 1
    },
    {
        title: "Atomic Model",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "12:49",
        previewAllowed: true,
        order: 2
    },
    {
        title: "spdf",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 3
    },
    {
        title: "2882 Config",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 4
    },
    {
        title: "[Ar] using Noble gas",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 5
    },
    {
        title: "Electron Diagram",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 6
    },
    {
        title: "Quantum Number",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 7
    },
    {
        title: "Heisenberg",
        part: "Atom",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 8
    },
    {
        title: "Excited State",
        part: "Spectra",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "12:41",
        order: 9
    },
    {
        title: "Covalent Bond",
        part: "Chemical Bonding",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "09:56",
        order: 10
    },
    {
        title: "VSEPR",
        part: "Chemical Bonding",
        course: "Chem Olympic 1",
        path: "small.mp4",
        duration: "11:72",
        order: 11
    },
    {
        title: "What is mol?",
        part: "Stoichiometry",
        course: "Chem Olympic 2",
        path: "small.mp4",
        duration: "12:44",
        order: 1
    },
    {
        title: "Unit Conversion Factor",
        part: "Stoichiometry",
        course: "Chem Olympic 2",
        path: "small.mp4",
        duration: "08:62",
        order: 2
    },
    {
        title: "Percentage by weight",
        part: "Empirical Formula",
        course: "Chem Olympic 2",
        path: "small.mp4",
        duration: "05:29",
        order: 3
    },
    {
        title: "Molar ratio",
        part: "Empirical Formula",
        course: "Chem Olympic 2",
        path: "small.mp4",
        duration: "10:41",
        order: 4
    },
    {
        title: "What is Equilibrium?",
        part: "Equilibrium",
        course: "Chem Olympic 3",
        path: "small.mp4",
        duration: "05:50",
        order: 1
    },
    {
        title: "Equilibrium constant",
        part: "Equilibrium",
        course: "Chem Olympic 3",
        path: "small.mp4",
        duration: "09:55",
        order: 2
    }
]

var parts = [
    {
        course: "Chem Olympic 1",
        title: "Atom",
        code: "atom",
        image: "chem1-a.jpg",
        description: "Spicy jalapeno bacon ipsum dolor amet leberkas prosciutto venison bresaola, meatball pig biltong. Meatloaf pork chop porchetta boudin filet mignon. Biltong ball tip rump doner pastrami ribeye salami ham short loin pork chop frankfurter. Tail cow tri-tip beef ribs frankfurter short ribs turkey shank t-bone rump tongue. Short loin brisket strip steak hamburger bresaola landjaeger. Chuck shoulder tongue pancetta sausage, kielbasa sirloin. Tail salami tongue capicola bacon shank, meatball turkey rump.",
        price: 600
    },
    {
        course: "Chem Olympic 1",
        title: "Spectra",
        code: "spectra",
        image: "chem1-s.jpg",
        description: "fwnefewjfiejwfoiewjfoewijfeowijfewofjweofjewofijewjoifew",
        price: 650
    },
    {
        course: "Chem Olympic 2",
        title: "Stoichiometry",
        code: "stoichiometry",
        image: "chem2-s.jpg",
        description: "This is Stoi",
        price: 700
    },
    {
        course: "Chem Olympic 2",
        title: "Empirical Formula",
        code: "empirical-formula",
        image: "chem2-ef.jpg",
        description: "This is Empirical",
        price: 850
    },
    {
        course: "Chem Olympic 1",
        title: "Chemical Bonding",
        code: "chemical-bonding",
        image: "chem1-cb.jpg",
        description: "This is bonding",
        price: 650
    },
    {
        course: "Chem Olympic 3",
        title: "Equilibrium",
        code: "equilibrium",
        image: "chem3-eq.jpg",
        description: "This is Equilibrium",
        price: 623
    }
];

var user = [
    {
        username: "tas",
        isAdmin: true
    },
    {
        username: "audy"
    },
    {
        username: "alex",
    },
    {
        username: "andre"
    },
    {
        username: "sarah"
    },
    {
        username: "edric"
    },
    {
        username: "vincent"
    },
    {
        username: "maria"
    },
    {
        username: "charlie"
    },
    {
        username: "willie"
    },
    {
        username: "MAX"
    },
    {
        username: "tas31745"
    },
    {
        username: "big"
    },
    {
        username: "binSu"
    },
    {
        username: "eminem"
    },
    {
        username: "Kinu"
    },
    {
        username: "Keane123"
    }
];

var questions = [{
        title: "What's the difference between Oxidation State and Charge?",
        body: "It seems to me that they are the same. However, they are not! Could you please explain in detials why this is the case?",
    },
    {
        title: "When do we use delta and when do we use differential sign?",
        body: "I cant wrap my head around calculus at all. My dead cat at home is way smarter than me. That's why I really need help from you doctor Tas"
    }];

var answers = [{
        body: "Oh I think you should go back to your mom and ask her repeatedly why she sent you to school!",
    },
    {
        body: "Busted! You're not smarter than a dog baby. I assume you IQ is way lower than me, so you need my help? Pay me a couple more hundred bucks!",
    }]

function seedDB() {
    Resource.remove({}, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log("Resources Removed");
    });
    User.remove({}, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log("Users Removed");
        user.forEach((user) => {
           User.register(user, "password", (err, user) => {
              if (err) {
                  return console.log(err);
              }
              console.log("Users Added");
           });
        });
    });
    Course.remove({}, (err) => {
       if (err) {
           return console.log(err);
       }
       console.log("courses removed");
       data.forEach((course) => {
            Course.create(course, (err, data) => {
                if (err) {
                    return console.log(err);
                }
                console.log("Courses Added");
            });
        });
    });
    Part.remove({}, (err) => {
        if (err) {
            return console.log(err);
        }
    });
    Video.remove({}, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log("Videos Removed")
        videos.forEach((video) => {
            Video.create(video, (err) => {
               if (err) {
                   return console.log(err);
               }
               console.log("Videos Added");
            });
        });
        parts.forEach((part) => {
            Part.create(part, (err) => {
               if (err) {
                   return console.log(err);
               }
               console.log("Parts Added");
            });
        });
    });
    Question.remove({}, (err) => {
       if (err) return console.log(err);
       console.log("Questions Removed");
       questions.forEach((q) => {
          Question.create(q, (err) => {
              if (err) return console.log(err);
              console.log("Questions Added");
          })
       });
    });
    Answer.remove({}, (err) => {
       if (err) return console.log(err);
       console.log("Answers Removed");
       answers.forEach((ans) => {
          Answer.create(ans, (err) => {
            if (err) return console.log(err);
            console.log("Answers Added");
          });
       });
    });
    Order.remove({}, (err) => {
       if (err) return console.log(err);
       console.log("Orders Removed");
    });

    setTimeout(linkVideos, 2000);
    setTimeout(linkParts, 3000);
    // setTimeout(setUpQA, 2000);

    function linkVideos() {
        Part.find({}, (err, parts) => {
            if (err) {
                return console.log(err);
            }
            parts.forEach((part) => {
                Video.find({ part: part.title }, (err, foundVideos) => {
                    if (err) {
                        return console.log(err);
                    }
                    part.videos = foundVideos;
                    part.duration = method.getDuration(foundVideos);
                    part.save((err) => {
                       if (err) {
                           return console.log(err);
                       }
                       console.log("Vids Linked With Parts: " + part.title);
                    });
                });
            });
        });
   }

   function linkParts() {
      Course.find({}, (err, courses) => {
        if (err) return console.log(err);
        forEach(courses, function(course){
          var ctr = 0;
          var numVideos = course.numVideos;
          var done = this.async();
          Part.find({course: course.title}, (err, foundParts) => {
            if (err) return console.log(err);
            foundParts.forEach((part) => {
              numVideos += part.videos.length;
              course.parts.push(part);
              ctr++;
              if (ctr === foundParts.length) {
                course.numVideos = numVideos;
                course.save((err) => {
                  if (err) return console.log(err);
                  done();
                  console.log("Parts Linked With Courses: " + course.title);
                });
              }
            });
          });
        });
      });
   }

   function linkQuestionsWithUsers() {
       User.findOne({username: "audy"}, (err, user) => {
           if (err) return console.log(err);
                Question.findOne({title: "What's the difference between Oxidation State and Charge?"}, (err, q) => {
                if (err) return console.log(err);
                q.author = user;
                user.questions.push(q);
                q.save((err) => {
                   if (err) return console.log(err);
                   user.save((err) => {
                       if (err) return console.log(err);
                       console.log("Question " + q.code + " linked to " + user.username);
                   });
               });
           });
       });
       User.findOne({username: "alex"}, (err, user) => {
           if (err) return console.log(err);
               Question.findOne({title: "When do we use delta and when do we use differential sign?"}, (err, q) => {
               if (err) return console.log(err);
               q.author = user;
               user.questions.push(q);
               q.save((err) => {
                   if (err) return console.log(err);
                   user.save((err) => {
                       if (err) return console.log(err);
                       console.log("Question " + q.code + " linked to " + user.username);
                   });
               });
           });
       });
   }

   function linkAnswersWithUsers() {
       User.findOne({username: "tas"}, (err, user) => {
           if (err) return console.log(err);
                Answer.findOne({body: "Oh I think you should go back to your mom and ask her repeatedly why she sent you to school!"}, (err, ans) => {
                if (err) return console.log(err);
                ans.author = user;
                user.answers.push(ans);
                ans.save((err) => {
                   if (err) return console.log(err);
                   user.save((err) => {
                        if (err) return console.log(err);
                        console.log("Answer " + ans.code + " linked to " + user.username);
                   });
                });
           });
       });
       User.findOne({username: "tas"}, (err, user) => {
           if (err) return console.log(err);
               Answer.findOne({body: "Busted! You're not smarter than a dog baby. I assume you IQ is way lower than me, so you need my help? Pay me a couple more hundred bucks!"}, (err, ans) => {
               if (err) return console.log(err);
               ans.author = user;
               user.answers.push(ans);
               ans.save((err) => {
                   if (err) return console.log(err);
                   user.save((err) => {
                        if (err) return console.log(err);
                        console.log("Answer " + ans.code + " linked to " + user.username);
                   });
               });
           });
       });
   }

   function linkQuestionsWithVideos() {
       Question.findOne({title: "What's the difference between Oxidation State and Charge?"}, (err, q) => {
           if (err) return console.log(err);
           Video.findOne({title: "Atomic Model"}, (err, vid) => {
               if (err) return console.log(err);
               vid.questions.push(q);
               q.video = vid;
               Part.findOne({title: vid.part}, (err, part) => {
                   if (err) return console.log(err);
                   part.questions.push(q);
                   Course.findOne({title: part.course}, (err, course) => {
                        if (err) return console.log(err);
                        course.questions.push(q);
                        vid.save((err) => {
                           if (err) return console.log(err);
                           q.save((err) => {
                              if (err) return console.log(err);
                              part.save((err) => {
                                  if (err) return console.log(err);
                                  course.save((err) => {
                                      if (err) return console.log(err);
                                     console.log("Question " + q.code + " linked to Video " + vid.code);
                                  });
                              });
                           });
                       });
                   });
               });
           });
       });
       Question.findOne({title: "When do we use delta and when do we use differential sign?"}, (err, q) => {
           if (err) return console.log(err);
           Video.findOne({title: "Atomic Model"}, (err, vid) => {
               if (err) return console.log(err);
               vid.questions.push(q);
               q.video = vid;
                Part.findOne({title: vid.part}, (err, part) => {
                   if (err) return console.log(err);
                   part.questions.push(q);
                   Course.findOne({title: part.course}, (err, course) => {
                        if (err) return console.log(err);
                        course.questions.push(q);
                        vid.save((err) => {
                           if (err) return console.log(err);
                           q.save((err) => {
                              if (err) return console.log(err);
                              part.save((err) => {
                                  if (err) return console.log(err);
                                  course.save((err) => {
                                      if (err) return console.log(err);
                                     console.log("Question " + q.code + " linked to Video " + vid.code);
                                  });
                              });
                           });
                       });
                   });
               });
           });
       });
   }
   function linkQuestionsWithAnswers() {
           Question.findOne({title: "What's the difference between Oxidation State and Charge?"}, (err, q) => {
               if (err) return console.log(err);
               Answer.findOne({body: "Oh I think you should go back to your mom and ask her repeatedly why she sent you to school!"}, (err, ans1) => {
                   if (err) return console.log(err);
                   q.answers.push(ans1);
                   ans1.question = q;
                   ans1.save((err) => {
                       if (err) return console.log(err);
                   });
                   Answer.findOne({body: "Busted! You're not smarter than a dog baby. I assume you IQ is way lower than me, so you need my help? Pay me a couple more hundred bucks!"}, (err, ans2) => {
                       if (err) return console.log(err);
                       q.answers.push(ans2);
                       ans2.question = q;
                       ans2.save((err) => {
                          if (err) return console.log(err);
                       });
                       q.save((err) => {
                           if (err) return console.log(err);
                           console.log("Questions " + q.code + " now has answers");
                       })
                   });
               });
           });
       }

   function setUpQA() {
        linkQuestionsWithUsers();
        linkAnswersWithUsers();
        linkQuestionsWithVideos();
        setTimeout(linkQuestionsWithAnswers, 500);
   }
}

module.exports = seedDB;
