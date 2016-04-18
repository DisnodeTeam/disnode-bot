"use strict"

class Downloader {
  constructor(plugin) {

    this.YD = plugin;

  }

  SetOnProgess(func) {
    this.OnProgress = func;
    console.log("[YoutubeManager] Set On Progress");
  }

  SetOnError(func) {
    this.OnError = func;
  }

  SetOnFinished(func) {
    this.OnFinished = func;
  }

  Download(id, name) {
    this.id = id;
    this.name = name;
    this.YD.download(this.id, this.name + ".mp3");
    this.YD.on("finished", this.OnFinished);

    this.YD.on("error", function(error) {
      OnError(error);
    });

    this.YD.on("progress",this.OnProgress);
  }
}

module.exports.Downloader = Downloader;
