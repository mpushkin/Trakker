var auth = require('../auth'),
    User = require('../storage').User,
    Project = require('../storage').Project;

exports.addRoutes = function (app) {

    app.get('/users/:uid/projects',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                // get list of user projects
                user.projects(function (err, projects) {
                    if (err) return next(err);
                    res.send(projects);
                });
            });
        });

    app.get('/users/:uid/projects/:pid',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                // get user project by id
                user.projects.find(req.params.pid, function (err, project) {
                    if (err) return next(err);
                    res.send(project);
                });
            });
        });

    app.post('/users/:uid/projects',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var projectData = {
                name: req.body.name
            };
            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                // create new project, todo: validate name
                user.projects.create(projectData, function (err, project) {
                    if (err) return next(err);
                    res.send(201, project);
                });
            });
        });

    app.put('/users/:uid/projects/:pid',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var projectData = {
                name: req.body.name
            };
            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                user.projects.find(req.params.pid, function (err, project) {
                    if (err) return next(err);
                    // update project name
                    project.updateAttributes(projectData, function (err, project) {
                        if (err) return next(err);
                        res.send(project);
                    });
                });
            });
        });

    app.delete('/users/:uid/projects/:pid',
        auth.ensureAuthenticated(),
        function (req, res, next) {            
            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                user.projects.find(req.params.pid, function (err, project) {
                    if (err) return next(err);
                    // delete project
                    project.destroy(function (err) {
                        if (err) return next(err);
                        res.send(200);
                    });
                });
            });
        });

    // todo: add checks that projects actually belong to authenticated user, not to somebody else

}