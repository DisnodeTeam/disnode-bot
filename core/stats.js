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
    setTimeout(function() {
      self.updateServerMemberCount();
    }, 1000);
  }
  getUptime(){
    var self = this;
    var currentTime = new Date();
    return currentTime - self.startDateTime;
  }
  updateServerMemberCount(){
    var self = this;
    self.serverCount = Object.keys(self.disnode.bot.client.servers).length;
    self.memberCount = Object.keys(self.disnode.bot.client.users).length;
    self.channelCount = Object.keys(self.disnode.bot.client.channels).length;
    self.directMessageCount = Object.keys(self.disnode.bot.client.directMessages).length;
    setTimeout(function() {
      self.updateServerMemberCount();
    }, 60000);
  }
}
module.exports = Stats;
