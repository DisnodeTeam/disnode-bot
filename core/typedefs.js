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
  Logger.Success("Bot", "GetGatewayURL", "Aquired Gatway URL!");
  var url = data.url + "/?encoding=json&v=5";
  resolve(url)
})
.catch(function(err){
  Logger.Error("Bot", "GetGatewayURL", "Error Aquiring Gatway URL: " + err.display);
  reject(err);
});
*/
