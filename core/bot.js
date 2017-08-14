const net = require('net');
const shortid = require('shortid');
const Logger = require('disnode-logger');
const axios = require('axios');
const WebSocket = require('ws');
const codes = require("./api/codes");
const Logging = require('disnode-logger');
const requests = require('./api/request')
const APIUtil = require("./api/apiutils");
const async = require('async');
const EventEmitter = require('events').EventEmitter;


/**
 * Class to ineract with Discord
 * @constructor
 * @param {string} key - Discord Bot Key
 * @param {DisnodeObj} disnode - Refrence to Disnode Class (disnode.js)
 * @property {string} key - The Bot's Discord Key
 * @property {BotInfoObject} botInfo - Information about the bot
 * @property {Disnode} disnode - Disnode Refrence
 * @property {string} shardID - Bot's Shard ID
 * @property {string} lastS - Last 's' sent in a WS Packet (internal use mostly)
 * @property {Object<GuildObject>} guilds - The Guilds the bot belonds to. Object so access via `this.disnode.bot.guilds[guildID]`
 * @property {Object<ChannelObject>} channels - All the channels. Object so access via `this.disnode.bot.channels[channelID]`
 * @property {Object<UserObject>} users - All the users. Object so access via `this.disnode.bot.users[userID]`
 */
class Bot extends EventEmitter {
  constructor(key, disnode) {
    super();
    this.key = key;
    this.botInfo = {};
    this.disnode = disnode;
    this.shardID = 0;
    this.lastS = null;
    this.guilds = {
      count: 0
    };
    this.channels = {
      count: 0
    };
    this.users = {
      count: 0
    };
    this.setMaxListeners(1000);
  }

  /**
   * Connect bot to Discord
   */
  Connect() {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.GetGatewayURL().then(function(url) {
        return self.ConnectToGateway(url)
      }).then(function() {
        self.on("ready", function() {
          self.CacheBotUser();
          resolve();
        })
      }).catch(function(err) {
        Logger.Error("Bot", "Connect", "Connection Error: " + err);
      })
    });
  }

  ConnectToGateway(url) {
    var self = this;
    return new Promise(function(resolve, reject) {
      Logger.Info("Bot", "ConnectToGateway", "Connecting to gateway");
      self.ws = new WebSocket(url);

      self.BindSocketEvents();

      self.ws.on('open', function() {
        Logger.Success("Bot", "ConnectToGateway", "Connected to gateway!");
        resolve();
      });

    });
  }

  WSIdentify() {
    var self = this;
    Logger.Info("Bot", "wsIdentify", "Sending ID to Gateway");
    var packet = requests.identify(this.key);
    self.ws.send(JSON.stringify(packet));
  }

  StartHeartbeat(interval) {
    var self = this;
    Logger.Info("Bot", "StartHeartbeat", "Starting Heatbeat with Interval: " + interval);
    var packet = requests.heartbeat(self.lastS);
    self.ws.send(JSON.stringify(packet));

    setInterval(function() {
      var packet = requests.heartbeat(self.s);
      self.ws.send(JSON.stringify(packet));
    }, interval)
  }

  BindSocketEvents() {
    var self = this;
    self.ws.on("message", function(data, flags) {
      self.OnWSMessage(data, flags);

    });

    self.ws.on('error', function(error) {
      console.log(error);
      var ErrorObject = {
        message: error.message,
        status: "WS-000",
        display: "WebSocket Error [" + error.response.status + "] " + error.message,
        raw: error
      }
      Logger.Error("Bot", "WS-ERROR", ErrorObject.display);
      self.emit("error", ErrorObject);
    });
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

        self.WSIdentify();
        self.StartHeartbeat(data.d['heartbeat_interval'])
        break;

      case codes.OPCode.DISPATCH:
        self.HandleDispatch(data);
        break;
      case codes.OPCode.HEARTBEAT_ACK:

        break;
    }
  }

  HandleDispatch(data) {
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
        self.emit("ready");
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
        self.CacheGuild(data.d);
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
        var data = data.d;
        data.guildID = self.GetGuildIDFromChannel(data.channel_id);
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
          server: self.GetGuildIDFromChannel(data.d.channel_id),
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
        var data = data.d;
        data.guildID = self.GetGuildIDFromChannel(data.channel_id);
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

  CacheGuild(data) {
    this.guilds[data.id] = data;

    for (var i = 0; i < data.channels.length; i++) {
      data.channels[i].guild_id = data.id;

      this.channels[data.channels[i].id] = data.channels[i];
      this.channels.count += 1;
    }
    var mem = this.guilds[data.id].members

    var rawUsers = [];
    for (var i = 0; mem.length; i++) {
      if (mem[i] == null) {
        return;
      }
      this.users[mem[i].user.id] = mem[i].user;
    }
  }

  CacheBotUser() {
    var self = this;
    Logger.Info("Bot", "GetCacheInfo", "Caching Bot Info.");

    APIUtil.APIGet(self.key, "users/@me")
      .then(function(data) {
        Logger.Success("Bot", "GetCacheInfo", "Cached Bot Info!")
        self.botInfo = data;
      })
      .catch(function(err) {
        Logger.Error("Bot", "GetCacheInfo", "Error Caching Bot Info: " + err.display);
        reject(err);
      });
  }

  SetUpLocalBinds() {
    var self = this;
    self.on('message', function(data) {
      var firstLetter = data.content.substring(0, self.disnode.botConfig.prefix.length);
      if (self.disnode.ready && firstLetter == self.disnode.botConfig.prefix) {
        this.disnode.server.GetCommandInstancePromise(data.guildID).then(function(inst) {
          if (inst) {
            inst.RunMessage(data);
          } else {
            Logging.Warning("Bot", "Message", "No Command Handler!");
          }
        });
      }
    });
  }

  GetGatewayURL() {
    var self = this;
    return new Promise(function(resolve, reject) {
      Logger.Info("Bot", "GetGatewayURL", "Aquiring Gatway URL...");

      APIUtil.APIGet(self.key, "gateway/bot")
        .then(function(data) {
          console.log(data);
          Logger.Success("Bot", "GetGatewayURL", "Aquired Gatway URL!");
          var url = data.url + "/?encoding=json&v=5";
          resolve(url)
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGatewayURL", "Error Aquiring Gatway URL: " + err.display);
          reject(err);
        });
    });
  }

  /**
   * Get a channel by an ID
   * @param {string} channelID - ChannelID of where to send the message
   * @return {Promise<ChannelObject|ErrorObject>} Return Channel Object
   */
  GetChannel(channelID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "/channels/" + channelID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetChannel", err.display);
          reject(err);
        });
    });
  }

  /**
   * Update a Channel
   * @param {string} channelID - ChannelID of where to send the message
   * @param {ChannelSettings} settings - Settings for channel
   * @return {Promise<ChannelObject|ErrorObject>} Return Promise
   */
  UpdateChannel(channelID, settings) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "/channels/" + channelID, settings)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "UpdateChannel", err.display);
          reject(err);
        });
    });
  }

  /**
   * Delete a Channel
   * @param {string} channelID - ChannelID of where to send the message
   * @return {Promise<ChannelObject|ErrorObject>} Return Promise
   */
  DeleteChannel(channelID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "/channels/" + channelID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteChannel", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns the messages for a channel.
   * @param {string} channelID - ChannelID of where to send the message
   * @param {GetMessageSettings} settings - Settings for retriving messages (ALL OPTIONAL)
   * @return {Promise<Array<MessageObject>|ErrorObject>} Return Promise
   */
  GetMessages(channelID, settings = {}) {
    var self = this;

    return new Promise(function(resolve, reject) {

      APIUtil.APIGet(self.key, "/channels/" + channelID + "/messages", settings)
        .then(function(data) {

          resolve(data);
        })
        .catch(function(err) {
          console.log("ERR", err);
          Logger.Error("Bot", "GetChannelMessages", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a message
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - Message ot get
   * @return {Promise<MessageObject|ErrorObject>} Return Promise
   */
  GetMessage(channelID, messageID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "/channels/" + channelID + "/messages/" + messageID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetMessage", err.display);
          reject(err);
        });
    });
  }

  /**
   * Send a normal message
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} message - The message to send
   * @param {bool} tts - (Optional)Text-To-Speech Enabled?
   */
  SendMessage(channelID, message, tts = false) {
    var self = this;
    return new Promise(function(resolve, reject) {

      var msgObject = {
        content: message,
        tts: tts
      };
      if (!message || message == "") {
        msgObject.content = "`DisnodeAPIAutoError: Messaged was empty or null`"
      }
      APIUtil.APIPost(self.key, "channels/" + channelID + "/messages", msgObject)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "SendMessage", err.display);
          reject(err);
        });
    });
  }
  /**
   * Sends a DM
   * @param {string} userID - ChannelID of where to send the message
   * @param {EmbedObject} message - the Embed Object to send
   */
  SendDMMessage(userID, message) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.GetOrCreateDM(userID).then(function(channel) {
        var msgObject = {
          content: message,
          tts: tts
        };
        if (!message || message == "") {
          msgObject.content = "`DisnodeAPIAutoError: Messaged was empty or null`"
        }
        APIUtil.APIPost(self.key, "channels/" + channel + "/messages", msgObject)
          .then(function(data) {
            resolve(data);
          })
          .catch(function(err) {
            Logger.Error("Bot", "*/", err.display);
            reject(err);
          });
      });
    });
  }
  /**
   * Sends a Embed
   * @param {string} channelID - ChannelID of where to send the message
   * @param {EmbedObject} embed - the Embed Object to send
   */
  SendEmbed(channelID, embed, tts = false, file = null) {
    var self = this;
    return new Promise(function(resolve, reject) {

      var msgObject = {
        embed: embed,
        tts: tts,
        file: file
      };
      if (!embed || embed == {}) {
        msgObject.content = "`DisnodeAPIAutoError: Embed Object was null;`"
      }

      APIUtil.APIPost(self.key, "channels/" + channelID + "/messages", msgObject)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "SendEmbed", err.display);
          reject(err);
        });
    });
  }
  /**
   * Sends a Embed
   * @param {string} userID - ChannelID of where to send the message
   * @param {EmbedObject} embed - the Embed Object to send
   */
  SendDMEmbed(userID, embed) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.GetOrCreateDM(userID).then(function(channel) {
        var msgObject = {
          embed: embed
        };
        APIUtil.APIPost(self.key, 'channels/' + channel + '/messages', msgObject)
          .then(function(data) {
            resolve(data);
          })
          .catch(function(err) {
            Logger.Error("Bot", "SendDMEmbed", err.display);
            console.dir(err);
            reject(err);
          });
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
  SendCompactEmbed(channelID, title, body, color = 3447003) {
    var self = this;
    return new Promise(function(resolve, reject) {

      var msgObject = {
        embed: {
          color: color,
          author: {},
          fields: [{
            name: title,
            inline: false,
            value: "" + body,
          }],
          footer: {}
        }
      };
      APIUtil.APIPost(self.key, "channels/" + channelID + "/messages", msgObject)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "SendCompactEmbed", err.display);
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
  SendDMCompactEmbed(userID, title, body, color = 3447003) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.GetOrCreateDM(userID).then(function(channel) {
        var msgObject = {
          embed: {
            color: color,
            author: {},
            fields: [{
              name: title,
              inline: false,
              value: "" + body,
            }],
            footer: {}
          }
        };
        APIUtil.APIPost(self.key, "channels/" + channel + "/messages", msgObject)
          .then(function(data) {
            resolve(data);
          })
          .catch(function(err) {
            Logger.Error("Bot", "SendDMCompactEmbed", err.display);
            reject(err);
          });

      });
    });
  }

  /**
   * Adds a reaction to a message
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - Message to react to
   * @param {string} emoji     - Emoji to react with
   */
  AddReaction(channelID, messageID, emoji) {
    var self = this;
    return new Promise(function(resolve, reject) {

      APIUtil.APIPut(self.key,
          "channels/" + channelID + "/messages/" + messageID + "/reactions/" + emoji + "/@me"
        ).then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "AddReaction", err.display);
          reject(err);
        });
    });
  }

  /**
   * Deletes Own Reaction
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - Message to react to
   * @param {string} emoji     - Emoji to delete
   */
  DeleteOwnReaction(channelID, messageID, emoji) {
    var self = this;
    return new Promise(function(resolve, reject) {

      APIUtil.APIDelete(self.key,
          "channels/" + channelID + "/messages/" + messageID + "/reactions/" + emoji + "/@me"
        ).then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteOwnReaction", err.display);
          reject(err);
        });
    });
  }

  /**
   * Deletes Own Reaction
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - Message to react to
   * @param {string} emoji     - Emoji to delete
   * @param {string} userID     - UserID
   */
  DeleteUserReaction(channelID, messageID, emoji, userID) {
    var self = this;
    return new Promise(function(resolve, reject) {

      APIUtil.APIDelete(self.key,
          "channels/" + channelID + "/messages/" + messageID + "/reactions/" + emoji + "/" + userID
        ).then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteUserReaction", err.display);
          reject(err);
        });
    });
  }
  /**
   * Delete All Reactions
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - Message to react to
   */
  DeleteAllReaction(channelID, messageID) {
    var self = this;
    return new Promise(function(resolve, reject) {

      APIUtil.APIDelete(self.key,
          "channels/" + channelID + "/messages/" + messageID + "/reactions"
        ).then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteAllReaction", err.display);
          reject(err);
        });
    })
  }
  /**
   * Get a list of users that reacted with this emoji.
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - Message to react to
   * @param {string} emoji     - Emoji to delete
   */
  GetReactions(channelID, messageID, emoji) {
    var self = this;
    return new Promise(function(resolve, reject) {

      APIUtil.APIGet(self.key,
          "channels/" + channelID + "/messages/" + messageID + "/reactions/" + emoji
        ).then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetReactions", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edit Message
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - message to edit
   * @param {string} message - The new message
   */
  EditMessage(channelID, messageID, message) {
    var self = this;
    return new Promise(function(resolve, reject) {

      var msgObject = {
        content: msg
      };
      if (!message || message == "") {
        msgObject.content = "`DisnodeAPIAutoError: Message was empty or null`"
      }
      APIUtil.APIPatch(self.key, "channels/" + channelID + "/messages/" + messageID, msgObject)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditMessage", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edits a Embed
   * @param {string} channelID - ChannelID of where to send the message
   * @param {string} messageID - message to edit
   * @param {EmbedObject} embed - the Embed Object to send
   */
  EditEmbed(channelID, messageID, embed) {
    var self = this;
    return new Promise(function(resolve, reject) {

      var msgObject = {
        embed: embed
      };
      if (!embed || embed == {}) {
        msgObject.content = "`DisnodeAPIAutoError: Embed Object was null;`"
      }

      APIUtil.APIPatch(self.key, "channels/" + channelID + "/messages/" + messageID, msgObject)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditEmbed", err.display);
          reject(err);
        });
    });
  }

  /**
   * send an embed as a compact one, less lines defining a embed object
   * @param {string} channelID - ChannelID of the message
   * @param {string} messageID - message to edit
   * @param {string} title - The title of the embed
   * @param {string} body - The body of the embed
   * @param {int|RGBint} color - (Optional)RGB Int of what color the embed should be (default 3447003)
   */
  EditCompactEmbed(channelID, messageID, title, body, color = 3447003) {
    var self = this;
    return new Promise(function(resolve, reject) {

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
      APIUtil.APIPatch(self.key, "channels/" + channelID + "/messages/" + messageID, msgObject)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditCompactEmbed", err.display);
          reject(err);
        });
    });
  }
  /**
   * Delete a message
   * @param {string} channelID - ChannelID of the message
   * @param {string} messageID - message to delete
   */
  DeleteMessage(channelID, messageID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "channels/" + channelID + "/messages/" + messageID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteMessage", err.display);
          reject(err);
        });
    });
  }


  /**
   * Delete mulitple messages
   * @param {string} channelID - ChannelID of the message
   * @param {string} messageIDs - messages to delete (array)
   */
  DeleteMessages(channelID, messageIDs) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "channels/" + channelID + "/messages/bulk-delete", {
          messages: messageIDs
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteMessages", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edit the channel permission overwrites for a user or role in a channel.
   * @param {string} channelID - ChannelID of the message
   * @param {string} overwriteID - ?????
   * @param {int} allowed -the bitwise value of all allowed permissions
   * @param {int} deny -the bitwise value of all disallowed  permissions
   * @param {string} type -	"member" for a user or "role" for a role
   */
  EditChannelPermissions(channelID, overwriteID, allowed, deny, type) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var data = {
        allow: allowed,
        deny: deny,
        type: type
      }
      APIUtil.APIPut(self.key, "channels/" + channelID + "/permissions/" + overwriteID, data)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditChannelPermissions", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a list of invite objects (with invite metadata) for the channel. Only usable for guild channels.
   * @param {string} channelID - ChannelID of the message
   */
  GetChannelInvites(channelID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "channels/" + channelID + "/invites")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetChannelInvites", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a list of invite objects (with invite metadata) for the channel. Only usable for guild channels.
   * @param {string} channelID - ChannelID of the message
   * @param {CreateInviteSettings} settings - Settings of new invite
   */
  CreateChannelInvite(channelID, settings) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "channels/" + channelID + "/invites", settings)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "CreateChannelInvite", err.display);
          reject(err);
        });
    })
  }

  /**
   * Delete a channel permission overwrite for a user or role in a channel. Only usable for guild channels.
   * @param {string} channelID - ChannelID of the message
   * @param {string} overwriteID - ?????
   */
  DeleteChannelPermission(channelID, overwriteID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "channels/" + channelID + "/permissions/" + overwriteID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteChannelPermission", err.display);
          reject(err);
        });
    });
  }

  /**
   * Triggers Typing Inidicator
   * @param {string} channelID - ChannelID to start typing in
   */
  StartTyping(channelID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "channels/" + channelID + "/typing")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "StartTyping", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns all pinned messages in the channel as an array of message objects.
   * @param {string} channelID - ChannelID to start typing in
   */
  GetPinnedMessages(channelID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "channels/" + channelID + "/pins")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetPinnedMessages", err.display);
          reject(err);
        });
    });
  }

  /**
   * Pin a message in a channel.
   * @param {string} channelID - ChannelID to start typing in
   * @param {string} messageID - Messaged to pin
   */
  AddPinnedMessage(channelID, messageID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPut(self.key, "channels/" + channelID + "/pins/" + messageID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "AddPinnedMessage", err.display);
          reject(err);
        });
    });
  }

  /**
   * Delete a pinned message in a channel.
   * @param {string} channelID - ChannelID to start typing in
   * @param {string} messageID - Messaged to unPIn
   */
  DeletePinnedMessage(channelID, messageID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "channels/" + channelID + "/pins/" + messageID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeletePinnedMessage", err.display);
          reject(err);
        });
    });
  }

  /**
   * Adds a recipient to a Group DM using their access token
   * @param {string} channelID - ChannelID to start typing in
   * @param {string} userID - User to add
   * @param {string} accessToken - access token of a user that has granted your app the gdm.join scope
   * @param {string} nick - 	nickname of the user being added
   */
  AddUserToGroupDM(channelID, userID, accessToken, nick) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var data = {
        access_token: accessToken,
        nick: nick
      };
      APIUtil.APIPut(self.key, "channels/" + channelID + "/recipients/" + userID, data)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "AddUserToGroupDM", err.display);
          reject(err);
        });
    });
  }

  /**
   * Removes a recipient from a Group DM
   * @param {string} channelID - ChannelID to start typing in
   * @param {string} userID - User to add
   */
  RemoveUserFromGroupDM(channelID, userID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var data = {
        access_token: accessToken,
        nick: nick
      };
      APIUtil.APIDelete(self.key, "channels/" + channelID + "/recipients/" + userID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "RemoveUserFromGroupDM", err.display);
          reject(err);
        });
    });
  }

  /**
   * Get Guild
   * @param {string} guildID - Guild ID
   */
  GetGuild(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGuild", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edit Guild
   * @param {string} guildID - Guild to Edit
   * @param {GuildEditObject} settings - New Guild Settings
   */
  EditGuilds(guildID, settings = {}) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "guilds/" + guildID, settings)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditGuilds", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a list of guild channel objects.
   * @param {string} guildID - Guild to Edit
   */
  GetGuildChannels(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/channels")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGuildChannels", err.display);
          reject(err);
        });
    });
  }

  /**
   * Create a new channel object for the guild.
   * @param {string} guildID - Guild to Edit
   * @param {ChannelSettings} settings - New Guild Info
   */
  CreateChannel(guildID, settings) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "guilds/" + guildID + "/channels", settings)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "CreateChannel", err.display);
          reject(err);
        });
    });
  }

  /**
   * Modify the positions of a set of channel objects for the guild.
   * @param {string} guildID - Guild to Edit
   * @param {string} channelID - Channel to Move
   * @param {integer} postion - Position of Channel
   */
  EditChannelPosition(guildID, channelID, postion) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "guilds/" + guildID + "/channels", {
          id: channelID,
          postion: position
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditChannelPosition", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a guild member object for the specified user.
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - User to retrivie
   */
  GetGuildMemeber(guildID, userID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/members/" + userID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGuildMemeber", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a list of guild member objects that are members of the guild.
   * @param {string} guildID - Guild to Edit
   * @param {integer} limit - Optional, defaults to 100
   * @param {snowflake} after - Optional - 	the highest user id in the previous page
   */
  ListGuildMemebers(guildID, userID, limit = 100, after) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/members/" + userID, {
          limit: limit,
          after: after
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "ListGuildMemebers", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edit a guild member
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - User to Edits
   * @param {MemberEditObject} settings - Setttings for member
   */
  EditGuildMember(guildID, userID, setting) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "guilds/" + guildID + "/members/" + userID, settings)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditGuildMember", err.display);
          reject(err);
        });
    });
  }


  /**
   * Set username of bot
   * @param {string} guildID - Guild to Edit
   * @param {string} nickname - new nickname
   */
  SetNickname(guildID, nickname) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "guilds/" + guildID + "/members/@me/nick", {
          nick: nickname
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "SetNickname", err.display);
          reject(err);
        });
    });
  }

  /**
   * Adds a role to a memeber
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - user ID
   * @param {string} roleID  - role ID
   */
  AddRole(guildID, userID, roleID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPut(self.key, "guilds/" + guildID + "/members/" + userID + "/roles/" + roleID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "AddRole", err.display);
          reject(err);
        });
    });
  }

  /**
   * Remove a role to a memeber
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - user ID
   * @param {string} roleID  - role ID
   */
  RemoveRole(guildID, userID, roleID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "guilds/" + guildID + "/members/" + userID + "/roles/" + roleID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "RemoveRole", err.display);
          reject(err);
        });
    });
  }

  /**
   * Remove a member from a guild.
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - user ID
   */
  RemoveMember(guildID, userID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "guilds/" + guildID + "/members/" + userID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "RemoveMember", err.display);
          reject(err);
        });
    });
  }

  /**
   * Gets ban for a guild
   * @param {string} guildID - Guild to Edit
   */
  GetBans(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "guilds/" + guildID + "/bans")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetBans", err.display);
          reject(err);
        });
    });
  }

  /**
   * Ban a user
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - User to ban
   * @param {integer} days - number of days to delete messages for (0-7)
   */
  BanUser(guildID, userID, days = 0) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPut(self.key, "guilds/" + guildID + "/bans/" + userID, {
          'delete-message-days': days
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "BanUser", err.display);
          reject(err);
        });
    });
  }

  /**
   * Ban a user
   * @param {string} guildID - Guild to Edit
   * @param {string} userID - User to ban
   */
  UnBanUser(guildID, userID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "guilds/" + guildID + "/bans/" + userID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "UnBanUser", err.display);
          reject(err);
        });
    });
  }

  /**
   * Get Guild Roles
   * @param {string} guildID - Guild to Edit
   */
  GetRoles(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/roles")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetRoles", err.display);
          reject(err);
        });
    });
  }

  /**
   * Create Guild Role
   * @param {string} guildID - Guild to Edit
   * @param {RoleCreateObject} setting - New Role
   */
  CreateRole(guildID, setting) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "guilds/" + guildID + "/roles", setting)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "CreateRole", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edit Role Position
   * @param {string} guildID - Guild to Edit
   * @param {string} roleID - Role to edit
   * @param {integer} position - New position
   */
  EditRolePosition(guildID, roleID, position) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "guilds/" + guildID + "/roles", {
          id: roleID,
          position: position
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditRolePosition", err.display);
          reject(err);
        });
    });
  }

  /**
   * Edit Role
   * @param {string} guildID - Guild to Edit
   * @param {string} roleID - Role to edit
   * @param {RoleCreateObject} settings - Role Settings
   */
  EditRole(guildID, roleID, settings) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "guilds/" + guildID + "/roles/" + roleID, settings)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditRole", err.display);
          reject(err);
        });
    });
  }

  /**
   * Delete Role
   * @param {string} guildID - Guild to Edit
   * @param {string} roleID - Role to edit
   * @param {RoleCreateObject} setting - Role Settings
   */
  DeleteRole(guildID, roleID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIDelete(self.key, "guilds/" + guildID + "/roles/" + roleID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "DeleteRole", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns an object with one 'pruned' key indicating the number of members that would be removed in a prune operation.
   * @param {string} guildID - Guild to Edit
   */
  GetGuildPruneCount(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/prune")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGuildPruneCount", err.display);
          reject(err);
        });
    });
  }

  /**
   * Begin a prune operation. Requires the 'KICK_MEMBERS' permission
   * @param {string} guildID - Guild to Edit
   */
  BeginGuildPrune(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, "guilds/" + guildID + "/prune")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "BeginGuildPrune", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a list of voice region objects for the guild.
   * @param {string} guildID - Guild to Edit
   */
  GetGuildVoiceRegions(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/regions")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGuildVoiceRegions", err.display);
          reject(err);
        });
    });
  }

  /**
   * Returns a list of invite objects (with invite metadata) for the guild
   * @param {string} guildID - Guild to Edit
   */
  GetGuildInvites(guildID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "guilds/" + guildID + "/invites")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetGuildInvites", err.display);
          reject(err);
        });
    });
  }

  /**
   * Get Bot user Object
   *
   */
  GetBotUser() {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "/users/@me")
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetBotUser", err.display);
          reject(err);
        });
    });
  }

  /**
   * Get Bot user Object
   * @param {string} userID - User to retrieve
   */
  GetUser(userID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIGet(self.key, "/users/" + userID)
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetBotUser", err.display);
          reject(err);
        });
    });
  }

  /**
   * Set the bots status
   * @param {string} status - User to retrieve
   */
  SetStatus(status) {
    var self = this;
    var packet = requests.presence(status);

    self.ws.send(JSON.stringify(packet));
  }
  /**
   * Edit Bot user Object
   * @param {string} username - Username
   * @param {string} avatar - Avatar Data
   */
  EditBotUser(username, avatar) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPatch(self.key, "/users/@me", {
          username: username,
          avatar: avatar
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          Logger.Error("Bot", "EditBotUser", err.display);
          reject(err);
        });
    });
  }

  GetOrCreateDM(userID) {
    var self = this;
    return new Promise(function(resolve, reject) {
      APIUtil.APIPost(self.key, '/users/@me/channels', {
          recipient_id: userID
        })
        .then(function(data) {
          resolve(data.id);
        })
        .catch(function(err) {
          Logger.Error("Bot", "GetOrCreateDM", err.display);
          reject(err);
        });
    });
  }

  /**
   * Gets a guild ID from a ChannelID
   * @param {string} channelID - ChannelID of where to send the message
   * @return {string} guildID
   */
  GetGuildIDFromChannel(channelID) {
    var self = this;
    var _server = "DM";
    if (self.channels[channelID]) {
      _server = self.channels[channelID].guild_id;
    }
    return _server;
  }

}
module.exports = Bot;
