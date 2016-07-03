"use strict"


class YTDownloader {
  constructor(plugin) {
    this.YD = plugin;
  }

  SetOnProgess(func) {
    var self = this;
    self.OnProgress = func;
    console.log("[YoutubeManager] Set On Progress");
  }

  SetOnError(func) {
    var self = this;
    self.OnError = func;
  }

  SetOnFinished(func) {
    var self = this;
    self.OnFinished = func;
  }

  Download(id, name) {
    var self = this;
    self.id = id;
    self.name = name.replace(/['"]+/g, '');
    self.YD.download(this.id, this.name + ".mp3");
    self.YD.on("finished", this.OnFinished);

    self.YD.on("error", this.OnError);

    self.YD.on("progress",this.OnProgress);
  }
}

module.exports = YTDownloader;
