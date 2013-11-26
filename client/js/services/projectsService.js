// reference to main app module
var trakkerApp = angular.module('trakkerApp');

trakkerApp.factory('projectsService', function ($q, $http) {

    var service = {

        getProjects: function (userId) {
            var deferred = $q.defer();

            var url = "/users/" + userId + "/projects";
            $http.get(url)
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        addProject: function (userId, projectName) {
            var deferred = $q.defer();

            var url = "/users/" + userId + "/projects";
            var data = { name: projectName };
            $http.post(url, data)
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        updateProject: function (userId, projectId, projectName) {
            var deferred = $q.defer();

            var url = "/users/" + userId + "/projects/" + projectId;
            var data = { name: projectName };
            $http.put(url, data)
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        deleteProject: function (userId, projectId) {
            var deferred = $q.defer();

            var url = "/users/" + userId + "/projects/" + projectId;            
            $http.delete(url)
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

    };

    // todo: think about providing userId from loginService.currentUser

    return service;
});