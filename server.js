// using express for building web-server
var express = require('express'),
    path = require('path');

// using passport for authentication, wrapping it in our own module
var auth = require('./server/auth');

var app = express();

app.set('port', process.env.PORT || 3000);

app.configure(function () {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('history is written on the sands of Dune')); // secret
    app.use(express.session());
    app.use(auth.initialize());
    app.use(auth.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'client')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

auth.setEnsureAuthenticatedRedirect('/login.html');

//app.get('/', auth.ensureAuthenticated());
//app.get('/index.html', auth.ensureAuthenticated()); // todo: think about removing login.html and going fully SPA

app.post('/login',
    auth.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login.html' // todo: respond with error message, and not a redirect.
    })
);

app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/login.html');
});


app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
