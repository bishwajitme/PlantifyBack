var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ACSchema = new Schema({
    "activitytype": String,
    "distance": String,
    "duration": String,
    "username": String,
    "date": String
});



module.exports = mongoose.model('PhyActivity', ACSchema);