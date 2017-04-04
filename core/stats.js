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
    var elapsed = currentTime - self.startDateTime;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = parseInt(elapsed / 1000);
    var miliseconds = elapsed % 1000;
    while (seconds > 60) {
      minutes++;
      seconds -= 60;
      if (minutes == 60) {
        hours++;
        minutes = 0;
      }
      if(hours == 24){
        days++
        hours = 0;
      }
    }
    return days + " Days\n" + hours + " Hours\n" + minutes + " Minutes\n" + seconds + " Seconds\n" + miliseconds + " Miliseconds";
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
