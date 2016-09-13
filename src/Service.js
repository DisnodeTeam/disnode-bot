const EventEmitter = require("events");
const colors = require('colors');
class Service extends EventEmitter{
  constructor(className, disnode){
    super();
    this.name = className;
    this.defaultConfig = {};

    if (disnode.config.services) {
      console.log(colors.grey("[Service-"+this.name+"]" ) + " Loaded!".green);
        this.config = disnode.config.services[this.name];
    }

  }

  Connect(){
    console.log(colors.grey("[Service-"+this.name+"]" ) + " Connecting!".cyan);
  }

  OnInit(){
    this.emit("Service_OnInit");
  }

  OnConnected(){
    this.emit("Service_OnConnected", this);
    console.log(colors.grey("[Service-"+this.name+"]" ) + " Connected!".green);
  }
  OnMessage(msgObject){
    this.emit("Service_OnMessage", msgObject);
  }
  SendMessage(data){

  }
}

module.exports = Service;
