var Logger = require('disnode-logger');
const net = require('net');

class Communication{
  constructor(disnode){
    this.disnode = disnode;
    this.IP = disnode.botConfig.relayServer.ip;
    this.PORT = disnode.botConfig.relayServer.port;
    this.socket = null;
    this.connected = false;
  }

  Connect(){
    var self = this;
    self.socket = new net.Socket();

    self.socket.connect(self.PORT, self.IP, function(){
      console.log("CONNECTED!");
      self.connected = true;
      self.SendPacket("Test", "123")
    });
  }
  SendPacket( header, data) {
    var packet = {
      header: header,
      data: data,
      timestamp: new Date()
    };
    this.socket.write(JSON.stringify(packet))
  }

  RegisterBot(){
    var self = this;
    if(!self.disnode.botConfig.api){
      return;
    }

    if(!self.disnode.botConfig.api.key){
      return;
    }

    if(!self.disnode.botConfig.api.appid){
      return;
    }

    SendPacket("REGISTER",{app: appid, key: key, type: "BOT"})
  }

}

module.exports = Communication;
