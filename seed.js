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
var async = require("async");

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
    },
    {
        title: "POSN1",
        code: "posn1",
        image: "chem1.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 7
    },
    {
        title: "POSN2",
        code: "posn2",
        image: "chem2.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 8
    },
    {
        title: "POSN3",
        code: "posn3",
        image: "chem3.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 9
    },
    {
        title: "POSN4",
        code: "posn4",
        image: "chem4.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 10
    },
    {
        title: "POSN5",
        code: "posn5",
        image: "chem5.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 11
    },
    {
        title: "POSN6",
        code: "posn6",
        image: "chem6.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 12
    },
    {
        title: "Organic Chem1",
        code: "organic-chem1",
        image: "chem1.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 13
    },
    {
        title: "Organic Chem2",
        code: "organic-chem2",
        image: "chem2.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 14
    },
    {
        title: "Organic Chem3",
        code: "organic-chem3",
        image: "chem3.jpg",
        description: "อัตราการเกิดปฏิกิริยา (Rate of reaction) สมดุลเคมี (Chemical Equilibrium) รวมไปถึงเนื้อหาชั้นสูงเช่นเรื่องเทอร์โมไดนามิกส์ (Thermodynamics)",
        video: "https://www.youtube.com/embed/vMTPl2Iv2e8",
        price: 1900,
        order: 15
    },
];

var videos = [
    {
        title: "Electron Configuration",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "15:50",
        previewAllowed: true,
        order: 1
    },
    {
        title: "Atomic Model",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "12:49",
        previewAllowed: true,
        order: 2
    },
    {
        title: "spdf",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 3
    },
    {
        title: "2882 Config",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 4
    },
    {
        title: "[Ar] using Noble gas",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 5
    },
    {
        title: "Electron Diagram",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 6
    },
    {
        title: "Quantum Number",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 7
    },
    {
        title: "Heisenberg",
        partTitle: "Atom",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "20:12",
        order: 8
    },
    {
        title: "Excited State",
        partTitle: "Spectra",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "12:41",
        order: 9
    },
    {
        title: "Covalent Bond",
        partTitle: "Chemical Bonding",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "09:56",
        order: 10
    },
    {
        title: "VSEPR",
        partTitle: "Chemical Bonding",
        courseTitle: "Chem Olympic 1",
        path: "small.mp4",
        duration: "11:72",
        order: 11
    },
    {
        title: "What is mol?",
        partTitle: "Stoichiometry",
        courseTitle: "Chem Olympic 2",
        path: "small.mp4",
        duration: "12:44",
        order: 1
    },
    {
        title: "Unit Conversion Factor",
        partTitle: "Stoichiometry",
        courseTitle: "Chem Olympic 2",
        path: "small.mp4",
        duration: "08:62",
        order: 2
    },
    {
        title: "Percentage by weight",
        partTitle: "Empirical Formula",
        courseTitle: "Chem Olympic 2",
        path: "small.mp4",
        duration: "05:29",
        order: 3
    },
    {
        title: "Molar ratio",
        partTitle: "Empirical Formula",
        courseTitle: "Chem Olympic 2",
        path: "small.mp4",
        duration: "10:41",
        order: 4
    },
    {
        title: "What is Equilibrium?",
        partTitle: "Equilibrium",
        courseTitle: "Chem Olympic 3",
        path: "small.mp4",
        duration: "05:50",
        order: 1
    },
    {
        title: "Equilibrium constant",
        partTitle: "Equilibrium",
        courseTitle: "Chem Olympic 3",
        path: "small.mp4",
        duration: "09:55",
        order: 2
    }
]

var parts = [
    {
        courseTitle: "Chem Olympic 1",
        title: "Atom",
        code: "atom",
        image: "chem1-a.jpg",
        description: "Spicy jalapeno bacon ipsum dolor amet leberkas prosciutto venison bresaola, meatball pig biltong. Meatloaf pork chop porchetta boudin filet mignon. Biltong ball tip rump doner pastrami ribeye salami ham short loin pork chop frankfurter. Tail cow tri-tip beef ribs frankfurter short ribs turkey shank t-bone rump tongue. Short loin brisket strip steak hamburger bresaola landjaeger. Chuck shoulder tongue pancetta sausage, kielbasa sirloin. Tail salami tongue capicola bacon shank, meatball turkey rump.",
        price: 600
    },
    {
        courseTitle: "Chem Olympic 1",
        title: "Spectra",
        code: "spectra",
        image: "chem1-s.jpg",
        description: "fwnefewjfiejwfoiewjfoewijfeowijfewofjweofjewofijewjoifew",
        price: 650
    },
    {
        courseTitle: "Chem Olympic 2",
        title: "Stoichiometry",
        code: "stoichiometry",
        image: "chem2-s.jpg",
        description: "This is Stoi",
        price: 700
    },
    {
        courseTitle: "Chem Olympic 2",
        title: "Empirical Formula",
        code: "empirical-formula",
        image: "chem2-ef.jpg",
        description: "This is Empirical",
        price: 850
    },
    {
        courseTitle: "Chem Olympic 1",
        title: "Chemical Bonding",
        code: "chemical-bonding",
        image: "chem1-cb.jpg",
        description: "This is bonding",
        price: 650
    },
    {
        courseTitle: "Chem Olympic 3",
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
        async.forEachSeries(parts, (part, cb1) => {
          Video.find({ partTitle: part.title }, (err, foundVideos) => {
            if (err) return console.log(err);
            part.videos = foundVideos;
            part.duration = method.getDuration(foundVideos);
            async.forEachSeries(foundVideos, (vid, cb2) => {
              vid.part = part;
              vid.save((err) => {
                if (err) return console.log(err);
                cb2();
              });
            }, (err) => {
              if (err) return console.log(err);
              part.save((err) => {
                 if (err) return console.log(err);
                 console.log("Vids Linked With Parts: " + part.title);
                 cb1();
              });
            });
          });
        });
      });
   }

   function linkParts() {
     var numVideos;
      Course.find({}, (err, courses) => {
        if (err) return console.log(err);
        async.forEachSeries(courses, (course, cb1) => {
          numVideos = course.numVideos;
          Part.find({courseTitle: course.title}, (err, foundParts) => {
            if (err) return console.log(err);
            async.forEachSeries(foundParts, (part, cb2) => {
              numVideos += part.videos.length;
              course.parts.push(part);
              part.course = course;
              part.save((err) => {
                if (err) return console.log(err);
                cb2();
              });
            }, (err) => {
              if (err) return console.log(err);
              course.numVideos = numVideos;
              course.save((err) => {
                if (err) return console.log(err);
                console.log("Parts Linked With Courses: " + course.title);
                cb1();
              });
            });
          });
        }, (err) => {
          if (err) return console.log(err);
          Part.find({}, (err, parts) => {
            if (err) {
                return console.log(err);
            }
            async.forEachSeries(parts, (part, cb1) => {
              Video.find({ partTitle: part.title }, (err, foundVideos) => {
                if (err) return console.log(err);
                async.forEachSeries(foundVideos, (vid, cb2) => {
                  vid.course = part.course;
                  vid.save((err) => {
                    if (err) return console.log(err);
                    cb2();
                  });
                }, (err) => {
                  if (err) return console.log(err);
                  cb1();
                });
              });
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
