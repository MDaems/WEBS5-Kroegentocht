var express = require('express');
var router = express.Router();
var User;

module.exports = function(passport, mongoose){
    User = mongoose.model('User');

    /* GET Login page. */
    router.get('/login', function(req, res, next) {
        res.render('auth/login', { title: 'Login', message: req.flash('loginMessage') });
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/auth/profile', // redirect to the home page
        failureRedirect : '/auth/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    router.get('/signup', function (req, res) {
        res.render('auth/signup', {message: req.flash('signupMessage')});
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/auth/profile',
        failureRedirect: '/auth/signup',
        failureFlash: true
    }));

    router.get('/profile', isLoggedIn, function (req, res) {
        res.render('auth/profile', {
            user : req.user
        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    router.get('/facebook', passport.authenticate('facebook', {
        scope : 'email'
    }));

    // handle the callback after facebook has authenticated the user
    router.get('/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/auth/profile',
        failureRedirect : '/'
    }));

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    router.get('/google', passport.authenticate('google', {
        scope : ['profile', 'email']
    }));

    // the callback after google has authenticated the user
    router.get('/google/callback', passport.authenticate('google', {
        successRedirect : '/auth/profile',
        failureRedirect : '/'
    }));

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/auth/login');
}