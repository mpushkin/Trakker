// common filters
angular.module('trakkerApp')
    .filter('renderWeekDay', function () {
        return function (weekDay) {
            return "<b>" + weekDay.format("ddd") + "</b>&nbsp;" + weekDay.format("DD");
        }
    })
    .filter('formatMoment', function () {
        return function (date, format) {
            return date.format(format);
        }
    });
