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

require('./server/routes/userRoutes').addRoutes(app);
require('./server/routes/projectRoutes').addRoutes(app);
require('./server/routes/timetableRoutes').addRoutes(app);


app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
