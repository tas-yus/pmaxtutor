var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connect("mongodb://localhost/pmaxapp", {useMongoClient: true}));

var ResourceSchema = new mongoose.Schema({
    title: String,
    path: String
});

ResourceSchema.plugin(autoIncrement.plugin,  
    {
        model: 'Resource',
        field: 'code',
        startAt: 100,
        incrementBy: 1
    });
module.exports = mongoose.model("Resource", ResourceSchema);