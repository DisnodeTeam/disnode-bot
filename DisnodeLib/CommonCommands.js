// CommonCommands are commands pre-made for easy use in a bot.
// They take in the params from the Command Handler,
// a callback(err, res), and any extra, command specific Varibles from the bot
// Alltought it may envolve more work for some commands that just call the Lib,
// (EX: Joining Voice), It is better to have a constant standard where changes,
// best methods, complex methods, and error handling are shared instead of relying
// on each bot to impliment it them seleves (often out-date Copy and Paste)

exports.JoinVoice = cmdJoinVoice;
function cmdJoinVoice(voiceManager, msg, parms, cb){
  voiceManager.JoinChannel(parms[0],msg.channel.server);
  if(cb){cb(msg,parms);}
}
