const DiscordAPI = require("discord.js");

class Bot{
  constructor(key){
      this.key = key;
      this.client = {};
  }

  Connect(){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.client != {}){
        self.client = {};
      }
      if(!self.key){
        reject("No key!")
      }
      self.client = new DiscordAPI.Client();
      self.client.login(self.key).then(resolve).catch(reject);

    });
  }

  Disconnect(){
    this.client.destroy();
    this.client = {};
  }

}

module.exports = Bot;
