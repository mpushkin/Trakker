// reference to main app module
var trakkerApp = angular.module('trakkerApp');

// templates
trakkerApp.directive('trakkerNavBar', function () {
    return {
        scope: {
            user: '='
        },
        templateUrl: "templates/trakkerNavBar.html"
    };
});

trakkerApp.directive('trakkerTimeTable', function () {
    return {
        scope: {
            user: '='
        },
        templateUrl: "templates/trakkerTimeTable.html",
        controller: "timetableCtrl"
    };
});