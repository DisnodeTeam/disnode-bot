"use strict"


class YoutubeManager {
  constructor(options) {
    console.log("[YTMngr] Init");
    this.disnode = options.disnode;
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

  cmdDownloadYT(parsedMsg) {
		var msg = parsedMsg.msg.content;
		var self = this;

		var firstSpace =msg.indexOf(" ");
		var link = msg.substring(firstSpace + 1, msg.indexOf(" ", firstSpace + 1));
		var file = msg.substring(msg.indexOf(" ",msg.indexOf(link)) + 1,msg.length);

		var progressMessage;



		self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Video Code: "+link+" Command Name: "+file+"```" );
		self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Downloading... ```", function(err, sent) {
			progressMessage = sent;
			console.log(err);
		});

		self.SetOnFinished(function(data){
			self.disnode.bot.updateMessage(progressMessage, "``` Finished. Use '" + self.CommandHandler.prefix + "play "+file+"'```");
		});
		self.SetOnError(function(error){
			self.disnode.bot.updateMessage(progressMessage, error);
		});
		self.disnode.YoutubeManager.SetOnProgess(function(progress){
			console.log(progress.progress.percentage);
			if(progress.progress.percentage != 100){
				var percent = Math.round(progress.progress.percentage);
				//bot.updateMessage(progressMessage, "```Downloading..."+percent + "%```");
			}
		});
		self.Download(link, file);
	}
}

module.exports = YoutubeManager;
