exports.JoinVoice = cmdJoinVoice;
function cmdJoinVoice(voiceManager, msg, parms, cb){
  voiceManager.JoinChannel(parms[0],msg.channel.server);
  if(cb){cb(msg,parms);}
}
