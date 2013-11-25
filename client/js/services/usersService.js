// reference to main app module
var trakkerApp = angular.module('trakkerApp');

trakkerApp.factory('usersService', function ($q) {

    var service = function () {
        this.currentUser = null;
    };

    service.prototype = {

        login: function (username, password) {
            var deferred = $q.defer();

            // for now fake data
            this.currentUser = { id: 0, name: "John" };
            deferred.resolve(this.currentUser);

            return deferred.promise;
        },

        logout: function () {
            var deferred = $q.defer();

            this.currentUser = null; // probably send request to server to logout
            deferred.resolve();

            return deferred.promise;
        },

        signup: function (username, password) {
            var deferred = $q.defer();

            // for now fake data
            this.currentUser = { id: 0, name: "John" };
            deferred.resolve(this.currentUser);

            return deferred.promise;
        }
    } 

    // todo: take care of session timeouts

    return new service();
});