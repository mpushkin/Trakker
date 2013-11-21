
var express = require('express');
var path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);

app.configure(function () {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json()); // part of deprecated bodyParser()
    app.use(express.urlencoded()); // part of deprecated bodyParser()
    app.use(express.methodOverride());
    app.use(express.cookieParser('history is written on the sands of Dune'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});



app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
