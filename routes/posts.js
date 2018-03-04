var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' })
var mongo = require('mongodb');
var db = require('monk')('mongodb://travelblog:travelblog@ds255768.mlab.com:55768/travelblog');

router.get('/show/:id', function(req, res, next) {
	var posts = db.get('posts');

	posts.findById(req.params.id,function(err, post){
		res.render('show',{
  			'post': post
  		});
	});
});


router.get('/api/show/:id', function(req, res, next) {
    var posts = db.get('posts');

    posts.findById(req.params.id,function(err, post){
        res.json(post);
    });
});

router.post('/api/delete', function(req, res, next) {
    var posts = db.get('posts');
    var id = req.body.id;

    // userData.remove({"_id": db.id(id)});
    posts.removeById(id);
});

router.get('/add', function(req, res, next) {
	var categories = db.get('categories');

	categories.find({},{},function(err, categories){
		res.render('addpost',{
  			'title': 'Add Post',
  			'categories': categories
  		});
	});
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
    // Get Form Values
    var title = req.body.title;
    var category= req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    // Check Image Upload
    if(req.file){
        var mainimage = req.file.filename
    } else {
        var mainimage = 'noimage.jpg';
    }

    // Form Validation
    req.checkBody('title','Title field is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if(errors){
        res.render('addpost',{
            "errors": errors
        });
    } else {
        var posts = db.get('posts');
        posts.insert({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "mainimage": mainimage
        }, function(err, post){
            if(err){
                res.send(err);
            } else {
                req.flash('success','Post Added');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});




router.post('/api/add', upload.single('image'), function(req, res, next) {
    // Get Form Values
    var title = req.body.title;
    var category= req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();
    var location = req.body.location;

    // Check Image Upload
    if(req.file){
        var mainimage = req.file.filename
    } else {
        var mainimage = 'noimage.jpg';
    }

    // Form Validation
    req.checkBody('title','Title field is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if(errors){
        res.render('addpost',{
            "errors": errors
        });
    } else {
        var posts = db.get('posts');
        posts.insert({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "mainimage": mainimage,
            "location":location
        }, function(err, post){
            if(err){
                res.send(err);
            } else {
                res.json({post:'post'});
            }
        });
    }
});


router.post('/images', upload.single('image'), function(req, res, next)  {
    console.log("call image uploading api");
    if(req.file){
        var mainimage = req.file.filename
    } else {
        var mainimage = 'noimage.jpg';
    }
    var images = db.get('images');
    images.insert({
        "mainimage": mainimage,
    }, function(err, post){
        if(err){
            res.send({"image":mainimage});
        } else {
            res.json({"image":mainimage});
        }
    });
});

router.post('/addcomment', function(req, res, next) {
  // Get Form Values
  var name = req.body.name;
  var email= req.body.email;
  var body = req.body.body;
  var postid= req.body.postid;
  var commentdate = new Date();

  	// Form Validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required but never displayed').notEmpty();
	req.checkBody('email','Email is not formatted properly').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		var posts = db.get('posts');
		posts.findById(postid, function(err, post){
			res.render('show',{
				"errors": errors,
				"post": post
			});
		});
	} else {
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentdate": commentdate
		}

		var posts = db.get('posts');

		posts.update({
			"_id": postid
		},{
			$push:{
				"comments": comment
			}
		}, function(err, doc){
			if(err){
				throw err;
			} else {
				req.flash('success', 'Comment Added');
				res.location('/posts/show/'+postid);
				res.redirect('/posts/show/'+postid);
			}
		});
	}
});



router.post('/api/addcomment', function(req, res, next) {
    // Get Form Values
    var name = req.body.name;
    var email= req.body.email;
    var body = req.body.body;
    var postid= req.body.postid;
    var commentdate = new Date();

    // Form Validation
    req.checkBody('name','Name field is required').notEmpty();
    req.checkBody('email','Email field is required but never displayed').notEmpty();
    req.checkBody('email','Email is not formatted properly').isEmail();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if(errors){
        var posts = db.get('posts');
        posts.findById(postid, function(err, post){
            res.render('show',{
                "errors": errors,
                "post": post
            });
        });
    } else {
        var comment = {
            "name": name,
            "email": email,
            "body": body,
            "commentdate": commentdate
        }

        var posts = db.get('posts');

        posts.update({
            "_id": postid
        },{
            $push:{
                "comments": comment
            }
        }, function(err, doc){
            if(err){
                throw err;
            } else {
               // req.flash('success', 'Comment Added');
                console.log('Comment added')

            }
        });
    }
});


module.exports = router;