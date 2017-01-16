const colors = require('colors');

exports.DisnodeInfo = function (caller, event, data) {
  console.log(
    "["+colors.cyan(" INFO  ")+"] "+colors.magenta(new Date()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + data);
};


exports.DisnodeError= function (caller, event, data) {
  console.log(
    "["+colors.red(" ERROR ")+"] "+colors.magenta(new Date()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + colors.red(data));
};


exports.DisnodeWarning= function (caller, event, data) {
  console.log(
    "["+colors.yellow("WARNING")+"] "+colors.magenta(new Date()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + colors.yellow(data));
};




exports.DisnodeSuccess= function (caller, event, data) {
  console.log(
    "["+colors.green("SUCCESS")+"] "+colors.magenta(new Date()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + colors.green(data));
};
