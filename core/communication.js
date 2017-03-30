var Logger = require('disnode-logger');
const net = require('net');

class Communication{
  constructor(disnode){
    this.disnode = disnode;
    this.isServer = false;
    this.connections = [];
    this.connetionCount = 0;

    this.IP = disnode.botConfig.communicationIP || "127.0.0.1";
    this.PORT = disnode.botConfig.communicationPORT || 7777;
  }


 StartServer(resolve) {
   var self = this;
   self.server = net.createServer();
   self.server.listen(self.PORT, self.IP);
   Logger.Success("Communication", "Start Server", "Server Started: " + self.IP +":" +self. PORT);
   self.isServer = true;
   self.server.on('connection', function(sock) {
     Logger.Success("Communication", "Start Server", "Client Connected! ");


     self.sock = sock;
     self.connections.push(sock);
     self.connetionCount++;

      self.SendToAllClients(JSON.stringify({cmd:"CONNECTIONS_COUNT", data: self.connetionCount}))
     // other stuff is the same from here
     self.sock.on('data', function(data){
          Logger.Info("Communication", "Server-Data", "Data: " + data);
          var dataObj = JSON.parse(data);
     });
     self.sock.on('error', function(error){
          Logger.Warning("Communication", "Server-Error", "Error: " + error);
          self.connetionCount--;
          var _index = self.connections.indexOf(sock);
           self.connections.splice(_index, 1);
          self.SendToAllClients(JSON.stringify({cmd:"CONNECTIONS_COUNT", data: self.connetionCount}))
     });
     if(resolve){
       resolve();
     }

   });
 }
 SendToAllClients(data){
   var self = this;
   for (var i = 0; i < self.connections.length; i++) {
     self.connections[i].write(data);
   }
 }
 StartClient() {
   var self = this;

   return new Promise(function(resolve, reject) {
     self.client = new net.Socket();
     Logger.Info("Communication", "StartClient", "Connecting to server: " + self.IP + ":" + self.PORT)
     self.client.connect(self.PORT, self.IP, function() {
       self.isServer = false;
       Logger.Success("Communication", "StartClient", "Connected to server: " + self.IP + ":" + self.PORT)


     });

     // Add a 'data' event handler for the client socket
     // data is what the server sent to this socket
     self.client.on('data', function(data) {
         var dataObj = JSON.parse(data);
         if(dataObj.cmd = "CONNECTIONS_COUNT"){
           self.connetionCount = dataObj.data;
           Logger.Success("Communication", "StartClient", "Recieved Connection Count: "+ self.connetionCount  )
           resolve();
         }

       //self.client.destroy();

     });

     self.client.on('error', function(data) {

       Logger.Warning("Communication", "StartClient", "Failed Connected to server: " + self.IP + ":" + self.PORT)
       self.StartServer(resolve);
       // Close the client socket completely
       self.client.destroy();
       resolve();

     });

     // Add a 'close' event handler for the client socket
     self.client.on('close', function() {

      Logger.Info("Communication", "StartClient", "Client Closed")
     });

   });
 }

}

module.exports = Communication;
