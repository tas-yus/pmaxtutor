var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connect("mongodb://localhost/pmaxapp", {useMongoClient: true}));

var OrderSchema = new mongoose.Schema({
    code: Number,
    type: {
      type: String,
      default: "buy"
    },
    course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course"
    },
    part: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Part"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    void: {
        type: Boolean,
        default: false
    },
}, {
  timestamps: true
});

OrderSchema.plugin(autoIncrement.plugin,
    {
        model: 'Order',
        field: 'code',
        startAt: 10000,
        incrementBy: 17
    });
module.exports = mongoose.model("Order", OrderSchema);
