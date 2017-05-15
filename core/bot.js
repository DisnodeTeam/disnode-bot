var net = require('net');

var shortid = require('shortid');
var Discord = require('discord.io');
var Logger = require('disnode-logger');

const axios = require('axios');
const WebSocket = require('ws');

const codes    = require("./api/codes");
const requests = require('./api/request')
const async    = require('async');
var EventEmitter = require('events').EventEmitter;

/**
 * Class to ineract with Discord
 * @constructor
 * @param {string} key - Discord Bot Key
 * @param {DisnodeObj} disnode - Refrence to Disnode Class (disnode.js)
 */
class Bot extends EventEmitter{
    constructor(key, disnode) {
        super();
        this.key            = key;
        this.client         = {};
        this.disnode        = disnode;
        this.bind_onMessage = null;
        this.isRemote       = false;
        this.remoteID       = "";
        this.shardID        = 0;

        this.servers        = {count: 0};
        this.members        = {count: 0};
        this.channels       = {count: 0};
    }
    /**
     * Connect bot to Discord
     */
    Connect() {
        var self = this;
        return new Promise(function(resolve, reject) {
          self.GetGatewayURL().then(function(url){
            return self.ConnectToGateway(url)
          }).then(function(){
            self.on("READY",function(){
              resolve();
            })
          }).catch(function(err){
            Logger.Error("Bot", "Connect", "Connection Error: " + err);
          })
        });
    }

    GetGatewayURL(){
      var self = this;
      return new Promise(function(resolve, reject) {
        Logger.Info("Bot", "GetGatewayURL", "Aquiring Gatway URL...");
        axios.get('https://discordapp.com/api/gateway/bot', {
          headers: {
            'Authorization': "Bot " + self.key
          }
        }).then(function (response) {
          Logger.Success("Bot", "GetGatewayURL", "Aquired Gatway URL!");
            var url = response.data.url + "/?encoding=json&v=5";
          resolve(url)
        }).catch(function(err){
          Logger.Error("Bot", "GetGatewayURL", "Error Aquiring Gatway URL: " + err);
          reject(err);
        });
      });
    }

    ConnectToGateway(url){
      var self = this;
      return new Promise(function(resolve, reject) {
        Logger.Info("Bot", "ConnectToGateway", "Connecting to gateway");
        self.ws = new WebSocket(url);

        self.BindSocketEvents();

        self.ws.on('open', function(){
          Logger.Success("Bot", "ConnectToGateway", "Connected to gateway!");
          resolve();
        });

      });
    }


    BindSocketEvents(){
      var self = this;
      self.ws.on("message",function(data,flags){self.OnWSMessage(data, flags);});
    }
    OnWSMessage(data,flags){
      data = JSON.parse(data);
      var operation = data.op;
      var self = this;
      switch(operation){
        case codes.OPCode.HELLO:
          self.wsIdentify();
        break;

        case codes.OPCode.DISPATCH:
          self.handleDispatch(data);
        break;
      }
    }

    wsIdentify(){
      var self = this;
      Logger.Info("Bot", "wsIdentify", "Sending ID to Gateway");
      var packet = requests.identify(this.key);
      self.ws.send(JSON.stringify(packet));
    }

    handleDispatch(data){
      var type = data.t;
      var self = this;
      console.log(type);
      switch(type){
        case codes.dispatch.READY:
          self.emit("READY");
        break;

        case codes.dispatch.MESSAGE_CREATE:
          self.emit("message", data.d);
        break;

        case codes.dispatch.GUILD_CREATE:
          self.emit('guild_create', data.d);
          self.handleGuildCreate(data.d);
        break;
      }
    }

    handleGuildCreate(data){
      this.servers[data.id] = data;

      for(var i=0;i<data.channels.length;i++){
        data.channels[i].guild_id = data.id;

        this.channels[data.channels[i].id] = data.channels[i];
        this.channels.count += 1;

      }
      for(var i=0;i<data.members.length;i++){
        this.members[data.members[i].id] == data.members[i];
        this.members.count+= 1 ;
      }
      console.log("ADDED NEW SERVER: " + this.channels.count + " CHANNELS, " + this.members.count);
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
        self.on('message', function(data) {
            var firstLetter = data.content.substring(0, self.disnode.botConfig.prefix.length);
            if (self.disnode.ready && firstLetter == self.disnode.botConfig.prefix) {
                var _server = "DM";
                if (self.channels[data.channel_id]) {
                    _server = self.channels[data.channel_id].guild_id;
                    console.log(_server);
                }
                var msgObject = {
                    user: data.author.username,
                    userID: data.author.id,
                    channel: data.channel_id,
                    message: data.content,
                    server: _server,
                    obj: data
                };

                this.disnode.server.GetCommandInstancePromise(msgObject.server).then(function(inst){

                  if(inst){
                    inst.RunMessage(msgObject);
                  }else{
                    Logging.Warning("Bot", "Message", "No Command Handler!");
                  }
                });

            }

        });
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

          var msgObject = {
              content: msg,
              typing: typing,
              tts: tts
          };
          console.log(channel);
          axios.post('https://discordapp.com/api/channels/'+channel+'/messages', msgObject,
            {headers: {'Authorization': "Bot " + self.key}})
          .then(function (response) {
            resolve(resp.data);
          })
          .catch(function(err){
            console.log(err);
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

        axios.post('https://discordapp.com/api/channels/'+channel+'/messages', msgObject,
          {headers: {'Authorization': "Bot " + self.key}})
        .then(function (response) {
          resolve(resp.data);
        })
        .catch(function(err){
          reject(err);
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
    /**
    * Kicks the specified user id from the server
    * @param {string} serverID - ID of the server
    * @param {string} userID - ID of the user going to be kicked
    */
    Kick(sID, uID) {
        var self = this;
        self.client.kick({serverID: sID, userID: uID});
    }
    /**
    * Bans the specified user id from the server
    * @param {string} serverID - ID of the server
    * @param {string} userID - ID of the user going to be banned
    * @param {number} Days - (Optional)The number of days worth of messages to delete
    */
    Ban(sID, uID, Days) {
        var self = this;
        self.client.ban({serverID: sID, userID: uID, lastDays: Days});
    }
    /**
    * Unabn the specified user id from the server
    * @param {string} serverID - ID of the server
    * @param {string} userID - ID of the user going to be unbanned
    */
    Unban(sID, uID) {
        var self = this;
        self.client.unban({serverID: sID, userID: uID});
    }
    /**
    * Mutes the specified user id from the server
    * @param {string} serverID - ID of the server
    * @param {string} userID - ID of the user going to be muted
    */
    Mute(sID, uID) {
        var self = this;
        self.client.mute({serverID: sID, userID: uID});
    }
    /**
    * Unmutes the specified user id from the server
    * @param {string} serverID - ID of the server
    * @param {string} userID - ID of the user going to be unmuted
    */
    Unmute(sID, uID) {
        var self = this;
        self.client.unmute({serverID: sID, userID: uID});
    }
    /**
    * Joins the channel that the user is in
    * @param {string} voiceID - ID of the voice channel
    */
    JoinVoiceChannel(voiceID) {
        var self = this;
        this.client.joinVoiceChannel(voiceID, function(err) {
            if (err) {
                console.log(err);
            } else {}
        })
    }
    /**
    * Leaves the channel that the user is in
    * @param {string} voiceID - ID of the voice channel
    */
    LeaveVoiceChannel(voiceID) {
        var self = this;
        this.client.leaveVoiceChannel(voiceID, function(err) {
            if (err) {
                console.log(err);
            } else {}
        })
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
        var servers = this.client.servers;
        return servers[id];
    }
    /**
    * Gets information about that user in the server
    * @param {string} serverID - ID of the server
    * @param {string} userID - Id of the user
    */
    GetUserByID(serverID, userID){
      return this.servers[serverID].members[userID];
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
        var server = this.GetServerByID(serverId);
        if (!server) {
            return;
        }
        return server.roles[roleId];
    }
    /**
    * Gets information about the bot
    */
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
    /**
    * Gets minimal information about the specified user
    * @param {string} userID - ID of the user
    */
    GetUserInfo(UserID) {
        var self = this;
        return self.client.users[UserID];
    }
    GetSnowflakeDate(resourceID) {
        return new Date(parseInt(resourceID) / 4194304 + 1420070400000);
    }
    /**
    * Gets message info of a message
    * @param {string} channelID - ID of the channel
    * @param {string} messageID - ID of the message
    */
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
    /**
    * Adds reaction to a message
    * @param {string} channelID - ID of the channel
    * @param {string} messageID - ID of the message
    * @param {string} reactionID - ID or unicode of a reactionID
    */
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
    /**
    * Gets reaction of a message
    * @param {string} channelID - ID of the channel
    * @param {string} messageID - ID of the message
    * @param {string} reactionID - ID or unicode of a reactionID
    */
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
    /**
    * Removes reaction from a message
    * @param {string} channelID - ID of the channel
    * @param {string} messageID - ID of the message
    * @param {string} reactionID - ID or unicode of a reactionID
    */
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
    /**
    * Removes all reactions from a message
    * @param {string} channelID - ID of the channel
    * @param {string} messageID - ID of the message
    */
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
    /**
    * Pagify results
    * @param {array} arr - Array to be paged
    * @param {integer} page - Page number
    * @param {integer} perPage - Results per page
    */
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
