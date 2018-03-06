var express = require('express');
var router = express.Router();
var Posts = require('../models/post');
var Categories = require('../models/category');

router.get('/show/:category', function(req, res, next) {
	//var posts = db.get('posts');

	Posts.find({category: req.params.category},{},function(err, posts){
		res.render('index',{
  			'title': req.params.category,
  			'posts': posts
  		});
	});
});

router.get('/add', function(req, res, next) {
	res.render('addcategory',{
  		'title': 'Add Category'	
	});
});

router.post('/add', function(req, res, next) {
  // Get Form Values
  var name = req.body.name;

  	// Form Validation
	req.checkBody('name','Name field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		res.render('addpost',{
			"errors": errors
		});
	} else {
		//var categories = db.get('categories');
        Categories.create({
			"name": name,
		}, function(err, post){
			if(err){
				res.send(err);
			} else {
				req.flash('success','Category Added');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;