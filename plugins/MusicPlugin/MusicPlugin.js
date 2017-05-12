const logger = require('disnode-logger');
const ytdl = require('ytdl-core');

class MusicPlugin {
  constructor() {
    this.voices = []
  }
  default(command){
    var self = this;
    var msg = "";
    for (var i = 0; i < self.class.commands.length; i++) {
      msg += self.disnode.botConfig.prefix + self.class.config.prefix + " " + self.class.commands[i].cmd + " - " + self.class.commands[i].desc + "\n";
    }
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 3447003,
      author: {},
      fields: [ {
        name: 'Music',
        inline: true,
        value: "Hello, " + command.msg.user + "!",
      },{
        name: 'Commands:',
        inline: true,
        value: msg,
      }, {
        name: 'Discord Server',
        inline: false,
        value: "**Join the Disnode Server for Support and More!:** https://discord.gg/AbZhCen",
      }],
        footer: {}
    });
  }
  commandJoin(command){
    var self = this;
    if(command.msg.server != "DM"){
      var member = self.disnode.bot.GetServerMemberByID(command.msg.userID, command.msg.server);
      if(member.voice_channel_id){
        self.disnode.bot.client.joinVoiceChannel(member.voice_channel_id,function(err,events) {
          if(err){
            console.console.log(err);
          }
          self.disnode.bot.client.getAudioContext(member.voice_channel_id,function(err,stream) {
            if(err){
              console.console.log(err);
            }
            var voicesData = {
              voiceChannel: member.voice_channel_id,
              ytStream: null,
              queue: [],
              playRunning: false
            }
            self.voices.push(voicesData);
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Joined", "I have joined your voice channel!");
          });
        });
      }else {// no voice_channel_id
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You need to be in a voice channel!",16772880);
      }
    }else {// in DM's not in a server
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You cant use this command in a DM channel!",16772880);
    }
  }
  commandLeave(command){
    var self = this;
    if(command.msg.server != "DM"){
      var member = self.disnode.bot.GetServerMemberByID(command.msg.userID, command.msg.server);
      if(member.voice_channel_id){
        for (var i = 0; i < self.voices.length; i++) {
          self.closing = true;
          if(self.voices[i].voiceChannel == member.voice_channel_id){
            self.voices.splice(i,1);
            self.disnode.bot.client.leaveVoiceChannel(member.voice_channel_id);
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Left", "I Left your voice channel!");
            return
          }
        }
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You need to be in the same voice channel as me!",16772880);
      }else {// no voice_channel_id
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You need to be in a voice channel!",16772880);
      }
    }else {// in DM's not in a server
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You cant use this command in a DM channel!",16772880);
    }
  }
  commandPlay(command){
    var self = this;
    if(command.msg.server != "DM"){
      var member = self.disnode.bot.GetServerMemberByID(command.msg.userID, command.msg.server);
      if(member.voice_channel_id){
        for (var i = 0; i < self.voices.length; i++) {
          if(self.voices[i].voiceChannel == member.voice_channel_id){
            var currentVoice = self.voices[i];
            currentVoice.senderChannel = command.msg.channel;
            if(currentVoice.playRunning || currentVoice.queue.length >= 1){
              var url = command.params[0];
              if(url.indexOf("watch?v=") != -1){
                self.addUrl(url, currentVoice);
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Added to queue","**" + url + "** Was added to the queue!");
              }else {
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "That is in invalid url! Must be a youtube video!",16772880);
              }
            }else {
              var url = command.params[0];
              if(url.indexOf("watch?v=") != -1){
                self.addUrl(url, currentVoice);
              }else {
                self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "That is in invalid url! Must be a youtube video!",16772880);
              }
            }
            return
          }
        }
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You need to be in the same voice channel as me!",16772880);
      }else {// no voice_channel_id
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You need to be in a voice channel!",16772880);
      }
    }else {// in DM's not in a server
      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Error", "You cant use this command in a DM channel!",16772880);
    }
  }
  addUrl(url,voice){
    voice.queue.push(url);
    if(!voice.playRunning){
      this.PlayStream(voice);
    }
  }
  PlayStream(voice){
    var self = this;
    console.log("PlayStream Called");
    if(voice.queue[0]){
      voice.playRunning = true;
      self.disnode.bot.SendCompactEmbed(voice.senderChannel, "Playing","**" + voice.queue[0] + "**");
      self.disnode.bot.client.getAudioContext(voice.voiceChannel,function(err,stream) {
        if(err){
          return console.console.log(err);
        }
        console.log("Starting ytdl");
        voice.ytStream = ytdl(voice.queue[0], {filter: "audioonly"}).pipe(stream, {end: false});
        console.log("pipe to stream");
        console.log("Binding end event");
        voice.ytStream.on('end', function(){
          console.log("End event called");
          if(voice.queue.length == 0){
            voice.playRunning = false;
            voice.ytStream.destory();
          }else{
            if(self.closing){
              self.playStream(voice);
            }else {
              self.closing = false;
            }
          }
        });
        voice.queue.splice(0,1);
      });
    }else {
      if(voice.ytStream){
        voice.ytStream.destroy();
      }
      voice.playRunning = false;
    }
  }
}
module.exports = MusicPlugin;
