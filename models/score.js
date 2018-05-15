var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScoreSchema = new Schema({
    "score": Number,
    "categoryid": String,
    "username": String,
    "date": String
});



module.exports = mongoose.model('Score', ScoreSchema);