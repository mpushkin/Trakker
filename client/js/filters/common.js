// common filters
angular.module('trakkerApp')
    .filter('renderWeekDay', function () {
        return function (weekDay) {
            return "<b>" + weekDay.format("ddd") + "</b>&nbsp;" + weekDay.format("DD");
        }
    })
    .filter('renderTableHour', function () {
        return function (hour) {
            if (_.isNumber(hour)) {
                return "<span" + (hour == 0 ? " class='text-muted'" : "") + ">" + hour + "</span>";
            }
            else {
                return "<span class='text-danger'>!!</span>";
            }
        }
    })
    .filter('formatMoment', function () {
        return function (date, format) {
            return date ? date.format(format) : "";
        }
    });
