var net = require('net');

var shortid = require('shortid');
var Discord = require('discord.io');

class Bot {
	constructor(key, disnode) {
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

			if (self.disnode.botConfig.balancerEnabled == true) {
				if (!self.disnode.botConfig.balancerIP) {
					reject("No Load Balancer IP!");
				}
				if (!self.disnode.botConfig.balancerPORT) {
					reject("No Load Balancer Port!");
				}

				self.client.type == "REMOTE";
				self.client = new net.Socket();
				self.client.connect(self.disnode.botConfig.balancerPORT, self.disnode.botConfig.balancerIP, function () {
					self.remoteID = shortid.generate();
					self.client.write(JSON.stringify({
						type: "REGISTER",
						id: self.remoteID
					}))
					self.client.on('data', (data) => self.ParseRemoteCommand(data));
					self.isRemote = true;
					resolve("Connected to remote Load Balancer!");
					return;
				});
			} else {
				self.client = new Discord.Client({
					autorun: true,
					token: self.key
				});

				self.client.on('ready', function (event) {
					self.SetUpLocalBinds();
					resolve();
				});


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

	ParseRemoteCommand(command) {
		var self = this;
		var obj = JSON.parse(command);
		console.log(obj);
		console.log(obj.type);
		switch (obj.type) {
		case "RECV_MESSAGE":
			console.log(obj.data);
			if (self.bind_onMessage) {
				self.bind_onMessage(obj.data);
			} else {
				console.log('NO BIND!');
			}
		}
	}

	SetUpLocalBinds() {
		var self = this;
		self.client.on('message', function (user, userID, channelID, message, event) {
			if (self.bind_onMessage) {
				var _server = "DM";
				if(self.client.channels[channelID]){
						_server = self.client.channels[channelID].guild_id;
				}
				var msgObject = {
					user: user,
					userID: userID,
					channel: channelID,
					message: message,
					server: _server
				}
				self.bind_onMessage(msgObject);
			}
		});
	}

	bindOnMessage(msgFunction) {
		console.log('Binding!');
		this.bind_onMessage = msgFunction;
	}



	SendMessage(channel, msg) {
		var self = this;
		if (self.isRemote) {
			var msgOBJ = {
				channel: channel,
				msg: msg
			};
			var commandObj = {
				type: "SEND_MESSAGE",
				id: self.remoteID,
				data: msgOBJ
			};

			self.client.write(JSON.stringify(commandObj));
		}else{
			self.client.sendMessage({
					 to: channel,
					 message: msg
			 });
		}
	}
	SendEmbed(channel, embed){
		var self = this;
		self.client.sendMessage({
			to: channel,
			embed: embed
		});
	}
	SendCompactEmbed(channel, title, body) {
		var self = this;
		self.client.sendMessage({
			to: channel,
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
		});
	}
}

module.exports = Bot;
