const Session = require('./Session.js');
class Giveaway {
  constructor() {
    this.sessions = [];
  }
  default(command){
    var self = this;
    var msg = "";
    for (var i = 0; i < self.commands.length; i++) {
      msg += self.disnode.botConfig.prefix + self.config.prefix + " " + self.commands[i].cmd + " - " + self.commands[i].desc + "\n";
    }

    self.disnode.bot.SendEmbed(command.msg.channelID, {
      color: 3447003,
      user: {},
      fields: [ {
        name: 'Giveaway',
        inline: true,
        value: "Hello, " + command.msg.user.username + "!",
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
  commandNew(command){
    var self = this;
    var currentSession = self.findSession(command.msg.user.id);
    if(!currentSession){
      var game = {
        entries: []
      }
      var newSession = new Session(command.msg.user.id, game);
      self.sessions.push(newSession);
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Giveaway", "Giveaway Started! Entries can join using this format`" + self.disnode.botConfig.prefix + self.config.prefix + " enter @mention` where the @mention is the user who created the geiveaway.");
    }else {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", ":warning: You have an active Giveaway running! Please draw a winner or disband the giveaway.", 16772880);
    }
  }
  commandCancel(command){
    var self = this;
    var currentSession = self.findSession(command.msg.user.id);
    if(!currentSession){
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", ":warning: You don't have an active giveaway!", 16772880);
    }else {
      self.endSession(command.msg.user.id);
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Giveaway", "Giveaway Disbanded!");
    }
  }
  commandEnter(command){
    var self = this;
    var currentSession = self.findSession(self.parseMention(command.params[0]));
    if(!currentSession){
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", ":warning: Giveaway not found. Try using this format`" + self.disnode.botConfig.prefix + self.config.prefix + " enter @mention` where the @mention is the user who created the geiveaway.", 16772880);
    }else {
      if(currentSession.id == command.msg.user.id){
        self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", ":warning: You can't enter your own giveaway!", 16772880);
        return;
      }
      for (var i = 0; i < currentSession.game.entries.length; i++) {
        if(currentSession.game.entries[i] == command.msg.user.id){
          self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", ":warning: You are already entered into the giveaway!", 16772880);
          return;
        }
      }
      currentSession.game.entries.push(command.msg.user.id)
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Giveaway", "Entered!");
    }
  }
  commandDraw(command){
    var self = this;
    var currentSession = self.findSession(command.msg.user.id);
    if(!currentSession){
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Error", ":warning: You don't have an active giveaway!", 16772880);
    }else {
      var winner = currentSession.game.entries[self.getRandomIntInclusive(0,currentSession.game.entries.length -1)];
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Giveaway", "<@" + winner + "> Won the Giveaway!");
      self.endSession(command.msg.user.id);
    }
  }
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  endSession(id){
    var self = this;
    for (var i = 0; i < self.sessions.length; i++) {
      if(self.sessions[i].id == id){
        self.sessions[i].cleanup();
        self.sessions.splice(i,1);
        break;
      }
    }
  }
  findSession(id){
    for (var i = 0; i < this.sessions.length; i++) {
      if(this.sessions[i].id == id){
        return this.sessions[i];
      }
    }
    return false;
  }
  parseMention(dataString){
    var self = this;
    var returnV = dataString;
    returnV = returnV.replace(/\D/g,'');
    return returnV;
  }
}
module.exports = Giveaway;
