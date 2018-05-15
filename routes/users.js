var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var nodemailer = require('nodemailer');
var async = require('async');
var bcrypt = require('bcryptjs');
let crypto;
try {
    crypto = require('crypto');
} catch (err) {
    console.log('crypto support is disabled!');
}
var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});



router.use(expressValidator({
        customValidators: {
            isUsernameAvailable(username) {
                return new Promise((resolve, reject) => {
                    User.findOne({ username: username }, (err, user) => {
                    if (err) throw err;
                if(user === null) {
                    resolve();
                } else {
                    reject();
                }
            });
            });
            }
        }
    })
);

router.use(expressValidator({
        customValidators: {
            isEmailAvailable(email) {
                return new Promise((resolve, reject) => {
                    User.findOne({ email: email }, (err, email) => {
                        if (err) throw err;
                        if(email === null) {
                            resolve();
                        } else {
                            reject();
                        }
                    });
                });
            }
        }
    })
);



// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.email;
	var password = req.body.password;
	var address = req.body.address;
    var city = req.body.city;
    var country = req.body.country;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('email', 'Email already in use').isEmailAvailable();
	req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('username', 'Username already in use').isUsernameAvailable();
	req.checkBody('password', 'Password is required').notEmpty();
	

    req.asyncValidationErrors().then(() => {
        //no errors, create user
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password,
            address: address,
            city: city,
            country: country

        });

    User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');
   res.json({user:'added'});
    res.redirect('/users/login');
}).catch((errors) => {

        if(errors) {
            res.render('register',{
                errors:errors
            });
        };
});

});

router.post('/api/register', function(req, res, next){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var address = req.body.address;
    var city = req.body.city;
    var country = req.body.country;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('email', 'Email already in use').isEmailAvailable();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('username', 'Username already in use').isUsernameAvailable();
    req.checkBody('password', 'Password is required').notEmpty();
    

    req.asyncValidationErrors().then(() => {
        //no errors, create user
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password,
            address: address,
            city: city,
            country: country

        });

    User.createUser(newUser, function(err, user){
        if(err) throw err;
        //console.log(user);
    });

   res.json({"user":'added'});

}).catch((errors) => {

        if(errors) {
            res.render('register',{
                errors:errors
            });
        };
});

});


router.post('/api/login', function(req, res, next){

    var username = req.body.username;
    var password = req.body.password;

    if(!password || !username) {
        return res.status(400).json({ message: "We need both username and password." });
    }



    User.findOne({username: username}, function(err, user) {

        if (err) {
            return res.status(500).json({ message: ErrorMessages.unknown });
        }

        if (!user) {
            return res.status(400).json({ message: "Woops, wrong username or password." });
        }

       

        User.comparePassword(password, user.password, function(err, isMatch){
        if(err){
             return res.status(500).json({ message: ErrorMessages.unknown });
         } 
        if(isMatch){
           return res.status(200).json({ message: "OK", authToken: "1644465662244666455555", username: username });
        } else {
             return res.status(400).json({ message: "Invalid Password" });
        }
    });

    });

});




passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});


router.get('/forgot', function(req, res) {
    res.render('forgot', {
        user: req.user
    });
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/users/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'xxxx@gmail.com', // generated ethereal user
                    pass: '********'  // generated ethereal password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'bishwajit.lnu@nodejstweetapp.com',
                subject: 'NodejsTweetAPP Password Reset',
                text: 'You are receiving this because you (username: '+user.username +') have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');

            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/users/forgot');
    });
});


router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/forgot');
        }
        res.render('reset', {
            user: req.user
        });
    });
});

router.post('/contact', function(req, res, next) {
              var senderName = req.body.name;
              var senderEmail = req.body.email;
              var message = req.body.body;

            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'xxxxx@gmail.com', // generated ethereal user
                    pass: '*********'  // generated ethereal password
                }
            });
            var mailOptions = {
                to: 'bh222gp@student.lnu.se',
                from: 'bishwajit.lnu@nodejstweetapp.com',
                replyTo:senderEmail,
                subject: 'Contact Form Submission From Travel Blog by '+ senderName,
                text: message
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success_msg', 'Success! Contact form submitted.');
                res.json({'contact':err});
            });
});


router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/users/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'xxxxx@gmail.com', // generated ethereal user
                    pass: '********'  // generated ethereal password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'bishwajit.lnu@nodejstweetapp.com',
                subject: 'NodejsTweetAPP Password Reset',
                text: 'You are receiving this because you (username: '+user.username +') have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');

            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/users/forgot');
    });
});


module.exports = router;