var net = require('net');

var shortid = require('shortid');
var Discord = require('discord.io');
var Logger = require('disnode-logger');

const axios = require('axios');
const WebSocket = require('ws');

const codes = require("./api/codes");
const requests = require('./api/request')
const async = require('async');
var EventEmitter = require('events').EventEmitter;


/**
 * Class to ineract with Discord
 * @constructor
 * @param {string} key - Discord Bot Key
 * @param {DisnodeObj} disnode - Refrence to Disnode Class (disnode.js)
 */
class Bot extends EventEmitter {
	constructor(key, disnode) {
		super();
		this.key = key;
		this.client = {};
		this.botInfo = {};
		this.disnode = disnode;
		this.bind_onMessage = null;
		this.isRemote = false;
		this.remoteID = "";
		this.shardID = 0;
		this.s = null;
		this.servers = {
			count: 0
		};

		this.channels = {
			count: 0
		};
		this.users = {
			count: 0
		};
	}
	/**
	 * Connect bot to Discord
	 */
	Connect() {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.GetGatewayURL().then(function (url) {
				return self.ConnectToGateway(url)
			}).then(function () {
				self.on("READY", function () {
					self.GetCacheInfo();
					resolve();
				})
			}).catch(function (err) {
				Logger.Error("Bot", "Connect", "Connection Error: " + err);
			})
		});
	}

	GetGatewayURL() {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logger.Info("Bot", "GetGatewayURL", "Aquiring Gatway URL...");
			axios.get('https://discordapp.com/api/gateway/bot', {
				headers: {
					'Authorization': "Bot " + self.key
				}
			}).then(function (response) {

				Logger.Success("Bot", "GetGatewayURL", "Aquired Gatway URL!");
				var url = response.data.url + "/?encoding=json&v=5";
				resolve(url)
			}).catch(function (err) {
				Logger.Error("Bot", "GetGatewayURL", "Error Aquiring Gatway URL: " + err);
				reject(err);
			});
		});
	}

	ConnectToGateway(url) {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logger.Info("Bot", "ConnectToGateway", "Connecting to gateway");
			self.ws = new WebSocket(url);

			self.BindSocketEvents();

			self.ws.on('open', function () {
				Logger.Success("Bot", "ConnectToGateway", "Connected to gateway!");
				resolve();
			});

		});
	}

	BindSocketEvents() {
		var self = this;
		self.ws.on("message", function (data, flags) {
			self.OnWSMessage(data, flags);

		});

		self.ws.on('error', function (data) {
			console.log(data);
		});
	}

	StartHeartbeat(interval) {
		var self = this;
		Logger.Info("Bot", "StartHeartbeat", "Starting Heatbeat with Interval: " + interval);
		var packet = requests.heartbeat(self.s);
		self.ws.send(JSON.stringify(packet));
		console.log(packet)
		setInterval(function () {
			var packet = requests.heartbeat(self.s);
			self.ws.send(JSON.stringify(packet));
		}, interval)
	}

	OnWSMessage(data, flags) {
		data = JSON.parse(data);
		var operation = data.op;
		var self = this;
		if (data.s) {
			self.s = data.s;
		}
		switch (operation) {
			case codes.OPCode.HELLO:

				self.wsIdentify();
				self.StartHeartbeat(data.d['heartbeat_interval'])
				break;

			case codes.OPCode.DISPATCH:
				self.handleDispatch(data);
				break;
			case codes.OPCode.HEARTBEAT_ACK:

				break;
		}
	}

	wsIdentify() {
		var self = this;
		Logger.Info("Bot", "wsIdentify", "Sending ID to Gateway");
		var packet = requests.identify(this.key);
		self.ws.send(JSON.stringify(packet));
	}

	handleDispatch(data) {
		var type = data.t;
		var self = this;
		//console.log(type);
		switch (type) {
			/**
			 * Message Delete event.
			 * @event Bot#ready
			 * @type {object}
			 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
			 */
			case codes.dispatch.READY:
				self.emit("READY");
				break;
				/**
				 * Message Delete event.
				 * @event Bot#channel_create
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.CHANNEL_CREATE:
				self.emit("channel_create", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#channel_delete
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.CHANNEL_DELETE:
				self.emit("channel_delete", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#channel_update
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.CHANNEL_UPDATE:
				self.emit("channel_update", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_ban_add
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_BAN_ADD:
				self.emit("guild_ban_add", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_ban_remove
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_BAN_REMOVE:
				self.emit("guild_ban_remove", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_create
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_CREATE:
				self.emit('guild_create', data.d);
				self.handleGuildCreate(data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_delete
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_DELETE:
				self.emit("guild_delete", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_intergrations
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_INTEGRATIONS_UPDATE:
				self.emit("guild_intergrations", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_memeber_add
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_MEMBER_ADD:
				self.emit("guild_memeber_add", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_memeber_removed
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_MEMBER_REMOVE:
				self.emit("guild_memeber_removed", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_role_created
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_ROLE_CREATE:
				self.emit("guild_role_created", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_role_delete
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_ROLE_DELETE:
				self.emit("guild_role_delete", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_role_update
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_ROLE_UPDATE:
				self.emit("guild_role_update", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#guild_update
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.GUILD_UPDATE:
				self.emit("guild_update", data.d);
				break;
				/**
				 * Message Create event.
				 * @event Bot#message
				 * @type {object}
				 * @property {MessageObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.MESSAGE_CREATE:
				var data = {
					id: data.d.id,
					user: data.d.author.username,
					userID: data.d.author.id,
					channel: data.d.channel_id,
					message: data.d.content,
					server: self.GetServerFromChanel(data.d.channel_id),
					raw: data.d
				};
				self.emit("message", data);
				break;

				/**
				 * Message Delete event.
				 * @event Bot#message_delete
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.MESSAGE_DELETE:
				var data = {
					id: data.d.id,
					channel: data.d.channel_id,
					server: self.GetServerFromChanel(data.d.channel_id),
					raw: data.d
				};
				self.emit("message_delete", data);
				break;
				/**
				 * Message Update event.
				 * @event Bot#message_update
				 * @type {object}
				 * @property {MessageObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.MESSAGE_UPDATE:
				var data = {
					id: data.d.id,
					channel: data.d.channel_id,
					message: data.d.content,
					server: self.GetServerFromChanel(data.d.channel_id),
					raw: data.d
				};
				self.emit("message_update", data);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#message_presence
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.PRESENCE_UPDATE:
				self.emit("message_presence", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#typing
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.TYPING_START:
				self.emit("typing", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#setting_update
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.USER_SETTINGS_UPDATE:
				self.emit("setting_update", data.d);
				break;
				/**
				 * Message Delete event.
				 * @event Bot#voice_update
				 * @type {object}
				 * @property {MessageDeleteObject} Data - Indicates whether the snowball is tightly packed.
				 */
			case codes.dispatch.VOICE_STATE_UPDATE:
				self.emit("voice_update", data.d);
				break;



		}
	}

	handleGuildCreate(data) {
		this.servers[data.id] = data;
		for (var i = 0; i < data.channels.length; i++) {
			data.channels[i].guild_id = data.id;

			this.channels[data.channels[i].id] = data.channels[i];
			this.channels.count += 1;

		}
		var mem = this.servers[data.id].members

		var rawUsers = [];
		for (var i = 0; mem.length; i++) {
			if (mem[i] == null) {
				return;
			}
			this.users[mem[i].user.id] = mem[i].user;
		}




	}


	/**
	 * Disconnect Bot to Discord
	 * @return {Promise<string|err>} A promise to the token.
	 */
	Disconnect() {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.client.disconnect();
			resolve();
		});
	}
	/**
	 * Restarts Connetion to Discord (Disconnects then Connects)
	 */
	Restart() {
		var self = this;
		self.Disconnect().then(function () {
			self.client.connect()
		});
	}

	SetUpLocalBinds() {
		var self = this;
		self.on('message', function (data) {

			var firstLetter = data.message.substring(0, self.disnode.botConfig.prefix.length);
			if (self.disnode.ready && firstLetter == self.disnode.botConfig.prefix) {
				this.disnode.server.GetCommandInstancePromise(data.server).then(function (inst) {

					if (inst) {
						inst.RunMessage(data);
					} else {
						Logging.Warning("Bot", "Message", "No Command Handler!");
					}
				});

			}

		});
	}


	GetCacheInfo(){
		var self = this;
		axios.get('https://discordapp.com/api/users/@me', {
				headers: {
					'Authorization': "Bot " + self.key
				}
			})
			.then(function (response) {
				self.botInfo = response.data;
			})
			.catch(function (err) {
				Logging.Error("Bot", "GetCacheInfo", err);
			});
	}
	GetServerFromChanel(channel) {
		var self = this;
		var _server = "DM";
		if (self.channels[channel]) {
			_server = self.channels[channel].guild_id;

		}

		return _server;
	}
	/**
	 * Send a normal message
	 * @param {string} channel - ChannelID of where to send the message
	 * @param {string} msg - The message to send
	 * @param {bool} typing - (Optional)Set typing to true or false when sending the message (default false)
	 * @param {bool} tts - (Optional)Set tts to true or false when sending the message (default false)
	 */
	SendMessage(channel, msg, typing = false, tts = false) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var msgObject = {
				content: msg,
				typing: typing,
				tts: tts
			};
			axios.post('https://discordapp.com/api/channels/' + channel + '/messages', msgObject, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "SendMessage", err);
					reject(err);
				});

		});
	}
	/**
	 * Edit a Message
	 * @param {string} channel - ChannelID of where to send the message
	 * @param {string} msgID - Message ID of the message you want to edit
	 * @param {string} msg - The message to send
	 * @param {bool} typing - (Optional)Set typing to true or false when sending the message (default false)
	 * @param {bool} tts - (Optional)Set tts to true or false when sending the message (default false)
	 */
	EditMessage(channel, msgID, msg, typing = false, tts = false) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var msgObject = {
				content: msg,
				typing: typing,
				tts: tts
			};
			axios.patch('https://discordapp.com/api/channels/' + channel + '/messages/' + msgID, msgObject, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "EditMessage", err);
					reject(err);
				});

		});
	}
	/**
	 * send a message as a embed
	 * @param {string} channel - ChannelID of where to send the message
	 * @param {object} embed - the Embed Object to send
	 */
	SendEmbed(channel, embed) {
		var self = this;

		return new Promise(function (resolve, reject) {

			var msgObject = {
				embed: embed
			};
			axios.post('https://discordapp.com/api/channels/' + channel + '/messages', msgObject, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "SendEmbed", err);
					reject(err);
				});
		});
	}
	/**
	 * send an embed as a compact one, less lines defining a embed object
	 * @param {string} channel - ChannelID of where to send the message
	 * @param {string} title - The title of the embed
	 * @param {string} body - The body of the embed
	 * @param {int|RGBint} color - (Optional)RGB Int of what color the embed should be (default 3447003)
	 */
	SendCompactEmbed(channel, title, body, color = 3447003) {
		var self = this;

		return new Promise(function (resolve, reject) {
			var msgObject = {
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
			};
			axios.post('https://discordapp.com/api/channels/' + channel + '/messages', msgObject, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "SendCompactEmbed", err);
					reject(err);
				});
		});

	}
	/**
	 * Edit an embed
	 * @param {string} channel - ChannelID of where to send the message
	 * @param {string} msgID - Message ID of the message you want to edit
	 * @param {object} embed - the Embed Object to send
	 */
	EditEmbed(channel, msgID, embed) {
		var self = this;

		return new Promise(function (resolve, reject) {
			var self = this;
			var msgObject = {
				embed: embed
			};
			axios.patch('https://discordapp.com/api/channels/' + channel + '/messages/' + msgID, msgObject, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "EditEmbed", err);
					reject(err);
				});
		});
	}
	/**
	 * Set the bots playing game
	 * @param {string} status - What you want your bot to be playing
	 */
	SetStatus(status) {
		var self = this;
		var packet = requests.presence(status);

		self.ws.send(JSON.stringify(packet));
	}
	/**
	 * Set the bots username
	 * @param {string} name - What you want your bot's username to be
	 */
	SetUsername(name) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var self = this;
			axios.patch('https://discordapp.com/api/users/@me', {
					name: name
				}, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "SetUsername",err);
					reject(err);
				});
		});
	}
	/**
	 * Allows you to change a server's name (need proper permissions to do)
	 * @param {string} serverID - Server ID of the server you want to change
	 * @param {string} servername - What you wantto set the servername to be
	 */
	SetServerName(serverId, servername) {
		var self = this;
		Logging.Error("Bot", "SetServerName","NOT IMPLEMENTED");
		return;
	}
	/**
	 * Deletes an array of messages
	 * @param {string} channelID - ID of the channel
	 * @param {array} messageIDs - Array of message ids
	 */
	DeleteMessages(cID, mID) {
		var self = this;
		Logging.Error("Bot", "DeleteMessages","NOT IMPLEMENTED");
		return;
	}
	/**
	 * Adds reaction to a message
	 * @param {string} channelID - ID of the channel
	 * @param {string} messageID - ID of the message
	 * @param {string} reactionID - ID or unicode of a reactionID
	 */
	AddReaction(channelID, messageID, reaction) {
		var self = this;
		Logging.Error("Bot", "AddReaction","NOT IMPLEMENTED");
		return;
	}
	/**
	 * Kicks the specified user id from the server
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user going to be kicked
	 */
	Kick(sID, uID) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var self = this;
			axios.delete('https://discordapp.com/api/guilds/' + serverId + '/members/' + userID, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(response.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "Kick",err);
					reject(err);
				});
		});
	}
	/**
	 * Bans the specified user id from the server
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user going to be banned
	 * @param {number} Days - (Optional)The number of days worth of messages to delete
	 */
	Ban(serverID, userID, Days) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var self = this;

			axios.put('https://discordapp.com/api/guilds/' + serverId + '/bans/' + userID, {
					'delete-message-days': Days
				}, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(resp.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "Ban",err);
					reject(err);
				});
		});
	}
	/**
	 * Unabn the specified user id from the server
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user going to be unbanned
	 */
	Unban(sID, uID) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var self = this;

			axios.delete('https://discordapp.com/api/guilds/' + serverId + '/bans/' + userID, {}, {
					headers: {
						'Authorization': "Bot " + self.key
					}
				})
				.then(function (response) {
					resolve(resp.data);
				})
				.catch(function (err) {
					Logging.Error("Bot", "Unban",err);
					reject(err);
				});
		});
	}
	/**
	 * Mutes the specified user id from the server
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user going to be muted
	 */
	Mute(sID, uID) {
		var self = this;
		Logging.Error("Bot", "Mute", "NOT IMPLEMENTED");
		return;
	}
	/**
	 * Unmutes the specified user id from the server
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user going to be unmuted
	 */
	Unmute(sID, uID) {
		var self = this;
		Logging.Error("Bot", "Unmute", "NOT IMPLEMENTED");
		return;
	}
	/**
	 * Joins the channel that the user is in
	 * @param {string} voiceID - ID of the voice channel
	 */
	JoinVoiceChannel(voiceID) {
		var self = this;
		Logging.Error("Bot", "JoinVoiceChannel", "NOT IMPLEMENTED");
		return;
	}
	/**
	 * Leaves the channel that the user is in
	 * @param {string} voiceID - ID of the voice channel
	 */
	LeaveVoiceChannel(voiceID) {
		var self = this;
		Logging.Error("Bot", "LeaveVoiceChannel", "NOT IMPLEMENTED");
		return;
	}
	/**
	 * Joins the channel that the user is in
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user its joining
	 */
	JoinUsersVoiceChannel(serverID, userID) {
		var user = this.GetUserByID(serverID, userID);
		if (!user) {
			return;
		}
		this.JoinVoiceChannel(user.voice_channel_id);
	}
	/**
	 * Leaves the channel that the user is in
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - ID of the user its leaving
	 */
	LeaveUsersVoiceChannel(serverID, userID) {
		var user = this.GetUserByID(serverID, userID);
		if (!user) {
			return;
		}
		this.LeaveVoiceChannel(user.voice_channel_id);
	}
	/**
	 * Get a lot of information about the server
	 * @param {string} serverID - ID of the server
	 */
	GetServerByID(id) {
		return this.servers[id];
	}
	/**
	 * Gets information about that user
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - Id of the user
	 */
	GetUserByID(serverID, userID) {
		return this.users[userID];
	}
	/**
	 * Gets server member
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - Id of the user
	 */
	GetMember(serverID, userID) {
		var members = self.disnode.util.arrayToOject(this.servers[serverID].members, "user.id");
		return members[userID];
	}
	/**
	 * Gets the roles that the specified user in the server has
	 * @param {string} serverID - ID of the server
	 * @param {string} userID - Id of the user
	 */
	GetUserRoles(serverId, userId) {
		var user = this.GetUserByID(serverId, userId);
		if (!user) {
			return;
		}
		return user.roles;
	}
	/**
	 * Gets information about the specified role
	 * @param {string} serverID - ID of the server
	 * @param {string} roleID - Id of the role
	 */
	GetRoleById(serverId, roleId) {
		var server = this.servers[serverId];
		if (!server) {
			return;
		}
		var roles = self.disnode.util.arrayToOject(server.roles, "id");
		return roles[roleId];
	}
	GetUserStatus(serverId, UserId) {
		var statuses = this.servers[serverId].presences;

		for (var i = 0; i < statuses.length; i++) {
			if (statuses[i].user.id == UserId) {
				return statuses[i];
			}
		}
		//return
	}
	/**
	 * Gets information about the bot
	 */
	GetBotInfo() {
		var self = this;
		return self.botInfo;
	}
	/**
	 * Gets minimal information about the specified user
	 * @param {string} userID - ID of the user
	 */
	GetUserInfo(UserID) {
		var self = this;
		return self.users[UserID];
	}
	GetSnowflakeDate(resourceID) {
		return new Date(parseInt(resourceID) / 4194304 + 1420070400000);
	}
	/**
	 * Gets message info of a message
	 * @param {string} channelID - ID of the channel
	 * @param {string} messageID - ID of the message
	 */
	GetMessage(channelID, MessageID) {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logging.Error("Bot", "GetMessage", "NOT IMPLEMENTED");
			resolve();
		});
	}
	/**
	 * Adds reaction to a message
	 * @param {string} channelID - ID of the channel
	 * @param {string} messageID - ID of the message
	 * @param {string} reactionID - ID or unicode of a reactionID
	 */
	AddReaction(channelID, messageID, reaction) {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logging.Error("Bot", "AddReaction", "NOT IMPLEMENTED");
			resolve();
		});
	}
	/**
	 * Gets reaction of a message
	 * @param {string} channelID - ID of the channel
	 * @param {string} messageID - ID of the message
	 * @param {string} reactionID - ID or unicode of a reactionID
	 */
	GetReaction(channelID, messageID, reaction) {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logging.Error("Bot", "GetReaction", "NOT IMPLEMENTED");
			resolve();
		});
	}
	/**
	 * Removes reaction from a message
	 * @param {string} channelID - ID of the channel
	 * @param {string} messageID - ID of the message
	 * @param {string} reactionID - ID or unicode of a reactionID
	 */
	RemoveReaction(channelID, messageID, reaction) {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logging.Error("Bot", "RemoveReaction", "NOT IMPLEMENTED");
			resolve();
		});
	}
	/**
	 * Removes all reactions from a message
	 * @param {string} channelID - ID of the channel
	 * @param {string} messageID - ID of the message
	 */
	RemoveAllReactions(channelID, messageID) {
		var self = this;
		return new Promise(function (resolve, reject) {
			Logging.Error("Bot", "RemoveAllReactions", "NOT IMPLEMENTED");
			resolve();
		});
	}
	/**
	 * Pagify results
	 * @param {array} arr - Array to be paged
	 * @param {integer} page - Page number
	 * @param {integer} perPage - Results per page
	 */
	pageResults(arr, page, perPage = 10) {
		var returnArr = [];
		var maxindex;
		var startindex;
		if (page == 1) {
			page = 1;
			startindex = 0
			maxindex = perPage;
		} else {
			maxindex = (page * perPage);
			startindex = maxindex - perPage;
		}
		for (var i = startindex; i < arr.length; i++) {
			if (i == maxindex) break;
			returnArr.push(arr[i]);
		}
		return returnArr;
	}
}
module.exports = Bot;
