// reference to main app module
var trakkerApp = angular.module('trakkerApp');

trakkerApp.factory('projectsService', function ($q) {

    var service = {

        getProjects: function (userId) {
            var deferred = $q.defer();

            // for now fake data
            var result = {
                data: [ { id: 0, name: "Learn" },
                        { id: 1, name: "Excersise" },
                        { id: 2, name: "Chores" },
                        { id: 3, name: "Play" },
                ]
            };
            deferred.resolve(result.data);

            return deferred.promise;
        }
    };

    return service;
});