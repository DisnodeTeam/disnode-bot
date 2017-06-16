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
 * @property {integer} position - the position of the channel in the left-hand listing
 * @property {string} topic - 0-1024 character channel topic
 * @property {integer} bitrate - the bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers)
 * @property {integer} user_limit - the user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit
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
 * Guild Object
 * * = These fields are only sent within the GUILD_CREATE event
 * @typedef {Object} GuildObject
 * @property {snowflake} id - guild id
 * @property {string} run - Function To Run
 * @property {string} name - 	guild name (2-100 characters)
 * @property {string} icon - 	guild name icon hash
 * @property {string} splash - 	splash hash
 * @property {snowflake} owner_id - id of owner
 * @property {string} region - 	{voice_region.id}
 * @property {snowflake} afk_channel_id - id of afk channel
 * @property {integer} afk_timeout - 	afk timeout in seconds
 * @property {bool} embed_enabled - 	is this guild embeddable (e.g. widget)
 * @property {snowflake} embed_channel_id - 	id of embedded channel
 * @property {integer} verification_level - 		level of verification
 * @property {integer} default_message_notifications - default message notifications level
 * @property {Array<RoleObject>} roles - 	array of role objects
 * @property {Array<EmojiObject>} emojis - array of emoji objects
 * @property {Array<GuildFeatures>} features - array of guild features
 * @property {Date} joined_at * -	date this guild was joined at
 * @property {bool} large * -	whether this is considered a large guild
 * @property {bool} unavailable * -	is this guild unavailable
 * @property {integer} member_count * -	total number of members in this guild
 * @property {Array<VoiceStateObject>} voice_states * -	array of voice state objects (without the guild_id key)
 * @property {Array<MemberObject>} members * -	array of guild member objects
 * @property {Array<ChannelObject>} channels * -		array of channel objects
 * @property {Array<PresenceUpdateEvent>} presences * -			array of simple presence objects, which share the same fields as Presence Update event sans a roles or guild_id key
 */

/**
 * Object used to define Emojis
 * @typedef {Object} EmojiObject
 * @property {snowflake} id -		emoji id
 * @property {name} 	string -emoji name
 * @property {Array<RoleObject>} roles - roles this emoji is active for
 * @property {bool} require_colons	 - 	whether this emoji must be wrapped in colons
 * @property {bool} managed	 - 	whether this emoji is managed
 */

/**
 * Object used to define Guild Roles
 * @typedef {Object} RoleObject
 * @property {snowflake} id - role id
 * @property {name} color -role name
 * @property {integer} color - integer representation of hexadecimal color code
 * @property {bool} hoist	 - 	if this role is pinned in the user listing
 * @property {integer} position	 - position of this role
 * @property {integer} permissions	 - permission bit set
 * @property {bool} managed	 - position of this role
 * @property {bool} mentionable	 - whether this role is mentionable
 */


/**
 * Object used to define Guild Roles
 * @typedef {Object} RoleCreateObject
 * @property {name} color -role name
 * @property {integer} color - integer representation of hexadecimal color code
 * @property {bool} hoist	 - 	if this role is pinned in the user listinge
 * @property {integer} permissions	 - permission bit set
 * @property {bool} mentionable	 - whether this role is mentionable
 */
/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} GuildEditObject
 * @property {string} name - guild name
 * @property {string} region - guild {voice_region.id}
 * @property {integer} verification_level - Seguild verification level
 * @property {integer} default_message_notifications - 	default message notifications setting
 * @property {snowflake} afk_channel_id -	id for afk channel
 * @property {integer} afk_timeout - 	afk timeout in seconds
 * @property {string} icon -base64 128x128 jpeg image for the guild icon
 * @property {snowflake} owner_id -	user id to transfer guild ownership to (must be owner)
 * @property {string} splash - 	base64 128x128 jpeg image for the guild splash (VIP only)
 */


/**
 * Member of a guild
 * @typedef {Object} MemberObject
 * @property {UserObject} user - User
 * @property {string} nick? - this users guild nickname (if one is set)
 * @property {Array<snowflake>} roles - array of role object id's
 * @property {datetime} joined_at - date the user joined the guild
 * @property {bool} deaf - if the user is deafened
 * @property {bool} mute - 	if the user is muted
 */
/**
 * Object used to edit a guild memeber
 * @typedef {Object} MemberEditObject
 * @property {string} nick - this users guild nickname (if one is set)
 * @property {Array<snowflake>} roles - array of role object id's
 * @property {bool} deaf - if the user is deafened
 * @property {bool} mute - 	if the user is muted
 * @property {snowflake} channel_id - 		id of channel to move user to (if they are connected to voice)
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


2698
