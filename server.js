// using express for building web-server
var express = require('express'),
    path = require('path');

// using passport for authentication, wrapping it in our own module
var auth = require('./server/auth');

// separate configuration parameters
var config = require('./server/config');

var app = express();

app.set('port', process.env.PORT || config.port);

app.configure(function () {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.cookieSecret));
    app.use(express.session());
    app.use(auth.initialize());
    app.use(auth.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'client')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

// todo: move to routes
app.post('/login', auth.authenticate());

app.post('/logout', 
    auth.ensureAuthenticated(),
    function (req, res) {
        req.logout();
        res.send(200);
    });

app.post('/signup', auth.registerNewUser());

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
