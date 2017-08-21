var Logger = require('disnode-logger');
const net = require('net');

class Communication{
  constructor(disnode){
    this.disnode = disnode;
    this.isServer = false;
    this.connections = [];
    this.connetionCount = 0;
    this.listeners = [];
    this.lastPingToServer;
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
          var dataObj = JSON.parse(data);
          self.OnData(sock, dataObj);
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
         self.OnData(self.client, dataObj);

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

 OnData(socket,data){
   var type = data.type;
   Logger.Info("Communication", "OnData", "Recieved Data:" + JSON.stringify(data));
   for (var i = 0; i < this.listeners.length; i++) {
     if (this.listeners[i].name == type) {
       this.listeners[i].functionCall(socket,data);
     }
   }
 }
 SendToAllClients(data){
   var self = this;
   for (var i = 0; i < self.connections.length; i++) {
     self.connections[i].write(data);
   }
 }

 StartPingCheck(){
   var self = this;
   setInterval(function () {
     self.PingCheck();
   }, 1000);
 }
 PingCheck(){
   if(self.isServer){
     for (var i = 0; i < self.connnections.length; i++) {
       var con = self.connnections[i];
       con.lastPing =
       con.write({type: "PING"});
     }
   }else{
      self.lastPingToServer = new Date().millisecounds();
   }

 }

 ResetPing(){

 }

 AddListener(eventName, functionCall){
    this.listeners.push{name: eventName, functionCall: functionCall};
 }

}

module.exports = Communication;
