var auth = require('../auth');

exports.addRoutes = function (app) {

    app.post('/login', auth.authenticate());

    app.post('/logout',
        auth.ensureAuthenticated(),
        function (req, res) {
            req.logout();
            res.send(200);
        });

    app.post('/signup', auth.registerNewUser());

}