// reference to main app module
var trakkerApp = angular.module('trakkerApp');

// template
trakkerApp.directive('trakkerNavBar', function () {
    return {
        scope: {
            user: '='
        },
        templateUrl: "templates/trakkerNavBar.html"
    };
});