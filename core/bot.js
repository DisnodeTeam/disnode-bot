var net = require('net');

var shortid = require('shortid');
var Discord = require('discord.io');
var Logger = require('disnode-logger');
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

			var clientSettings = {
				autorun: true,
				token: self.key
			};
			var botCount = self.disnode.communication.connetionCount;

			if(self.disnode.botConfig.shardCount){
				Logger.Info("BotJS", "Connect", "Sharding: " + (botCount + 1) + "/" +self.disnode.botConfig.shardCount)
				clientSettings.shard = [botCount,self.disnode.botConfig.shardCount]
			}

			self.client = new Discord.Client(clientSettings);

			self.client.on('ready', function (event) {
				self.SetUpLocalBinds();
				console.log(self.client.internals);
				resolve();
			});

		});
	}

	Disconnect() {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.client.disconnect();
			resolve();
		});
	}

	Restart() {
		var self = this;
		self.Disconnect().then(function (){
			self.client.connect()
		});
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
		this.bind_onMessage = msgFunction;
	}



	SendMessage(channel, msg, typing=false, tts=false) {
		var self = this;
		return new Promise(function(resolve, reject) {
			self.client.sendMessage({
				to: channel,
				message: msg,
				typing: typing,
				tts: tts
			}, function(err, resp) {
				if(err){
					reject(err);
				}else {
					resolve(resp);
				}
			});
		});
	}
	SendEmbed(channel, embed){
		var self = this;
		self.client.sendMessage({
			to: channel,
			embed: embed
		});
	}
	SendCompactEmbed(channel, title, body, color=3447003) {
		var self = this;
		self.client.sendMessage({
			to: channel,
			embed: {
				color: color,
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
	SetStatus(status){
		var self = this;
		self.client.setPresence({game: {name: status}});
	}

	SetUsername(name){
		var self = this;
		self.client.editUserInfo({username: name});
	}

	SetServerName(serverId, servername){
		var self = this;
		self.client.editServer(
        {
            serverID: serverId,
            name: servername
        });
	}

	JoinVoiceChannel(voiceID){
		var self = this;
		this.client.joinVoiceChannel(voiceID,function(err){
			if(err){
				console.log(err);
			}else{
			}
		})
	}

  LeaveVoiceChannel(voiceID){
		var self = this;
		this.client.leaveVoiceChannel(voiceID,function(err){
			if(err){
				console.log(err);
			}else{
			}
		})
	}
		JoinUsersVoiceChannel(serverID, userID){
		var user = this.GetUserByID(serverID, userID);
		if(!user){
			return;
		}
		this.JoinVoiceChannel(user.voice_channel_id);
	}
    LeaveUsersVoiceChannel(serverID, userID) {
    var user = this.GetUserByID(serverID, userID);
		if(!user){
			return;
		}
			this.LeaveVoiceChannel(user.voice_channel_id);
  }
		GetServerByID(id){
		var servers = this.client.servers;
		return servers[id];
	}
		GetUserByID(serverId, userId){
		var server = this.GetServerByID(serverId);
		if(!server){
			return;
		}
		return server.members[userId];
	}
		GetUserRoles(serverId, userId){
		var user = this.GetUserByID(serverId, userId);
		if(!user){
			return;
		}
		return user.roles;
	}

	GetRoleById(serverId, roleId){
		var server = this.GetServerByID(serverId);
		if(!server){
			return;
		}
		return server.roles[roleId];
	}
	GetBotInfo(){
		var self = this;
		return {
			username: self.client.username,
			id: self.client.id,
			avatar: self.client.avatar,
			bot: self.client.bot,
			discriminator: self.client.discriminator,
		}
	}
	GetUserInfo(UserID){
		var self = this;
		return self.client.users[userID];
	}
}

module.exports = Bot;
