// reference to main app module
var trakkerApp = angular.module('trakkerApp');

// this service takes care of ux process of logging user into application
trakkerApp.factory('loginService', function ($q, $modal, $timeout, usersService) {

    var service = function () {
        this.currentUser = null;
    };

    var loginModel = {
        username: null,
        password: null,
        confirmPassword: null
    }

    var currentDialog = "SignIn";
    var getNextDialogTemplate = function () {
        return "templates/trakker" + currentDialog + ".html";
    }
    var setNextDialogTemplate = function () {
        currentDialog = currentDialog == "SignIn" ? "SignUp" : "SignIn";        
    }

    // private method for showing signIn/signUp dialog
    var showDialog = function () {
        var deferred = $q.defer();

        var dialog = $modal.open({
            templateUrl: getNextDialogTemplate(),
            controller: dialogController,
            backdrop: 'static',
            keyboard: false
        });

        dialog.result.then(function (user) {
            // user successfully logged in
            currentDialog = "SignIn"; // next time show signIn dialog
            deferred.resolve(user);
        }, function () {
            // if user rejected to SignIn, that means he wants to SignUp
            // if user rejected to SignUp, that means he wants to SignIn
            setNextDialogTemplate();
            
            // recursive deferreds =)
            showDialog().then(function (user) {
                deferred.resolve(user);
            }); // no error clause because we don't accept rejections
        })

        return deferred.promise;
    }

    var dialogController = function ($scope) {

        // cleanup model besides username
        loginModel.password = loginModel.confirmPassword = null;

        $scope.model = loginModel;
        $scope.alerts = [];
        $scope.ok = function () {
            // validate
            $scope.alerts = [];
            if (!loginModel.username) {
                $scope.alerts.push({ type: "danger", message: "Please provide <b>User name</b>" });
                return;
            }
            else if (currentDialog == "SignUp" && loginModel.password != loginModel.confirmPassword) {
                $scope.alerts.push({ type: "danger", message: "<b>Password</b> doesn't match <b>Confirm Password</b>" });
                return;
            }

            // actual signIn/singUp            
            if (currentDialog == "SignIn") {
                usersService.login(loginModel.username, loginModel.password)
                    .then(function (user) {
                        $scope.$close(user);
                    }, function (error) {
                        $scope.alerts.push({ type: "danger", message: error });
                    });
            }
            else if (currentDialog == "SignUp") {
                usersService.signup(loginModel.username, loginModel.password)
                    .then(function (user) {
                        $scope.$close(user);
                    }, function (error) {
                        $scope.alerts.push({ type: "danger", message: error });
                    });
            }
        };
        $scope.cancel = function () {
            $scope.$dismiss();
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }

    service.prototype = {

        loginIntoApp: function () {
            var deferred = $q.defer();

            showDialog().then(function (user) {
                deferred.resolve(user);
            });

            return deferred.promise;
        }
        
    }

    return new service();
});