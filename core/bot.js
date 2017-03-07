const DiscordAPI = require("discord.js");
var net = require('net');

var shortid = require('shortid');


class Bot {
	constructor(key,disnode) {
		this.key = key;
		this.client = {};
    this.disnode = disnode;
    this.bind_onMessage = null;
    this.isRemote = false;
    this.remoteID = "";
	}

	Connect() {
		var self = this;
		return new Promise(function (resolve, reject) {
      console.log(self.disnode.botConfig.balancerEnabled);

			if(self.disnode.botConfig.balancerEnabled == true){
        if(!self.disnode.botConfig.balancerIP){
          reject("No Load Balancer IP!");
        }
        if(!self.disnode.botConfig.balancerPORT){
          reject("No Load Balancer IP!");
        }

        self.client.type == "REMOTE";
        self.client = new net.Socket();
        self.client.connect(self.disnode.botConfig.balancerPORT, self.disnode.botConfig.balancerIP, function() {
          self.remoteID = shortid.generate();
          self.client.write(JSON.stringify({type:"REGISTER", id: self.remoteID}))
          self.client.on('data', (data) => self.ParseRemoteCommand(data));
          self.isRemote = true;
          resolve("Connected to remote Load Balancer!");
          return;
        });
      }else{
        resolve();
      }

		});
	}

	Disconnect() {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.client = {};
			self.client.destroy().then(resolve).catch(reject);
		});
	}

  ParseRemoteCommand(command){
    var self = this;
    var obj = JSON.parse(command);
    console.log(obj);
    console.log(obj.type);
    switch(obj.type){
      case "RECV_MESSAGE":
      console.log(obj.data);
      if(self.bind_onMessage){
        self.bind_onMessage(obj.data);
      }else{
        console.log('NO BIND!');
      }
    }
  }

  bindOnMessage(msgFunction){
    console.log('Binding!');
    this.bind_onMessage = msgFunction;
  }

  SendMessage(channel, text, data){
    var self = this;
    if(self.isRemote){
      var msgOBJ = {
        channel: channel,
        text: text,
        data: data
      };
      var commandObj = {
        type: "SEND_MESSAGE",
        id: self.remoteID,
        data: msgOBJ
      };

      self.client.write(JSON.stringify(commandObj));
    }
  }

	SendCompactEmbed(channel, title, body, data) {
		channel.sendMessage("", {
			embed: {
				color: 3447003,
				author: {},
				fields: [{
					name: title,
					inline: false,
					value: body,
				}],
				footer: {}
			}
		}).then().catch(console.error);;
	}
}

module.exports = Bot;
