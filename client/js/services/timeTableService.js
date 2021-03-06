// reference to main app module
var trakkerApp = angular.module('trakkerApp');

trakkerApp.factory('timeTableService', function ($q, $http) {

    var dateFormat = "YYYY.MM.DD";

    var service = {

        getTimeTable: function (userId, tableStart, tableEnd) { // getting timetable data for all user projects
            var deferred = $q.defer();

            var url = "/users/" + userId + "/timetable";
            var queryParams = {
                from: tableStart.format(dateFormat),
                to: tableEnd.format(dateFormat),
            };
            $http.get(url, { params: queryParams })
                .success(function (result) {
                    var parsedResult = [];
                    _.forEach(result, function (projectEntries) {
                        var projectData = {
                            projectId: projectEntries.projectId,
                            hours: []
                        };
                        for (var day = tableStart.clone() ; day.diff(tableEnd) <= 0 ; day.add({ days: 1 })) {
                            var date = day.format(dateFormat);
                            var foundEntry = _.find(projectEntries.timeentries, function (t) { return t.date == date });
                            projectData.hours.push((foundEntry && foundEntry.hours) || 0);
                        }
                        parsedResult.push(projectData);
                    });
                    deferred.resolve(parsedResult);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        setTimeEntry: function (userId, projectId, date, hours) {
            var deferred = $q.defer();

            var url = "/users/" + userId + "/timetable";
            var data = {
                projectId: projectId,
                date: date.format(dateFormat),
                hours: hours
            };
            $http.post(url, data)
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        getTotals: function (userId, totalsStart, totalsEnd) {
            var deferred = $q.defer();

            var url = "/users/" + userId + "/totals";
            var queryParams = {
                from: totalsStart.format(dateFormat),
                to: totalsEnd.format(dateFormat),
            };
            $http.get(url, { params: queryParams })
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },
    };

    return service;
});