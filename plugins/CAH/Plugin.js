const Session = require('./Session.js');
const axios = require("axios")

const ENDPOINT = "http://127.0.0.1:9999"
class CAH {
  constructor() {
    this.sessions = [];
    this.request = axios.create({
      baseURL: ENDPOINT,
      timeout: 2500,
      headers: {'auth': 'FlWo39AEgJuw8hvl6diIqcekictExUbcqkMV16DPGJAXdz4v71Lzm2QBJUo5M2gU'}
    });
  }
  default(command){
    var self = this;
    var msg = "";
   
  }
  commandNew(command){
    var self = this;
    var creatorObject = {
      creator: command.msg.user.id
    }
   
    self.request.post(ENDPOINT + "/game", creatorObject).then((res)=>{
      var GameCode = res.data.data.toUpperCase();
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "Game Created!","**"+ command.msg.user.username + "** created a game! \nCode: `" + GameCode + "`");
    }).catch((err)=>{
      
      self.disnode.bot.SendMessage(command.msg.channelID, JSON.stringify(err.response.data.message));
    });
  }
  
}
module.exports = CAH;
