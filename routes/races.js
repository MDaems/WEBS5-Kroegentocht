var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Race = mongoose.model('races');
var Waypoint = mongoose.model('waypoints');
var User = mongoose.model('User');

var https = require('https');

var ipget = require('ipware')();
var geo = require('geoip-lite');

var key = "AIzaSyB8dYxd4wvwp1uQUX9dRIQMlMz7aoIFyMw";
var rankby = "distance";
var types = "cafe|restaurant";

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
        return;
    }
    Race.find({}, function(err, races) {
        res.render('races/index', { races: races, user: req.user });
    });
});

router.get('/new', function(req, res, next) {
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
        return;
    }
    race = new Race();
    race.name = "RACE(" + race._id + ")";
    race.save();
    res.redirect('/races/' + race._id + '/edit/');
});

router.get('/:id/race/', function(req, res, next) {
    console.log('GETRACE');
    Race.findById(req.params.id).populate("waypointIds userIds").exec(function(err, race) {
        var loggedIn = false;
        var hasJoined = false;
        var hasWinner = false;

        if (req.user) {
            loggedIn = true;
            for (var i = 0; i < race.userIds.length; i++) {
                if (req.user._id.equals(race.userIds[i]._id)) {
                    hasJoined = true;
                }
            }
        }

        race.checkWinner(1);
         /*   var winnerId = race.getWinnerId(req.user._id);
            if (winnerId) {
                race.winnerId = winnerId;
                race.save();
            }*/

        if (race.winnerId) {
            console.log('WE HAVE A WINNER!');
            User.findById(race.winnerId, function(err, user) {
                res.render('races/race', { race: race, waypoints: race.waypointIds, users: race.userIds, loggedIn: loggedIn, hasJoined: hasJoined, winner: user, user: req.user });
            });
        }
        else {
            console.log('NO WINNER YET');
            res.render('races/race', { race: race, waypoints: race.waypointIds, users: race.userIds, loggedIn: loggedIn, hasJoined: hasJoined, user: req.user });
        }
    });
});

router.post('/:id/race/join', function(req, res, next) {
    console.log('JOIN RACE');
    Race.findByIdAndUpdate(req.params.id, {$push: {"userIds": req.user._id}}, function (err, race) {
        res.redirect('/races/' + req.params.id + '/race/');
    });
});

router.post('/:id/race/checkin', function(req, res, next) {
    console.log('CHECKIN RACE '+ req.body.wayp_id)

    Waypoint.findById(req.body.wayp_id, function(err, waypoint) {

        if (waypoint.containsUser(req.user.id)) {
            res.redirect('/races/' + req.params.id + '/race/');
        }
        else {
            Waypoint.findByIdAndUpdate(req.body.wayp_id, { $push: { "userIds": req.user.id } }, function(err, waypoint) {
                res.redirect('/races/' + req.params.id + '/race/');
            });
        }
    });
});

router.get('/:id/edit/', function(req, res, next) {
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
        return;
    }

    Race.findById(req.params.id).populate("waypointIds").exec(function(err, race) {
        var location = geo.lookup(ipget.get_ip(req).clientIp);

        var lat = 51.560596;
        var long = 5.091914;
        if (location != null) {
            lat = location.ll[0];
            long = location.ll[1];
        }

        var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + lat + "," + long + "&rankby=" + rankby + "&types=" + types;
        console.log(url);
        if (req.query.query) {
            url += "&keyword=" + req.query.query;
        }

        getGoogleResults(url, function(response) {
            res.render('races/edit', { race: race, gPlaces: response.results, waypoints: race.waypointIds, user: req.user });
        });
    });
});

router.post('/:id/edit/update', function(req, res, next) {
    console.log("UPDATE RACE INFO")
    Race.findById(req.params.id, function(err, race) {
        console.log(req.body.name);
        race.name = req.body.name;
        race.save();
        res.redirect('/races/');
    });
});

router.post('/:id/edit/add', function(req, res, next) {
    console.log('ADD PLACE: '+  req.body.google_place_id)
    var url = "https://maps.googleapis.com/maps/api/place/details/json?" + "key=" + key + "&placeid=" + req.body.google_place_id;
    getGoogleResults(url, function(response) {
        response = response.result;

        waypoint = new Waypoint();
        waypoint.gId = response.place_id;
        waypoint.name = response.name;
        waypoint.lat = response.geometry.location.lat;
        waypoint.lng = response.geometry.location.lng;
        waypoint.save();

        Race.findByIdAndUpdate(req.params.id, { $push: { "waypointIds": waypoint._id } }, function(err, race) {
            res.redirect('/races/' + req.params.id + "/edit/");
        });
    });
});

router.post('/:id/edit/delete', function(req, res, next) {
    Race.findByIdAndUpdate(req.params.id, { $pull: { "waypointIds": req.body.waypoint_id } }, function(err, race) {
        res.redirect("/races/" + req.params.id + "/edit/");
    });
});

router.post('/:id/race/start', function(req, res, next) {
    console.log('START-RACE');
    Race.findByIdAndUpdate(req.params.id, { hasStarted: true }, function(err, race) {
        res.redirect("/races/" + req.params.id + "/race/");
    });
});

router.get('/:id/delete', function(req, res, next) {
    if (!req.isAuthenticated()){
        // if they aren't redirect them to the home page
        res.redirect('/auth/login');
        return;
    }
    Race.findByIdAndRemove(req.params.id, function(err, race) {
        res.redirect('/races/');
    });
});

function getGoogleResults(url, callback) {
    https.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var googleResponse = JSON.parse(body);
            var response = googleResponse;
            callback(response);
        });
    }).on('error', function(e){
        console.log("Got an error: ", e);
    });
}

module.exports = router;

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/auth/login');
}