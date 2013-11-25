// reference to main app module
var trakkerApp = angular.module('trakkerApp');

// main controller
trakkerApp.controller('timetableCtrl', function ($scope, projectsService, timeTableService) {

    var timetable = { // scope should reference model, not be a model

        projects: null,

        tableBaseDay: null,
        tableStart: null,
        tableEnd: null,
        tableDays: null,
        tableDropdownDayNative: null,
        tableData: null,

        totalsMode: null,
        totalsStart: null,
        totalsEnd: null,
        totalsData: null,

        rows: null,
        footer: null,
        selectedIndex: null,
    };

    $scope.timetable = timetable;

    // automatical updates
    $scope.$watch('user', function () {
        // user is bound to scope by directive
        if ($scope.user) {
            // if user logged in, request a list of projects
            projectsService.getProjects($scope.user.id)
                .then(function (projects) {
                    timetable.projects = projects;
                }, function (error) {
                    // todo
                });

            // set tableBaseDay to today, this will trigger proper updates of table dates
            timetable.tableBaseDay = moment();

            // also set totals mode and dates
            timetable.totalsMode = "month";
            timetable.totalsStart = moment().startOf('month');
            timetable.totalsEnd = moment().endOf('month');
        }
    });

    $scope.$watch('timetable.tableBaseDay', function () {
        timetable.tableStart = timetable.tableBaseDay.clone().startOf('week'); // set to first day of week based on locale
        timetable.tableEnd = timetable.tableStart.clone().add({ days: 6 });

        timetable.tableDropdownDayNative = timetable.tableStart.toDate();

        timetable.tableDays = _.map(_.range(7), function (i) {
            return timetable.tableStart.clone().add({ days: i });
        });

        timeTableService.getTimeTable($scope.user.id, timetable.tableStart, timetable.tableEnd) // todo: use list of projects
            .then(function (result) {
                timetable.tableData = result;
            }, function (error) {
                // todo
            });
    });
    $scope.$watch('timetable.tableDropdownDayNative', function () {
        var day = moment(timetable.tableDropdownDayNative);
        if (day.diff(timetable.tableStart) != 0) {
            timetable.tableBaseDay = day;
        }
    });

    $scope.updateTableData = function () {
        if (timetable.projects && timetable.tableData) {
            var projects = timetable.projects,
                tableData = timetable.tableData,
                rows = timetable.rows = timetable.rows || [];

            //// first fill projects into rows -- remove deleted and add missing
            //_.forEach(rows, function (r, i) {
            //    if (!_.contains(projects, r.p)) {
            //        rows[i] = false;
            //    }
            //});
            //_.compact.rows();
            _.forEach(projects, function (p) {
                var foundProjectRow = _.find(rows, function (r) { return r.project == p; });
                if (!foundProjectRow) {
                    rows.push({
                        project: p
                    });
                }
            });

            // now fill tableData to corresponding project ids
            _.forEach(rows, function (row) {
                var tableDataRow = _.find(tableData, function (td) { return row.project.id == td.projectId; });
                if (!tableDataRow) {
                    // add row if not found
                    tableDataRow = {
                        projectId: row.project.id,
                        hours: [0, 0, 0, 0, 0, 0, 0] // initialize with empty data
                    };
                    tableData.push(tableDataRow);
                }
                row.hours = tableDataRow.hours;
            });

            $scope.updateFooter();
        }
    }
    $scope.updateFooter = function () {
        timetable.footer = timetable.footer || {};
        timetable.footer.hours = timetable.footer.hours || [0, 0, 0, 0, 0, 0, 0]; // initialize with empty data
        var footerHours = [0, 0, 0, 0, 0, 0, 0];
        _.forEach(timetable.rows, function (row) {
            _.forEach(row.hours, function (hour, i) {
                footerHours[i] += hour;
            });
        });
        _.forEach(footerHours, function (hour, i) {
            timetable.footer.hours[i] = hour;
        });
    }
    $scope.$watch('timetable.projects', $scope.updateTableData);
    $scope.$watch('timetable.tableData', $scope.updateTableData);

    // user interactions    
    $scope.tableHourChanged = function (a1, a2, a3) {
        $scope.updateFooter();
        // todo: _.throttle( saveCurrentRow )
    };
    $scope.tableLeft = function () {
        timetable.tableBaseDay = timetable.tableBaseDay.clone().add({ days: -7 }); // cloning object, otherwise angular $watch didn't recognize changes, maybe there is better way.
    };
    $scope.tableRight = function () {
        timetable.tableBaseDay = timetable.tableBaseDay.clone().add({ days: 7 });
    };
    $scope.tableToToday = function () {
        timetable.tableBaseDay = moment();
    };

    var tmpId = 5; // todo: add real updates
    $scope.addProject = function () {
        timetable.projects.push({ id: tmpId++, name: "New Project" });
        $scope.updateTableData();
    };

});

