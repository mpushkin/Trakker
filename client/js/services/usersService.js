// reference to main app module
var trakkerApp = angular.module('trakkerApp');

trakkerApp.factory('usersService', function ($q, $http) {

    var service = function () {
    };

    service.prototype = {

        login: function (username, password) {
            var deferred = $q.defer();

            //// for now fake data
            //this.currentUser = { id: 0, name: "John" };
            //deferred.resolve(this.currentUser);

            $http.post('\login', { username: username, password: password })
                .success(function (data, status, headers, config) {
                    var user = data;
                    deferred.resolve(user);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });

            return deferred.promise;
        },

        logout: function () {
            var deferred = $q.defer();

            //this.currentUser = null; // probably send request to server to logout
            //deferred.resolve();

            $http.post('\logout')
                .success(function (data, status, headers, config) {
                    deferred.resolve();
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });

            return deferred.promise;
        },

        signup: function (username, password) {
            var deferred = $q.defer();

            // for now fake data
            //this.currentUser = { id: 0, name: "John" };
            //deferred.resolve(this.currentUser);

            $http.post('\signup', { username: username, password: password })
                .success(function (data, status, headers, config) {
                    var user = data;
                    deferred.resolve(user);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });

            return deferred.promise;
        }
    } 

    // todo: take care of session timeouts

    return new service();
});