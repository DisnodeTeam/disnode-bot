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
      self.socket.write('{"TEST":"123"}')
    });
  }

}

module.exports = Communication;
