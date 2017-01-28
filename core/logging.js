const colors = require('colors');


function TimeCode(){
  var time = new Date();
  var finalString = "31";
  finalString = (time.getMonth() + 1 ) + "/" + time.getDate() + "/"+time.getFullYear();
  finalString += " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
  return finalString;
}

exports.DisnodeInfo = function (caller, event, data) {
  console.log(
    "["+colors.cyan(" INFO  ")+"] "+colors.magenta(TimeCode()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + data);
};


exports.DisnodeError= function (caller, event, data) {
  console.log(
    "["+colors.red(" ERROR ")+"] "+colors.magenta(TimeCode()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + colors.red(data));
};


exports.DisnodeWarning= function (caller, event, data) {
  console.log(
    "["+colors.yellow("WARNING")+"] "+colors.magenta(TimeCode()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + colors.yellow(data));
};




exports.DisnodeSuccess= function (caller, event, data) {
  console.log(
    "["+colors.green("SUCCESS")+"] "+colors.magenta(TimeCode()) +
    " [" +
    colors.grey(caller) + " " +
    colors.cyan("(" + event + ")")  +
    "] " + colors.green(data));
};
