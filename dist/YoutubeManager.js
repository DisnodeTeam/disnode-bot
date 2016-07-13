"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YoutubeManager = function () {
  function YoutubeManager(options) {
    _classCallCheck(this, YoutubeManager);

    console.log("[YTMngr] Init");
    this.disnode = options.disnode;
    this.options = options;
    var YoutubeMp3Downloader = require('youtube-mp3-downloader');
    this.YD = new YoutubeMp3Downloader({
      "ffmpegPath": "./libmeg/bin/ffmpeg.exe", // Where is the FFmpeg binary located?
      "outputPath": "./audio/", // Where should the downloaded and encoded files be stored?
      "youtubeVideoQuality": "highest", // What video quality should be used?
      "queueParallelism": 2, // How many parallel downloads/encodes should be started?
      "progressTimeout": 1000 // How long should be the interval of the progress reports
    });

    this.defaultConfig = {
      responses: {
        msgDownloadProgess: "Downloading...",
        msgDownloadInfo: "Adding Sound [File]",
        msgDownloadFinished: "[Sender] Finished Download! Used [Prefix]play [File]"
      },
      commands: [{
        "cmd": "yt",
        "context": "YoutubeManager",
        "run": "cmdDownloadYT",
        "desc": "Downloads a video as a MP3 using the video ID",
        "usage": "yt [videoID] [CommandName]"
      }]
    };
    this.config = this.disnode.config.YoutubeManager;
  }

  _createClass(YoutubeManager, [{
    key: "SetOnProgess",
    value: function SetOnProgess(func) {
      var self = this;
      self.OnProgress = func;
      console.log("[YoutubeManager] Set On Progress");
    }
  }, {
    key: "SetOnError",
    value: function SetOnError(func) {
      var self = this;
      self.OnError = func;
    }
  }, {
    key: "SetOnFinished",
    value: function SetOnFinished(func) {
      var self = this;
      self.OnFinished = func;
    }
  }, {
    key: "Download",
    value: function Download(id, name) {
      var self = this;
      self.id = id;
      self.name = name.replace(/['"]+/g, '');
      self.YD.download(this.id, this.name + ".mp3");
      self.YD.on("finished", this.OnFinished);

      self.YD.on("error", this.OnError);

      self.YD.on("progress", this.OnProgress);
    }
  }, {
    key: "cmdDownloadYT",
    value: function cmdDownloadYT(parsedMsg) {
      var msg = parsedMsg.msg.content;
      var self = this;

      var firstSpace = msg.indexOf(" ");
      var link = msg.substring(firstSpace + 1, msg.indexOf(" ", firstSpace + 1));
      var file = msg.substring(msg.indexOf(" ", msg.indexOf(link)) + 1, msg.length);

      var progressMessage;

      var responses = self.config.responses;
      var parseString = self.options.disnode.parseString;

      var customShortCuts = [];
      customShortCuts.push({ shortcut: "[File]", data: file });
      customShortCuts.push({ shortcut: "[Prefix]", data: self.disnode.CommandHandler.prefix });

      self.disnode.bot.sendMessage(parsedMsg.msg.channel, parseString(responses.msgDownloadInfo, parsedMsg, customShortCuts));
      self.disnode.bot.sendMessage(parsedMsg.msg.channel, parseString(responses.msgDownloadProgess, parsedMsg, customShortCuts), function (err, sent) {
        progressMessage = sent;
        console.log(err);
      });
      self.SetOnFinished(function (data) {
        self.disnode.bot.updateMessage(progressMessage, parseString(responses.msgDownloadFinished, parsedMsg, customShortCuts));
      });
      self.SetOnError(function (error) {
        self.disnode.bot.updateMessage(progressMessage, error);
      });
      self.disnode.YoutubeManager.SetOnProgess(function (progress) {
        console.log(progress.progress.percentage);
        if (progress.progress.percentage != 100) {
          var percent = Math.round(progress.progress.percentage);
          //bot.updateMessage(progressMessage, "```Downloading..."+percent + "%```");
        }
      });
      self.Download(link, file);
    }
  }]);

  return YoutubeManager;
}();

module.exports = YoutubeManager;