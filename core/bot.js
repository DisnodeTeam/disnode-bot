const DiscordAPI = require("discord.js");

class Bot{
  constructor(key){
      this.key = key;
      this.client = {};
  }

  Connect(){
    if(this.client != {}){
      this.client = {};
    }
  }

  Disconnect(){

    this.client = {};
  }

}

module.exports = Bot;
