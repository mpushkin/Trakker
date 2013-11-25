// reference to main app module
var trakkerApp = angular.module('trakkerApp');

// main controller
trakkerApp.controller('mainCtrl', function ($scope, usersService) {

    $scope.user = null;
    
    // for now login at start
    usersService.login('John', 'pass')
        .then(function (user) {
            $scope.user = user; // todo: maybe through $scope.$apply, either here, or in service
        }, function (error) {
            // todo
        });

});

