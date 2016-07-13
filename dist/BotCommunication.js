"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var net = require('net');
var IP = "127.0.0.1";
var PORT = 6969;

var BotCommunication = function () {
    function BotCommunication(id) {
        _classCallCheck(this, BotCommunication);

        this.id = id;
        console.log("[BotCommunication] Created!");
        console.log("[BotCommunication] |--- ID:" + id);
    }

    _createClass(BotCommunication, [{
        key: "Start",
        value: function Start() {
            this.StartClient();
        }
    }, {
        key: "StartServer",
        value: function StartServer() {
            var self = this;
            self.server = net.createServer();
            self.server.listen(PORT, IP);
            console.log('[BotCommunication-StartServer] Server Started!');
            console.log('[BotCommunication-StartServer] |--- IP: ' + IP);
            console.log('[BotCommunication-StartServer] |--- PORT: ' + PORT);

            self.server.on('connection', function (sock) {
                console.log("[BotCommunication-StartServer] ClientConnected!");
                console.log("[BotCommunication-StartServer] |--- REMOTE IP: " + sock.remoteAddress);
                console.log("[BotCommunication-StartServer] |--- REMOTE PORT: " + sock.remotePort);

                self.sock = sock;
                // other stuff is the same from here
                self.sock.on('data', function (data) {
                    console.log("[BotCommunication-StartServer] Data Recieved!");
                    console.log("[BotCommunication-StartServer] |--- DATA: " + data);
                    console.log("[BotCommunication-StartServer] |--- REMOTE IP: " + sock.remoteAddress);
                    console.log("[BotCommunication-StartServer] |--- REMOTE PORT: " + sock.remotePort);
                });
            });
        }
    }, {
        key: "StartClient",
        value: function StartClient() {
            var self = this;

            self.client = new net.Socket();
            self.client.connect(PORT, IP, function () {

                console.log('[BotCommunication-StartClient] Client Connected to server!');
                console.log('[BotCommunication-StartClient] |--- IP: ' + IP);
                console.log('[BotCommunication-StartClient] |--- PORT: ' + PORT);
                // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
                self.client.write(JSON.stringify({ cmd: "REGISTER", id: self.id }));
            });

            // Add a 'data' event handler for the client socket
            // data is what the server sent to this socket
            self.client.on('data', function (data) {

                self.client.destroy();
            });

            self.client.on('error', function (data) {

                console.log("[BotCommunication-StartClient] Failed to connect to server. Creating. ");
                console.log("[BotCommunication-StartClient] |--- Error:  " + data);
                self.StartServer();
                // Close the client socket completely
                self.client.destroy();
            });

            // Add a 'close' event handler for the client socket
            self.client.on('close', function () {
                console.log("[BotCommunication-StartClient] Client Closed");
            });
        }
    }]);

    return BotCommunication;
}();

module.exports = BotCommunication;