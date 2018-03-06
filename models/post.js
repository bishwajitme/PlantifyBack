var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    "title": String,
    "category": String,
    "body": String,
    "author": String,
    "date": String,
    "mainimage": String,
    "location": [],
    "comments":[]
});



module.exports = mongoose.model('Posts', PostSchema);