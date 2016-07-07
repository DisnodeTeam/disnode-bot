"use strict"


class YoutubeManager {
  constructor(options) {
    console.log("[YTMngr] Init");
    const YoutubeMp3Downloader = require('youtube-mp3-downloader');
    this.YD = new YoutubeMp3Downloader({
      "ffmpegPath": "./libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
      "outputPath": "./audio/", // Where should the downloaded and encoded files be stored?
      "youtubeVideoQuality": "highest", // What video quality should be used?
      "queueParallelism": 2, // How many parallel downloads/encodes should be started?
      "progressTimeout": 1000 // How long should be the interval of the progress reports
    });
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

module.exports = YoutubeManager;
