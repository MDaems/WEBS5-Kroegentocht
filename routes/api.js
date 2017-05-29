var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var Race = mongoose.model('races');
var Waypoint = mongoose.model('waypoints');
var User = mongoose.model('User');

var perPage = 5;

// =====================================
// USER ROUTES =========================
// =====================================
router.get('/all/users', isAdmin, function(req, res){
    User.find({},{},function(e,docs){
        res.json(docs);
    });
});

router.get('/noauth/users', function(req, res){
    User.find({},{},function(e,docs){
        res.json(docs);
    });
});

router.get('/user/:id', isAdmin, function(req, res){
    var id = req.params.id;
    User.findOne({'_id': id}, function(e,docs){
        res.json(docs);
    });
});

router.get('/user/name/:username', isAdmin, function(req, res){
    var username = req.params.username;
    User.find({$or: [{'local.username': username}, {'facebook.name': username}, {'google.name': username}]},{},function(e,docs){
        res.json(docs);
    });
});

router.get('/noauth/user/name/:username', function(req, res){
    var username = req.params.username;
    User.findOne({$or: [{'username': username}]},{},function(e,docs){
        res.json(docs);
    });
});


router.post('/user/newuser', isAdmin, function(req, res){
    var newUser = new User();
    newUser.local.email = req.body.email;
    newUser.local.username = req.body.username;
    newUser.local.password = newUser.generateHash(req.body.password);
    newUser.role = req.body.role;

    newUser.save(function (err) {
        res.send(
            (err === null) ? { message: 'The new user was succesfully created.', code: 201 } : { message: err, code: 400}
        );
    });
});

router.post('/noauth/user/newuser', function(req, res){
    var newUser = new User();
    newUser.local.email = req.body.email;
    newUser.local.username = req.body.username;
    newUser.local.password = newUser.generateHash(req.body.password);
    newUser.role = req.body.role;

    newUser.save(function (err) {
        res.send(
            (err === null) ? { message: 'The new user was succesfully created.', code: 201 } : { message: err, code: 400}
        );
    });
});

router.put('/user/edit', isAdmin, function(req, res){
    var oldUser = req.body.user;

    User.findOne({ _id: oldUser.id }, function (err, doc){
        if(oldUser.local){
            doc.local.email = oldUser.local.email;
            doc.local.username = oldUser.local.name;
        }
        if(oldUser.google){
            doc.google.email = oldUser.google.email;
            doc.google.name = oldUser.google.name;
        }
        if(oldUser.facebook){
            doc.facebook.email = oldUser.facebook.email;
            doc.facebook.name = oldUser.facebook.name;
        }
        doc.role = oldUser.role;
        doc.save(function (err) {
            res.send(
                (err === null) ? { message: 'The user was succesfully updated.', code: 201 } : { message: err, code: 400}
            );
        });
    });
});

router.delete('/user/delete/:id', isAdmin, function(req, res){
    User.remove({_id: req.params.id}, function(err) {
        if (err) {
            res.send("An error has occured: ---- " + err);
        }

        res.json({ message: 'Successfully deleted' });
    });
});

// =====================================
// RACE ROUTES =========================
// =====================================
router.get('/races/', function(req, res) {
    Race.find(function(err, races) {
        res.json(races);
    });
});

router.get('/race/new/', function(req, res) {
    var race = new Race();
    race.save();
    res.json(race._id);
});

router.put('/race/:id/edit/', function(req, res) {
    Race.findById(req.params.id ,function(err, race) {
        var success = false;
        if (req.body.name) {
            race.name = req.body.name;
            success = true;
        }
        res.json({ success: success });
    });
});

router.get('/race/:id/', function(req, res) {
    Race.findById(req.params.id ,function(err, race) {
        console.log(race);
        res.json(race);
    });
});

router.put('/race/:id/start/', function(req, res) {
    Race.findById(req.params.id, function(err, race) {
        race.hasStarted = true;
        race.save();
        res.json({ success: true });
    });
});

router.get('/race/:id/waypoints/', function(req, res) {
    Race.findById(req.params.id).populate('waypointIds').exec(function(err, race) {
        res.json(race.waypointIds);
    });
});

router.post('/race/:id/waypoints/add/', function(req, res) {
    console.log(req.body.name);
    console.log(req.body.lat);
    console.log(req.body.long);
    if (req.body.name && req.body.lat && req.body.long) {
        var waypoint = new Waypoint();
        waypoint.name = req.body.name;
        waypoint.lat = req.body.lat;
        waypoint.long = req.body.long;
        waypoint.save();
    }
    else {
        res.json({
            success: false,
            error: "Missing POST variables"
        });
        return;
    }

    Race.findByIdAndUpdate(req.params.id, { $push: { "waypointIds": waypoint._id } }, function(err, race) {
        res.json({
            success: true
        });
        return;
    });
});

router.get('/race/:id/users/', function(req, res) {
    Race.findById(req.params.id).populate('userIds').exec(function(err, race) {
        res.json(race.userIds);
    });
});

router.get('/waypoints/', function(req, res) {
    Waypoint.find(function(err, waypoints) {
        res.json(waypoints);
    });
});

router.delete('/waypoint/:id/delete/', function(req, res) {
    Waypoint.findByIdAndRemove(req.params.id, function (err, waypoint) {
        var success = true;
        if (err) {
            success = false;
        }
        res.json({success: success});
    });
});

module.exports = router;

function isAdmin(req, res, next) {
    // if user is authenticated in the session, carry on
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
    }
    //Check if the role is correct
    if (req.user.role.toLowerCase() === 'admin'){
        return next();
    } else {
        res.send(401, 'Unauthorized');
    }
}