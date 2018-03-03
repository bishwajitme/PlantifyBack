var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://travelblog:travelblog@ds255768.mlab.com:55768/travelblog');

/* GET home page. */
router.get('/', function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {}, function(err, posts){
		res.render('index', { posts: posts });
	});
});

router.get('/api/posts', function(req, res, next) {
    console.log("fetching reviews");
    var db = req.db;
    var posts = db.get('posts');
    posts.find({}, {}, function(err, posts){
        res.json(posts);
    });
});

module.exports = router;
