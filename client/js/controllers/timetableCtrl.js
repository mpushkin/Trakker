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

        isWorkingTooMuch: false
    };

    var getEmptyWeekHoursArray = function () {
        return [0, 0, 0, 0, 0, 0, 0]; // useful for initializetion with empty data
    };

    $scope.timetable = timetable;

    // automatical updates
    $scope.$watch('user', function () {
        // user is bound to scope by directive
        if ($scope.user) {
            // clear data if existed previousy
            timetable.projects = tableData = totalsData = rows = null;

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
        if (!timetable.tableBaseDay) return;

        timetable.tableStart = timetable.tableBaseDay.clone().startOf('week'); // set to first day of week based on locale
        timetable.tableEnd = timetable.tableStart.clone().add({ days: 6 });

        timetable.tableDropdownDayNative = timetable.tableStart.toDate();

        timetable.tableDays = _.map(_.range(7), function (i) {
            return timetable.tableStart.clone().add({ days: i });
        });

        timeTableService.getTimeTable($scope.user.id, timetable.tableStart, timetable.tableEnd)
            .then(function (result) {
                timetable.tableData = result;
            }, function (error) {
                // todo
            });
    });
    $scope.$watch('timetable.tableDropdownDayNative', function () {
        if (!timetable.tableDropdownDayNative) return;

        var day = moment(timetable.tableDropdownDayNative);
        if (day.diff(timetable.tableStart) != 0) {
            timetable.tableBaseDay = day;
        }
    });

    $scope.$watchCollection('[timetable.totalsStart, timetable.totalsEnd]', function () {
        if (!timetable.totalsStart || !timetable.totalsEnd) return;

        timeTableService.getTotals($scope.user.id, timetable.totalsStart, timetable.totalsEnd)
            .then(function (result) {
                timetable.totalsData = result;
            }, function (error) {
                // todo
            });
    });

    $scope.updateTableData = function () {
        if (timetable.projects && timetable.tableData && timetable.totalsData) {
            var projects = timetable.projects,
                tableData = timetable.tableData,
                totalsData = timetable.totalsData,
                rows = timetable.rows = timetable.rows || [];

            // first fill missing projects into rows
            _.forEach(projects, function (p) {
                var foundProjectRow = _.find(rows, function (r) { return r.project.id == p.id; });
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
                        hours: getEmptyWeekHoursArray() // initialize with empty data
                    };
                    tableData.push(tableDataRow);
                }
                row.hours = tableDataRow.hours;
            });

            // and fill totalsData to corresponding project ids
            _.forEach(rows, function (row) {
                var totalsDataRow = _.find(totalsData, function (td) { return row.project.id == td.projectId; });
                if (!totalsDataRow) {
                    // add row if not found
                    totalsDataRow = {
                        projectId: row.project.id,
                        total: 0 // initialize with empty data
                    };
                    totalsData.push(totalsDataRow);
                }
                row.total = totalsDataRow.total;
            });

            $scope.updateFooter();
        }
    }
    $scope.updateFooter = function () {
        timetable.footer = timetable.footer || {};
        timetable.footer.hours = timetable.footer.hours || getEmptyWeekHoursArray(); // initialize with empty data
        var footerHours = getEmptyWeekHoursArray();
        _.forEach(timetable.rows, function (row) {
            _.forEach(row.hours, function (hour, i) {
                footerHours[i] += hour;
            });
        });
        timetable.isWorkingTooMuch = false;
        _.forEach(footerHours, function (hour, i) {
            timetable.footer.hours[i] = hour;
            if (hour > 24) timetable.isWorkingTooMuch = true;
        });
        timetable.footer.allTotals = _.reduce(timetable.rows, function (sum, row) { return sum + row.total; }, 0)
    }
    $scope.$watchCollection('[timetable.projects, timetable.tableData, timetable.totalsData]', $scope.updateTableData);    

    // user interactions    
    $scope.tableLeft = function () {
        timetable.tableBaseDay = timetable.tableBaseDay.clone().add({ days: -7 }); // cloning object, otherwise angular $watch didn't recognize changes, maybe there is better way.
    };
    $scope.tableRight = function () {
        timetable.tableBaseDay = timetable.tableBaseDay.clone().add({ days: 7 });
    };
    $scope.tableToToday = function () {
        timetable.tableBaseDay = moment();
    };

    $scope.addProject = function () {
        projectsService.addProject($scope.user.id, "New Project")
            .then(function (result) {
                var project = result;
                timetable.projects.push(project);
                timetable.selectedIndex = timetable.projects.length - 1;
                $scope.updateTableData();
            }, function (error) {
                // todo
            });
    };

    $scope.removeProject = function (rowIndex) {
        var row = timetable.rows[rowIndex];
        var project = row.project;
        projectsService.deleteProject($scope.user.id, project.id)
            .then(function (result) {
                timetable.projects.splice(_.indexOf(timetable.projects, project), 1);
                timetable.rows.splice(rowIndex, 1);
                timetable.selectedIndex = null;
                $scope.updateTableData();
            }, function (error) {
                // todo
            });        
    };

    $scope.tableProjectNameChanged = function (rowIndex) {
        // todo: _.throttle()
        var row = timetable.rows[rowIndex];
        var project = row.project;
        projectsService.updateProject($scope.user.id, project.id, project.name)
            .then(function (result) {
                // row.project = result;                
            }, function (error) {
                // todo
            });
    };

    // workaround for ng-changed not notifying about old value
    var heldHoursValue = null;
    $scope.holdHoursValue = function (hours) {
        heldHoursValue = hours;
    }

    $scope.tableHourChanged = function (rowIndex, hourIndex) {
        // todo: _.throttle()
        var row = timetable.rows[rowIndex];
        var project = row.project;
        var date = timetable.tableDays[hourIndex];
        var hours = row.hours[hourIndex];

        if (!_.isNumber(hours)) // may happen because of validation
            return;

        timeTableService.setTimeEntry($scope.user.id, project.id, date, hours)
            .then(function (result) {
                // all's fine with the world
            }, function (error) {
                // todo
            });

        if (timetable.totalsStart.diff(date) <= 0 && date.diff(timetable.totalsEnd) <= 0) {
            row.total += hours - heldHoursValue;
            heldHoursValue = hours;
        }
        $scope.updateFooter();
    };
});

