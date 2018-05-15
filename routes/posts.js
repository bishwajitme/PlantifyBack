var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' })
/*var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');*/
var Posts = require('../models/post');
var Categories = require('../models/category');
var PhyActivity = require('../models/phy-activity');
var Score = require('../models/score');

router.get('/show/:id', function(req, res, next) {
	//var posts = db.get('posts');

	Posts.findById(req.params.id,function(err, post){
		res.render('show',{
  			'post': post
  		});
	});
});


router.get('/api/show/:id', function(req, res, next) {
  //  var posts = db.get('posts');

    Posts.findById(req.params.id,function(err, post){
        res.json(post);
    });
});

router.delete('/api/delete/:id', function(req, res, next) {
    //var posts = db.get('posts');
    var id = req.params.id;
    console.log('id' + id);
    // posts.remove({"_id": db.id(id)});
    // Posts.deleteOne({"_id": id});
    Posts.deleteOne({ _id: id }, function (err) {
        console.log(err);
    });
    // posts.removeById(id);
    res.json({"id":id});

});


router.get('/add', function(req, res, next) {
	//var categories = db.get('categories');

    Categories.find({},{},function(err, categories){
        console.log(categories);
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
      // var posts = db.get('posts');
        Posts.create({
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
    var score = req.body.score;

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
        //var posts = db.get('posts');
        Posts.create({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "mainimage": mainimage,
            'score': score
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
		//var posts = db.get('posts');
		Posts.findById(postid, function(err, post){
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

		//var posts = db.get('posts');

		Posts.update({
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
       // var posts = db.get('posts');
        Posts.findById(postid, function(err, post){
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

     //   var posts = db.get('posts');

        Posts.update({
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



router.post('/api/addpc', function(req, res, next) {
    // Get Form Values
    var activitytype = req.body.activitytype;
    var distance = req.body.distance;
    var duration = req.body.duration;
    var username = req.body.username;
    var exercisedate = new Date();

    // Form Validation
    req.checkBody('activitytype','activitytype field is required').notEmpty();
    req.checkBody('distance','distance field is required but never displayed').notEmpty();
    req.checkBody('duration','duration is not formatted properly').notEmpty();


    // Check Errors
    var errors = req.validationErrors();

    if(errors){
        return res.status(500).json({ message: errors });
    } else {
        //var posts = db.get('posts');
        PhyActivity.create({
            "activitytype": activitytype,
            "distance": distance,
            "duration": duration,
            "date": exercisedate,
            "username": username
        }, function(err, post){
            if(err){
                return res.status(400).json({ message: err });
            } else {
                return res.status(200).json({message:'post'});
            }
        });
    }
});



router.post('/api/addscore', function(req, res, next) {
    // Get Form Values
    var score = req.body.score;
    var categoryID = req.body.category;
    var username = req.body.author;
    var challengedate = new Date();

    // Form Validation
    req.checkBody('score','activitytype field is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if(errors){
        return res.status(500).json({ message: errors });
    } else {
        //var posts = db.get('posts');
        Score.create({
            "score": score,
            "categoryid": categoryID,
            "date": challengedate,
            "username": username
        }, function(err, post){
            if(err){
                return res.status(400).json({ message: err });
            } else {
                return res.status(200).json({message:'post'});
            }
        });
    }
});

router.get('/api/score/:username', function(req, res, next) {

    Score.aggregate([
        { $match: {
            username: req.params.username
        }},
        { $group: {
            _id: "$username",
            total: { $sum: "$score"  },
            count: {$sum: 1}
        }}
    ], function (err, result) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        console.log(result);
        res.json(result);

    });


});

module.exports = router;