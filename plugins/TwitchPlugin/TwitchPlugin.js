const Twitch = require('twitch-api');

class TwitchPlugin {
  constructor() {
    this.helpMessage = "type '!twitch add [channel]' to add a channel to the watch list!";
    this.watching = [];
    var twitch = new Twitch({
      clientId: 'your client id',
      clientSecret: 'your client secret',
      redirectUri: 'http://localhost/callback',
      scopes: []
    });
    if(!this.disnode.DB){
      return;
    }
    

  }

  default (command) {
    console.log(this);
    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Test", "Test");
  }
  commandAddChannel(command){

  }
}

module.exports = TwitchPlugin;
