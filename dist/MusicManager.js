"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colors = require('colors');
var walk = require('walk');
var fs = require("fs");
var ytdl = require('ytdl-core');

var MusicManager = function () {
  function MusicManager(options) {
    var _this = this;

    _classCallCheck(this, MusicManager);

    this.options = options;
    this.disnode = options.disnode;

    this.following = [];

    this.defaultConfig = {
      commands: [{
        "cmd": "skip",
        "context": "MusicManager",
        "run": "cmdSkip",
        "desc": "Skips the current song in the queue (slight delay to the skip).",
        "usage": "list [page]"
      }, {
        "cmd": "stream",
        "context": "MusicManager",
        "run": "cmdStream",
        "desc": "Plays an audio file.",
        "usage": "play [url] [volume]"
      }, {
        "cmd": "clearqueue",
        "context": "MusicManager",
        "run": "cmdClearQueue",
        "desc": "Stopps and Clears all URLS's in Queue",
        "usage": "clearqueue"
      }, {
        "cmd": "resume",
        "context": "MusicManager",
        "run": "cmdResume",
        "desc": "Resumes Connection",
        "usage": "resume"
      }, {
        "cmd": "pause",
        "context": "MusicManager",
        "run": "cmdPause",
        "desc": "Pauses Connection",
        "usage": "resume"
      }, {
        "cmd": "jv",
        "context": "MusicManager",
        "run": "cmdJoinVoice",
        "desc": "Joins the voice channel you are connected to.",
        "usage": "jv"
      }, {
        "cmd": "lv",
        "context": "MusicManager",
        "run": "cmdLeaveVoice",
        "desc": "Leaves the voice channel you are connected to.",
        "usage": "lv"
      }, {
        "cmd": "follow",
        "context": "MusicManager",
        "run": "cmdFollowUser",
        "desc": "follows the user to any voice chat",
        "usage": "follow [User]"
      }, {
        "cmd": "unfollow",
        "context": "MusicManager",
        "run": "cmdUnFollowUser",
        "desc": "unfollows the user",
        "usage": "unfollow [parms]"
      }, {
        "cmd": "volume",
        "context": "MusicManager",
        "run": "cmdSetVolume",
        "desc": "sets the volume",
        "usage": "volume [volume]"
      }],
      songs: [],
      maxVolume: 3,
      defaultVolume: 0.8,
      resNoName: "```Please Enter a name for this song!```",
      resNoUrl: "```Please Enter a Youtube URL for this song!```",
      resSongAdded: "```[Song] Added!```",
      resFollow: "**Following: ** [Sender]",
      resUnFollow: "**Stop Following: ** [Sender]",
      resJoiningServer: "**Joining Server: ** [Server]",
      resNotInServer: "**Can't Join You! Try Joining a Channel First!**",
      resMaxVolume: "**Max Volume([MaxVolume]) Reached! Playing at: [DefaultVolume].**",
      resResume: "**Resuming the queue!**",
      resAddedToQueue: "**Added to the queue!**",
      resPause: "**Pausing the queue!**",
      resClearQueue: "**Clearing the queue!**"
    };

    this.config = this.disnode.config.MusicManager || this.defaultConfig;

    if (options.voiceEvents == true) {
      options.disnode.bot.on("voiceJoin", function (c, u) {
        return _this.OnVoiceJoin(c, u);
      });
      options.disnode.bot.on("voiceLeave", function (c, u) {
        return _this.OnVoiceLeave(c, u);
      });
    }
  }

  _createClass(MusicManager, [{
    key: 'OnVoiceJoin',
    value: function OnVoiceJoin(channel, user) {
      if (this.following.includes(user.username)) {
        this.JoinServer(channel);
      }
    }
  }, {
    key: 'OnVoiceLeave',
    value: function OnVoiceLeave(channel, user) {
      if (this.following.includes(user.username)) {
        this.LeaveServer(channel);
      }
    }
  }, {
    key: 'playStream',
    value: function playStream(connection, vol) {
      if (connection.queue[0]) {
        var self = this;
        connection.playRunning = true;
        connection.setVolume(vol);
        connection.ytStream = ytdl(connection.queue[0], { audioonly: true });
        connection.ytStream.on('end', function () {
          if (connection.queue.length == 0) {
            connection.playRunning = false;
          } else {
            self.playStream(connection);
            //connection.ytStream.destory();
          }
        });
        connection.queue.splice(0, 1);
        connection.playRawStream(connection.ytStream);
      } else {
        console.log("No Next Song!");
        if (connection.ytStream) {
          connection.ytStream.destroy();
        }
        connection.playRunning = false;
      }
    }
  }, {
    key: 'addUrl',
    value: function addUrl(url, connection, vol) {
      var bot = this.disnode.bot;

      if (!connection.queue) {
        connection.queue = [];
      }
      connection.queue.push(url);
      if (!connection.playRunning) {
        this.playStream(connection, vol);
      }
    }
  }, {
    key: 'JoinServer',
    value: function JoinServer(channel) {
      var self = this;
      this.disnode.bot.joinVoiceChannel(channel, function (err, connnection) {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  }, {
    key: 'LeaveServer',
    value: function LeaveServer(channel) {
      var self = this;
      this.disnode.bot.leaveVoiceChannel(channel, function (err, connnection) {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  }, {
    key: 'cmdPause',
    value: function cmdPause(parsedMsg) {
      var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

      if (connection) {
        connection.pause();
        this.disnode.sendResponse(parsedMsg, this.config.resPause);
      } else {
        this.disnode.sendResponse(parsedMsg, this.config.resNotInServer);
      }
    }
  }, {
    key: 'cmdResume',
    value: function cmdResume(parsedMsg) {
      var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

      if (connection) {
        connection.resume();
        this.disnode.sendResponse(parsedMsg, this.config.resResume, { parse: true });
      } else {
        this.disnode.sendResponse(parsedMsg, this.config.resNotInServer, { parse: true });
      }
    }
  }, {
    key: 'cmdStream',
    value: function cmdStream(parsedMsg) {
      var self = this;
      var url = parsedMsg.params[0];
      var vol = this.config.defaultVolume || .8;
      if (parsedMsg.params[1]) {
        if (parseFloat(parsedMsg.params[1]) != 'NaN') {
          vol = parseFloat(parsedMsg.params[1]);
        }
      }
      GetVolume(vol, this.config, function (err, res) {
        if (!err) {
          vol = res;
        }
        if (err == "MAX") {
          var shortcuts = [{ shortcut: "[DefaultVolume]", data: self.config.defaultVolume }, { shortcut: "[MaxVolume]", data: self.config.maxVolume }, { shortcut: "[RequestedVolume]", data: vol }];
          self.disnode.sendResponse(parsedMsg, self.config.resMaxVolume, { parse: true, shortcuts: shortcuts });
        }
      });
      var channel = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

      if (channel) {
        var shortcutsAdd = [{ shortcut: "[url]", data: url }, { shortcut: "[channel]", data: channel.voiceChannel.name }, { shortcut: "[vol]", data: vol }];
        this.addUrl(url, channel, vol);
        this.disnode.sendResponse(parsedMsg, self.config.resAddedToQueue, { parse: true, shortcuts: shortcutsAdd });
      } else {
        this.disnode.sendResponse(parsedMsg, "Not In Server!");
      }
    }
  }, {
    key: 'cmdJoinVoice',
    value: function cmdJoinVoice(parsedMsg) {
      var self = this;
      var channel = parsedMsg.msg.author.voiceChannel;

      if (channel) {
        var shortcuts = [{
          shortcut: "[Server]",
          data: channel.name
        }];
        this.JoinServer(channel);
        this.disnode.sendResponse(parsedMsg, this.config.resJoiningServer, { parse: true, shortcuts: shortcuts });
      } else {
        this.disnode.sendResponse(parsedMsg, this.config.resNotInServer, { parse: true });
      }
    }
  }, {
    key: 'cmdLeaveVoice',
    value: function cmdLeaveVoice(parsedMsg) {
      var channel = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections).voiceChannel;
      this.LeaveServer(channel);
    }
  }, {
    key: 'cmdSkip',
    value: function cmdSkip(parsedMsg) {
      var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

      if (connection) {
        if (connection.queue) {
          connection.queue.splice(0, 1);
          this.playStream(connection, 0.8);
        }
      }
    }
  }, {
    key: 'cmdFollowUser',
    value: function cmdFollowUser(parsedMsg) {
      var self = this;
      this.following.push(parsedMsg.msg.author.username);
      console.log(this.following);
      this.disnode.sendResponse(parsedMsg, this.config.resFollow, { parse: true });
    }
  }, {
    key: 'cmdUnFollowUser',
    value: function cmdUnFollowUser(parsedMsg) {
      var index = this.following.indexOf(parsedMsg.msg.author.username);

      this.following.splice(index, 1);

      this.disnode.sendResponse(parsedMsg, this.config.resUnFollow, { parse: true });
    }
  }, {
    key: 'cmdSetVolume',
    value: function cmdSetVolume(parsedMsg) {
      var vol = this.config.defaultVolume || .8;
      if (parsedMsg.params[0]) {
        if (parseFloat(parsedMsg.params[0]) != 'NaN') {
          vol = parseFloat(parsedMsg.params[0]);
        }
      }
      GetVolume(vol, this.config, function (err, res) {
        if (!err) {
          vol = res;
        }
        if (err == "MAX") {
          var shortcuts = [{ shortcut: "[DefaultVolume]", data: self.config.defaultVolume }, { shortcut: "[MaxVolume]", data: self.config.maxVolume }, { shortcut: "[RequestedVolume]", data: vol }];
          self.disnode.sendResponse(parsedMsg, self.config.resMaxVolume, { parse: true, shortcuts: shortcuts });
        }
      });
      var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

      if (connection) {
        connection.setVolume(vol);
      }
    }
  }, {
    key: 'cmdClearQueue',
    value: function cmdClearQueue(parsedMsg) {
      var connection = GetVoiceConnectionViaMsg(parsedMsg.msg, this.disnode.bot.voiceConnections);

      if (connection) {
        connection.queue = [];
        connection.stopPlaying();
        this.disnode.sendResponse(parsedMsg, this.config.resClearQueue);
      } else {
        this.disnode.sendResponse(parsedMsg, this.config.resNotInServer);
      }
    }
  }]);

  return MusicManager;
}();

function GetVoiceConnectionViaMsg(msg, voiceConnections) {
  var connection;

  var serverChannels = msg.server.channels;

  for (var i = 0; i < voiceConnections.length; i++) {
    var channel = voiceConnections[i].voiceChannel;

    if (serverChannels.includes(channel)) {
      connection = voiceConnections[i];
    }
  }

  return connection;
}

function GetVolume(requestedVol, config, cb) {
  var defaultVol = config.defaultVolume || 0.8;
  var maxVol = config.maxVolume || 1;

  if (requestedVol <= maxVol) {

    cb(null, requestedVol);
  } else {
    cb("MAX", defaultVol);
  }
}

module.exports = MusicManager;