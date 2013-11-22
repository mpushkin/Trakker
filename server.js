// using express for building web-server
var express = require('express'),
    path = require('path');

// using passport for authentication, wrapping its use in own module
var auth = require('./auth');

var app = express();

app.set('port', process.env.PORT || 3000);

app.configure(function () {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json()); // part of deprecated bodyParser()
    app.use(express.urlencoded()); // part of deprecated bodyParser()
    app.use(express.methodOverride());
    app.use(express.cookieParser('history is written on the sands of Dune')); // secret
    app.use(express.session());
    app.use(auth.initialize());
    app.use(auth.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', auth.ensureAuthenticated({ failureRedirect: '/login.html' }));

app.post('/login',
    auth.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login.html'
    })
);

app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
