const Logging = require('disnode-logger');

class Stats {
  constructor(disnode) {
    var self = this;
    this.disnode = disnode;
    this.startDateTime = new Date();
    this.messages = 0;
    this.messagesParsed = 0;
    this.serverCount = 0;
    this.memberCount = 0;
    this.channelCount = 0;
    this.directMessageCount = 0;

    this.pluginManagers = 0;
    this.commandManagers = 0;
    this.pluginInstances = 0;
    var self = this;
  }
  getUptime(){
    var self = this;
    var currentTime = new Date();
    var elapsed = currentTime - self.startDateTime;
    var weeks = 0;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = parseInt(elapsed / 1000);
    while (seconds > 60) {
      minutes++;
      seconds -= 60;
      if (minutes == 60) {
        hours++;
        minutes = 0;
      }
      if (hours == 24) {
        days++
        hours = 0;
      }
    }
    if (days > 0) {
      return days + " days, " + hours + " hours, " + minutes + " minutes and " + seconds + " seconds.";
    } else if (hours > 0) {
      return hours + " hours, " + minutes + " minutes and " + seconds + " seconds.";
    } else if (minutes > 0) {
      return minutes + " minutes and " + seconds + " seconds.";
    } else {
      return seconds + " seconds.";
    }
  }
  updateServerMemberCount(){
    var self = this;
    self.serverCount = Object.keys(self.disnode.bot.guilds).length;
    self.memberCount = Object.keys(self.disnode.bot.users).length;
    self.channelCount = Object.keys(self.disnode.bot.channels).length;/*
    self.directMessageCount = Object.keys(self.disnode.bot.client.directMessages).length;*/
  }
}
module.exports = Stats;
