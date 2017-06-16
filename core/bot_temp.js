
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
  return new Promise(function(resolve, reject) {
    var self = this;
    axios.patch('https://discordapp.com/api/users/@me', {
        name: name
      }, {
        headers: {
          'Authorization': "Bot " + self.key
        }
      })
      .then(function(response) {
        resolve(response.data);
      })
      .catch(function(err) {
        Logging.Error("Bot", "SetUsername", err.message + " : " + err.response.statusText);
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
  Logging.Error("Bot", "SetServerName", "NOT IMPLEMENTED");
  return;
}

/**
 * Kicks the specified user id from the server
 * @param {string} serverID - ID of the server
 * @param {string} userID - ID of the user going to be kicked
 */
Kick(sID, uID) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var self = this;
    axios.delete('https://discordapp.com/api/guilds/' + serverId + '/members/' + userID, {
        headers: {
          'Authorization': "Bot " + self.key
        }
      })
      .then(function(response) {
        resolve(response.data);
      })
      .catch(function(err) {
        Logging.Error("Bot", "Kick", err.message + " : " + err.response.statusText);
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
  return new Promise(function(resolve, reject) {
    var self = this;

    axios.put('https://discordapp.com/api/guilds/' + serverId + '/bans/' + userID, {
        'delete-message-days': Days
      }, {
        headers: {
          'Authorization': "Bot " + self.key
        }
      })
      .then(function(response) {
        resolve(resp.data);
      })
      .catch(function(err) {
        Logging.Error("Bot", "Ban", err.message + " : " + err.response.statusText);
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
  return new Promise(function(resolve, reject) {
    var self = this;

    axios.delete('https://discordapp.com/api/guilds/' + serverId + '/bans/' + userID, {}, {
        headers: {
          'Authorization': "Bot " + self.key
        }
      })
      .then(function(response) {
        resolve(resp.data);
      })
      .catch(function(err) {
        Logging.Error("Bot", "Unban", err.message + " : " + err.response.statusText);
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
  return this.guilds[id];
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
  var members = self.disnode.util.arrayToOject(this.guilds[serverID].members, "user.id");
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
  var server = this.guilds[serverId];
  if (!server) {
    return;
  }
  var roles = self.disnode.util.arrayToOject(server.roles, "id");
  return roles[roleId];
}
GetUserStatus(serverId, UserId) {
  var statuses = this.guilds[serverId].presences;

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

SendDM(userID, msg){
  var self = this;
  return new Promise(function(resolve, reject) {
    self.GetOrCreateDM(userID).then(function(channel){
      var msgObject = {
        content: msg || "undefined",

      };
      axios.post('https://discordapp.com/api/channels/' + channel + '/messages', msgObject, {
          headers: {
            'Authorization': "Bot " + self.key
          }
        })
        .then(function(response) {
          resolve(response.data);
        })
        .catch(function(err) {
          Logging.Error("Bot", "SendDM", err.message + " : " + err.response.statusText);
          reject(err);
        });
    });
  });
}
SendDMEmbed(userID, embed){
  var self = this;
  return new Promise(function(resolve, reject) {
    self.GetOrCreateDM(userID).then(function(channel){
      var msgObject = {
        embed: embed
      };
      axios.post('https://discordapp.com/api/channels/' + channel + '/messages', msgObject, {
          headers: {
            'Authorization': "Bot " + self.key
          }
        })
        .then(function(response) {
          resolve(response.data);
        })
        .catch(function(err) {
          Logging.Error("Bot", "SendDMEmbed", err.message + " : " + err.response.statusText);
          reject(err);
        });
    });
  });
}

// ===== //
GetOrCreateDM(userID){
  var self = this;
  return new Promise(function(resolve, reject) {
    axios.post('https://discordapp.com/api/users/@me/channels',  {recipient_id: userID}, {
        headers: {
          'Authorization': "Bot " + self.key
        }
      })
      .then(function(response) {

        resolve(response.data.id);
      })
      .catch(function(err) {
        Logging.Error("Bot", "GetOrCreateDM",err);
        reject(err);
      });
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
