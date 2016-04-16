var walk =  require('walk'),fs = require('fs'),
path = require('path')
function Load() {
    var walker = walk.walk("./audio", {
      followLinks: false
    });

  walker.on("file", fileHandler);
  walker.on("errors", errorsHandler); // plural
  walker.on("end", endHandler);

}
  var Clips = [];
var OnComplete;
function fileHandler(root, fileStat, next) {
  fs.readFile(path.resolve(root, fileStat.name), function(buffer) {
    console.log("[Files] Loading: " + fileStat.name);
    var file = fileStat.name;
    var name = file.substring(0, file.indexOf("."));
    var command = "!" + name;
    console.log("[Files] Adding: " + name);
    console.log("[Files] -- Command: " + command);
    console.log("[Files] -- File: " + file);
    Clips.push({
      name: name,
      file: file,
      command: command
    });
    next();
  });
}

function errorsHandler(root, nodeStatsArray, next) {
  nodeStatsArray.forEach(function(n) {
    console.error("[FILE ERROR] " + n.name)
    console.error(n.error.message || (n.error.code + ": " + n.error.path));
  });
  next();
}

function endHandler() {
  console.log("[Files] Finished Loading");
  module.exports.OnComplete();

}

module.exports.Load = Load;
module.exports.AudioFiles = Clips;
module.exports.OnComplete = OnComplete;
