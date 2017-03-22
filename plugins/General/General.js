class GeneralPlugin {
    constructor() {

    }
    default (commandObject){
      var self = this;
      self.disnode.bot.JoinUsersVoiceChannel(commandObject.msg.server, commandObject.msg.userID);
      self.disnode.bot.SendMessage(command.msg.channel,"Joining Voice channel", {});
    }

    commandJoinVoice(commandObject){
      var self = this;
      this.disnode.bot.JoinUsersVoiceChannel(commandObject.msg.server, commandObject.msg.userID);
    };



}
module.exports = GeneralPlugin;
