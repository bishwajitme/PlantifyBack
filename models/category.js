var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    "name": String

});

module.exports = mongoose.model('Categories', CategorySchema);