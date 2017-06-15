/**
 * Object Returned for ANY Disnode Error. Standardized to make error handling
 *universial across discord. The raw error object is always returned however
 *incase you need all of the information.
 * @typedef {Object} ErrorObject
 * @property {string} message - Error Message
 * @property {string} code - Error Code
 * @property {string} display - Formated Version of Message and Code used when
 * logging or displaying the error.
 * @property {Object} raw - Full Error Object Returned
 */


// CHANNEL OBJECTS

/**
 * Object used to describe a channel
 * @typedef {Object} ChannelObject
 * @property {snowflake} id -the id of this channel (will be equal to the guild if it's the "general" channel)
 * @property {guild_id} guild_id - the id of the guild
 * @property {string} type - "text" or "voice"
 * @property {integer} position - sorting position of the channel
 * @property {bool} is_private - should always be false for guild channels
 * @property {array} permission_overwrites - an array of overwrite objects
 * @property {string} topic - 0-1024 character channel topic
 * @property {snowflake} last_message_id - 	the id of the last message sent in this channel
 * @property {integer} bitrate - 	the bitrate (in bits) of the voice channel
 * @property {integer} bitrate - 	the user limit of the voice channel
 */

/**
 * Object used to update a channel
 * @typedef {Object} ChannelSettings
 * @property {string} name - 2-100 character channel name
 * @property {int} position - the position of the channel in the left-hand listing
 * @property {string} topic - 0-1024 character channel topic
 * @property {int} bitrate - the bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers)
 * @property {int} user_limit - the user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit
 */

/**
 * Object used to when retriving channel messages
 * @typedef {Object} GetMessageSettings
 * @property {snowflake} around -	get messages around this message ID
 * @property {snowflake} before - get messages before this message ID
 * @property {snowflake} after - get messages after this message ID
 * @property {integer} limit - max number of messages to return (1-100)
 */

 /**
  * Object used to when creating Invite
  * @typedef {Object} CreateInviteSettings
  * @property {integer} max_age -	duration of invite in seconds before expiry, or 0 for never
  * @property {integer} max_uses - max number of uses or 0 for unlimited
  * @property {bool} temporary - whether this invite only grants temporary membership
  * @property {bool} unique	 - if true, don't try to reuse a similar invite (useful for creating many unique one time use invites)
  */











/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} MessageDeleteObject
 * @property {string} channel - Channel the message was deleted in
 * @property {string} server - Server the message was deleted in
 * @property {object} raw - Raw data sent from Discord
 */

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} MessageObject
 * @property {string} id - Message ID
 * @property {string} user - Sender's Username
 * @property {string} userID - Sender's ID
 * @property {string} channel - Channel the message was deleted in
 * @property {string} message - Actual Message
 * @property {string} server - server the message was deleted in
 * @property {object} raw - Raw data sent from Discord
 */

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} CommandObject
 * @property {string} cmd - Command String (IE: "test-command")
 * @property {string} run - Function To Run
 */
/*
APIUtil.APIGet("gateway/bot", self.key)
.then(function(data){

})
.catch(function(err){
  Logger.Error("Bot", "GetGatewayURL", "Error Aquiring Gatway URL: " + err.display);
  reject(err);
});
*/
