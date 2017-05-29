var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var https = require('https');


/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
        return;
    }

    var docsPerPage = 5;
    var pageNumber = 1;

    User.findPaginated({}, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('users/index', { users: result.documents, nextPage: result.nextPage, user: req.user });
    }, docsPerPage, pageNumber); // pagination options go here
});

router.get('/:id/', function(req, res, next) {
    console.log(req.params);

    var docsPerPage = 5;
    var pageNumber = req.params.id;

    User.findPaginated({}, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('users/index', { users: result.documents, nextPage: result.nextPage, prevPage: result.prevPage, user: req.user });
    }, docsPerPage, pageNumber); // pagination options go here
});

router.get('/:id/edit', function(req, res, next) {
    User.findById(req.params.id).exec(function(err, user) {
            console.log(user);
            console.log(req.user);
            res.render('users/edit', { chosenUser: user, user: req.user });
    });
});

router.post('/:id/edit/update', function(req, res, next) {
    console.log("UPDATE USER INFO")
    User.findById(req.params.id).exec(function(err, user) {
        user.username = req.body.username;
        user.role = req.body.role;
        user.save();
        res.redirect('/users/');
    });
});

router.get('/:id/delete', function(req, res, next) {
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
        return;
    }

    User.findByIdAndRemove(req.params.id, function(err, user) {
        res.redirect('/users/');
    });
});

module.exports = router;