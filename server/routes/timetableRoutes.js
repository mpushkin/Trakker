var auth = require('../auth'),
    User = require('../storage').User,
    Project = require('../storage').Project,
    TimeEntry = require('../storage').TimeEntry;

exports.addRoutes = function (app) {

    // optimized methods for processing timetable

    // gets timetable for all user projects between requested dates
    app.get('/users/:uid/timetable',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var dateFrom = req.query.from;
            var dateTo = req.query.to;
            if (!dateFrom || !dateTo)
                return res.send(400, "Incorrect parameters, please provide 'from' and 'to' dates.");

            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                // get list of all user projects
                user.projects(function (err, projects) {
                    if (err) return next(err);
                    // get needed timeentries
                    var query = {
                        'projectId': { 'inq': projects.map(function (p) { return p.id; }) },
                        'date': { 'between': [dateFrom, dateTo] }
                    };                    
                    TimeEntry.all({ where: query }, function(err, timeentries) {
                        if (err) return next(err);
                        // format output grouped by projectIds                        
                        var projectEntries = {};
                        timeentries.forEach(function (t) {
                            if (!projectEntries[t.projectId])
                                projectEntries[t.projectId] = [];
                            projectEntries[t.projectId].push({
                                date: t.date,
                                hours: t.hours
                            });
                        });
                        var result = [];
                        for (var projectId in projectEntries) {
                            result.push({
                                projectId: projectId,
                                timeentries: projectEntries[projectId]
                            });
                        };
                        return res.send(result);
                    });
                });
            });
        });

    // updates value of a single timeentry
    app.post('/users/:uid/timetable',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var projectId = req.body.projectId;
            var date = req.body.date;
            var hours = req.body.hours;
            if (!projectId || !date)
                return res.send(400, "Incorrect parameters, please provide 'projectId' and 'date' parameters.");

            var query = {
                projectId: { 'inq': [ projectId] }, // otherwise foreign key was not correctly recognized
                date: date
            };
            // get specified timeentry
            TimeEntry.all({ where: query, limit: 1 }, function (err, timeentries) {
                if (err) return next(err);
                var timeentry = timeentries && timeentries.length > 0 && timeentries[0];
                if (timeentry) {
                    // on existing timeentry
                    if (hours > 0) {
                        // if hours > 0 - update it
                        timeentry.updateAttributes({hours: hours}, function(err, timeentry) {
                            if (err) return next(err);
                            res.send(200);
                        });
                    }
                    else {
                        // else delete it
                        timeentry.destroy(function(err) {
                            if (err) return next(err);
                            res.send(200);
                        });
                    }
                }
                else {
                    // or create it if it doesn't exist
                    var timeEntryData = {
                        projectId: projectId,
                        date: date,
                        hours: hours
                    };
                    TimeEntry.create(timeEntryData, function (err, timeentry) {
                        if (err) return next(err);                    
                        res.send(200);
                    });
                };
            });
        });

    // calculates totals for all user projects between requested dates
    app.get('/users/:uid/totals',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var dateFrom = req.query.from;
            var dateTo = req.query.to;
            if (!dateFrom || !dateTo)
                return res.send(400, "Incorrect parameters, please provide 'from' and 'to' dates.");

            User.find(req.params.uid, function (err, user) {
                if (err) return next(err);
                // get list of all user projects
                user.projects(function (err, projects) {
                    if (err) return next(err);
                    // get needed timeentries
                    var query = {
                        'projectId': { 'inq': projects.map(function (p) { return p.id; }) },
                        'date': { 'between': [dateFrom, dateTo] }
                    };
                    TimeEntry.all({ where: query }, function (err, timeentries) {
                        if (err) return next(err);
                        // format output grouped by projectIds
                        var projectTotals = {};
                        timeentries.forEach(function (t) {
                            if (!projectTotals[t.projectId])
                                projectTotals[t.projectId] = 0;
                            projectTotals[t.projectId] += t.hours;
                        });
                        var result = [];
                        for (var projectId in projectTotals) {
                            result.push({
                                projectId: projectId,
                                total: projectTotals[projectId]
                            });
                        };
                        return res.send(result);
                    });
                });
            });
        });



    // generic rest methods, not all(if any) are used, but added for consistency
    app.get('/projects/:pid/timeentries',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            Project.find(req.params.pid, function (err, project) {
                if (err) return next(err);
                // get list of all time entries
                project.timeentries(function (err, timeentries) {
                    if (err) return next(err);
                    res.send(timeentries);
                });
            });
        });

    app.get('/projects/:pid/timeentries/:tid',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            Project.find(req.params.pid, function (err, project) {
                if (err) return next(err);
                // get project timeentry by id
                project.timeentries.find(req.params.tid, function (err, timeentry) {
                    if (err) return next(err);
                    res.send(timeentry);
                });
            });
        });

    app.post('/projects/:pid/timeentries',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var timeentryData = {
                date: req.body.date, // date is a string in "YYYY.MM.DD" format, this simplifies processing
                hours: req.body.hours
            };
            Project.find(req.params.pid, function (err, project) {
                if (err) return next(err);
                // create new timeentry
                project.timeentries.create(timeentryData, function (err, timeentry) {
                    if (err) return next(err);
                    res.send(201, timeentry);
                });
            });
        });

    app.put('/projects/:pid/timeentries/:tid',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            var timeentryData = {
                date: req.body.date,
                hours: req.body.hours
            };
            Project.find(req.params.pid, function (err, project) {
                if (err) return next(err);
                project.timeentries.find(req.params.tid, function (err, timeentry) {
                    if (err) return next(err);
                    // update timeentry data
                    timeentry.updateAttributes(timeentryData, function (err, timeentry) {
                        if (err) return next(err);
                        res.send(timeentry);
                    });
                });
            });
        });

    app.delete('/projects/:pid/timeentries/:tid',
        auth.ensureAuthenticated(),
        function (req, res, next) {
            Project.find(req.params.pid, function (err, project) {
                if (err) return next(err);
                project.timeentries.find(req.params.tid, function (err, timeentry) {
                    if (err) return next(err);
                    // delete timeentry
                    timeentry.destroy(function (err) {
                        if (err) return next(err);
                        res.send(200);
                    });
                });
            });
        });

}