var net = require('net');

var shortid = require('shortid');
var Discord = require('discord.io');
var Logger = require('disnode-logger');



/**
 * Class to ineract with Discord
 * @constructor
 * @param {string} key - Discord Bot Key
 * @param {DisnodeObj} disnode - Refrence to Disnode Class (disnode.js)
 */
class Bot {
    constructor(key, disnode) {
        this.key = key;
        this.client = {};
        this.disnode = disnode;
        this.bind_onMessage = null;
        this.isRemote = false;
        this.remoteID = "";
        this.shardID = 0;
    }
    /**
     * Connect bot to Discord
     */
    Connect() {
        var self = this;
        return new Promise(function(resolve, reject) {

            var clientSettings = {
                autorun: true,
                token: self.key
            };


            if (self.disnode.botConfig.shardCount) {
                var method = self.disnode.botConfig.shardMode || "com";

                switch (method) {
                    case "pm2":
                        self.shardID = Number(process.env.pm_id) || 0;
                        break;
                    case "arg":
                        self.shardID = Number(process.argv[2]) || 0;
                        break;
                }

                Logger.Info("BotJS", "Connect", "Sharding: " + self.shardID + "/" + self.disnode.botConfig.shardCount)
                clientSettings.shard = [self.shardID, self.disnode.botConfig.shardCount]

            }
            setTimeout(function() {
                self.client = new Discord.Client(clientSettings);
                self.client.on('ready', function(event) {
                    self.SetUpLocalBinds();
                    resolve();
                });
            }, self.shardID * 5500);




        });
    }

    /**
     * Disconnect Bot to Discord
     * @return {Promise<string|err>} A promise to the token.
     */
    Disconnect() {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.client.disconnect();
            resolve();
        });
    }
    /**
     * Restarts Connetion to Discord (Disconnects then Connects)
     */
    Restart() {
        var self = this;
        self.Disconnect().then(function() {
            self.client.connect()
        });
    }




    SetUpLocalBinds() {
        var self = this;
        self.client.on('message', function(user, userID, channelID, message, event) {
            var firstLetter = message.substring(0, self.disnode.botConfig.prefix.length);
            if (self.bind_onMessage && self.disnode.ready && firstLetter == self.disnode.botConfig.prefix) {
                var _server = "DM";
                if (self.client.channels[channelID]) {
                    _server = self.client.channels[channelID].guild_id;
                }
                var msgObject = {
                    user: user,
                    userID: userID,
                    channel: channelID,
                    message: message,
                    server: _server,
                    obj: event.d // modify however you want it, added to get message ID and others
                }
                self.bind_onMessage(msgObject);
            }
        });
    }

    bindOnMessage(msgFunction) {
        this.bind_onMessage = msgFunction;
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
        return new Promise(function(resolve, reject) {
            self.client.sendMessage({
                to: channel,
                message: msg,
                typing: typing,
                tts: tts
            }, function(err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
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
        return new Promise(function(resolve, reject) {
            self.client.editMessage({
              channelID: channel,
              messageID: msgID,
              message: {
                to: channel,
                message: msg,
                typing: typing,
                tts: tts
              }
            }, function(err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
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
        return new Promise(function(resolve, reject) {
          self.client.sendMessage({
              to: channel,
              embed: embed
          }, function(err, resp) {
              if (err) {
                  reject(err);
              } else {
                  resolve(resp);
              }
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
    /**
    * Edit an embed
    * @param {string} channel - ChannelID of where to send the message
    * @param {string} msgID - Message ID of the message you want to edit
    * @param {object} embed - the Embed Object to send
    */
    EditEmbed(channel, msgID, embed) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.client.editMessage({
              channelID: channel,
              messageID: msgID,
              embed: embed
            }, function(err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        });
    }
    /**
    * Set the bots playing game
    * @param {string} status - What you want your bot to be playing
    */
    SetStatus(status) {
        var self = this;
        self.client.setPresence({
            game: {
                name: status
            }
        });
    }
    /**
    * Set the bots username
    * @param {string} name - What you want your bot's username to be
    */
    SetUsername(name) {
        var self = this;
        self.client.editUserInfo({
            username: name
        });
    }
    /**
    * Allows you to change a server's name (need proper permissions to do)
    * @param {string} serverID - Server ID of the server you want to change
    * @param {string} servername - What you wantto set the servername to be
    */
    SetServerName(serverId, servername) {
        var self = this;
        self.client.editServer({
            serverID: serverId,
            name: servername
        });
    }

    Kick(sID, uID) {
        var self = this;
        self.client.kick({serverID: sID, userID: uID});
    }

    Ban(sID, uID, Days) {
        var self = this;
        self.client.ban({serverID: sID, userID: uID, lastDays: Days});
    }

    Unban(sID, uID) {
        var self = this;
        self.client.unban({serverID: sID, userID: uID});
    }

    Mute(sID, uID) {
        var self = this;
        self.client.mute({serverID: sID, userID: uID});
    }

    Unmute(sID, uID) {
        var self = this;
        self.client.unmute({serverID: sID, userID: uID});
    }

    JoinVoiceChannel(voiceID) {
        var self = this;
        this.client.joinVoiceChannel(voiceID, function(err) {
            if (err) {
                console.log(err);
            } else {}
        })
    }

    LeaveVoiceChannel(voiceID) {
        var self = this;
        this.client.leaveVoiceChannel(voiceID, function(err) {
            if (err) {
                console.log(err);
            } else {}
        })
    }
    JoinUsersVoiceChannel(serverID, userID) {
        var user = this.GetUserByID(serverID, userID);
        if (!user) {
            return;
        }
        this.JoinVoiceChannel(user.voice_channel_id);
    }
    LeaveUsersVoiceChannel(serverID, userID) {
        var user = this.GetUserByID(serverID, userID);
        if (!user) {
            return;
        }
        this.LeaveVoiceChannel(user.voice_channel_id);
    }
    GetServerByID(id) {
        var servers = this.client.servers;
        return servers[id];
    }
    GetUserByID(serverId, userId) {
        var server = this.GetServerByID(serverId);
        if (!server) {
            return;
        }
        return server.members[userId];
    }
    GetServerMemberByID(userID,serverID){
      return this.client.servers[serverID].members[userID];
    }
    GetUserRoles(serverId, userId) {
        var user = this.GetUserByID(serverId, userId);
        if (!user) {
            return;
        }
        return user.roles;
    }

    GetRoleById(serverId, roleId) {
        var server = this.GetServerByID(serverId);
        if (!server) {
            return;
        }
        return server.roles[roleId];
    }
    GetBotInfo() {
        var self = this;
        return {
            username: self.client.username,
            id: self.client.id,
            avatar: self.client.avatar,
            bot: self.client.bot,
            discriminator: self.client.discriminator,
        }
    }
    GetUserInfo(UserID) {
        var self = this;
        return self.client.users[UserID];
    }
    GetSnowflakeDate(resourceID) {
        return new Date(parseInt(resourceID) / 4194304 + 1420070400000);
    }
    GetMessage(channelID, MessageID){
      var self = this;
      return new Promise(function(resolve, reject) {
        self.client.getMessage({
          channelID: channelID,
          MessageID: MessageID
        }, function (err, res) {
          if(err){
            reject(err);
          }else {
            resolve(res);
          }
        })
      });
    }
    AddReaction(channelID, messageID, reaction){
      var self = this;
      return new Promise(function(resolve, reject) {
        self.client.addReaction({
          channelID: channelID,
          messageID: messageID,
          reaction: reaction
        }, function(err, res) {
          if(err){
            reject(err);
          }else {
            resolve(res);
          }
        });
      });
    }
    GetReaction(channelID, messageID, reaction){
      var self = this;
      return new Promise(function(resolve, reject) {
        self.client.getReaction({
          channelID: channelID,
          messageID: messageID,
          reaction: reaction
        }, function(err, res) {
          if(err){
            reject(err);
          }else {
            resolve(res);
          }
        });
      });
    }
    RemoveReaction(channelID, messageID, reaction){
      var self = this;
      return new Promise(function(resolve, reject) {
        self.client.removeReaction({
          channelID: channelID,
          messageID: messageID,
          reaction: reaction
        }, function(err, res) {
          if(err){
            reject(err);
          }else {
            resolve(res);
          }
        });
      });
    }
    RemoveAllReactions(channelID, messageID){
      var self = this;
      return new Promise(function(resolve, reject) {
        self.client.AddReaction({
          channelID: channelID,
          messageID: messageID
        }, function(err, res) {
          if(err){
            reject(err);
          }else {
            resolve(res);
          }
        });
      });
    }
    pageResults(arr, page, perPage=10){
      var returnArr = [];
      var maxindex;
      var startindex;
      if (page == 1) {
        page = 1;
        startindex = 0
        maxindex = perPage;
      }else {
        maxindex = (page * perPage);
        startindex = maxindex - perPage;
      }
      for (var i = startindex; i < arr.length; i++) {
        if(i == maxindex)break;
        returnArr.push(arr[i]);
      }
      return returnArr;
    }
}

module.exports = Bot;
