var express = require('express');
var router = express.Router();
//var mongo = require('mongodb');
//var db = require('monk')('localhost/nodeblog');

/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeblog');
var db = mongoose.connection;
*/
var Posts = require('../models/post');

/* GET home page. */
router.get('/', function(req, res, next) {
	//var db = req.db;
	//var posts = db.get('posts');
	Posts.find({}, {}, function(err, posts){
		res.render('index', { posts: posts });
	});

});


router.post('/delete/:id', function(req, res, next) {
   // var posts = db.get('posts');
    var id = req.params.id;
    console.log('id' + id);
    // posts.remove({"_id": db.id(id)});
  // Posts.deleteOne({"_id": id});
    Posts.deleteOne({ _id: id }, function (err) {
        console.log(err);
    });
    res.redirect('/');

});

router.get('/api/posts', function(req, res, next) {
    console.log("fetching reviews");
   // var db = req.db;
   // var posts = db.get('posts');
    Posts.find({}, {}, function(err, posts){
        res.json(posts);
    });
});

module.exports = router;
