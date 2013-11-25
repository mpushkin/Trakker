// reference to main app module
var trakkerApp = angular.module('trakkerApp');

trakkerApp.factory('timeTableService', function ($q, projectsService) {

    var dateFormat = "YYYY.MM.DD";

    var service = {

        getTimeTable: function (userId, tableStart, tableEnd) { // todo: maybe use something other than userId
            var deferred = $q.defer();

            // first get list of projects to request timetable data for
            projectsService.getProjects(userId)
                .then(function (projects) {

                    // for now fake data
                    var result = {
                        data: [
                            {
                                projectId: 0,
                                hours: [0, 3, 2, 2, 3, 0, 0]
                            },
                            {
                                projectId: 1,
                                hours: [8, 2, 1, 0, 5, 0, 7]
                            }
                        ]
                    };
                    deferred.resolve(result.data);

                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        getTotals: function (userId, totalsStart, totalsEnd) {
            var deferred = $q.defer();

            // first get list of projects to request timetable data for

            projectsService.getProjects(userId)
                .then(function (projects) {

                    // for now fake data
                    var result = {
                        data: [
                            {
                                projectId: 0,
                                total: 30
                            },
                            {
                                projectId: 1,
                                total: 25
                            }
                        ]
                    };
                    deferred.resolve(result.data);

                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    };

    return service;
});