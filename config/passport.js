var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');
var User;

module.exports = function (passport, mongoose) {

    User = mongoose.model('User');

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL-SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            process.nextTick(function () {
                var email = req.body.email;
                //User.findOne({'local.username': username}, function (err, user) {
                User.findOne({$or: [{'local.email': email}, {'local.username': username}]}, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'Het e-mailadres of de gebruikersnaam is al in gebruik.'));
                    } else {
                        var newUser = new User();
                        newUser.username = username;
                        newUser.local.email = email;
                        newUser.local.username = username;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.role = 'user';

                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    // =========================================================================
    // LOCAL-LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) { // callback with username/email and password from our form
            // find a user whose username/email is the same as the forms username/email
            // we are checking to see if the user trying to login already exists
            User.findOne({$or: [{'local.email': username}, {'local.username': username}]}, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err) {
                    console.log(err);
                    throw err;
                }

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'Geen gebruiker gevonden.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oeps! Het verkeerde wachtwoord.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            profileFields   : ["emails", "displayName", "name"]
            //passReqToCallback : true
        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {
                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err) {
                        return done(err);
                    }
                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.role = 'user';

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err) {
                                console.log(err);
                                throw err;
                            }
                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL

        },
        function(token, refreshToken, profile, done) {
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {

                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser          = new User();

                        // set all of the relevant information
                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.email = profile.emails[0].value; // pull the first email
                        newUser.google.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.role = 'user';

                        // save the user
                        newUser.save(function(err) {
                            if (err) {
                                console.log(err);
                                throw err;
                            }
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));
};