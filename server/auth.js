// using passport for authorization
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('./storage').User;

// configure how authentication is performed
var authStrategy = new LocalStrategy(
    function (username, password, done) {
        // todo: think about uppercase usernames
        User.all({ where: { name: username }, limit: 1 }, function (err, users) {
            if (err) { return done(err); }
            var user = users && users.length > 0 && users[0];
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    });
passport.use(authStrategy);

// configure how authenticated user instance is persisted in session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.find(id, function (err, user) {
        done(err, user);
    });    
});

// forward needed passport middleware
exports.initialize = passport.initialize.bind(passport);
exports.session = passport.session.bind(passport);

// authenticate login request using local strategy
exports.authenticate = function () {
    return function (req, res, next) {
        passport.authenticate(authStrategy.name, function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.send(401, info.message); }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                return res.send(200, getUserInfo(user));
            });
        })(req, res, next);
    }
}

// ensure user is already authenticated when performing non-login requests
exports.ensureAuthenticated = function () {
    return function (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.send(401, "Unauthorized access, please login.");
    }
}

// register a new user, checking that he has unique name
exports.registerNewUser = function () {
    return function (req, res, next) {
        var username = req.body[authStrategy._usernameField || "username"];
        var password = req.body[authStrategy._passwordField || "password"];
        User.all({ where: { name: username }, limit: 1 }, function (err, users) {
            if (err) { return next(err); }
            var user = users && users.length > 0 && users[0];
            if (user) {
                return res.send(409, "User with such name already exists");
            }
            User.create({ name: username, password: password }, function (err, user) {
                if (err) { return next(err); }
                req.logIn(user, function (err) {
                    if (err) { return next(err); }
                    return res.send(201, getUserInfo(user));
                });
            });
        });
    }
}

// send only selected user properties, not all internal information
function getUserInfo(user) {
    return {
        id: user.id,
        name: user.name
    }
}

