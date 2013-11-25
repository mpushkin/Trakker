// reference to main app module
var trakkerApp = angular.module('trakkerApp');

// main controller
trakkerApp.controller('mainCtrl', function ($scope, loginService) {

    // reference to logged in user
    $scope.user = null;

    $scope.loginUser = function () {
        loginService.loginIntoApp().then(function (user) { // todo: maybe through $scope.$apply, either here, or in service
            // setting logged in user to root scope, will trigger updates of ui
            $scope.user = user;
        });
    };

    $scope.logoutUser = function () {
        $scope.user = null;
        // todo: maybe send a request to logout
        $scope.loginUser();
    };

    // login at start
    $scope.loginUser();

});

