// using passport for authoization
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

// temporary hard-coded solution, will switch to database shortly
var usersMap = {
    "BOB": "pass",
    "BILL": "pass"
}

// configure how authentication is performed
passport.use(new LocalStrategy(
    function (username, password, done) {
        //User.findOne({ username: username }, function (err, user) {
        //    if (err) { return done(err); }
        //    if (!user) {
        //        return done(null, false, { message: 'Incorrect username.' });
        //    }
        //    if (!user.validPassword(password)) {
        //        return done(null, false, { message: 'Incorrect password.' });
        //    }
        //    return done(null, user);
        //});

        username = (username || "").toUpperCase();
        if (!usersMap[username]) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (usersMap[username] !== password) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, { name: username }); // returning user object, will be available through req.user
    }
));

// configure how authenticated user instance is persisted in session
passport.serializeUser(function (user, done) {
    //done(null, user.id);
    done(null, user.name);
});
passport.deserializeUser(function (username, done) {
    //User.findById(id, function (err, user) {
    //    done(err, user);
    //});
    done(null, { name: username });
});

// forward needed passport middleware
exports.initialize = passport.initialize.bind(passport);
exports.session = passport.session.bind(passport);
exports.authenticate = passport.authenticate.bind(passport);

// simple middleware to ensure user is authenticated
exports.ensureAuthenticated = function (options) {
    var failureRedirect = options.failureRedirect;
    return function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect(failureRedirect);
    }
}
