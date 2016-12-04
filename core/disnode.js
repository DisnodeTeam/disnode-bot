const DiscordBot = require('./bot');

class Disnode{
  constructor(config){
    this.botConfigPath = config;
  }

  Start(){
    if(!botConfigPath){
      return;
    }
  }

  Stop(){

  }

  Restart(){

  }
}

module.exports = Disnode;
