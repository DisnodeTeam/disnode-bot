"use strict";

// CommonCommands are commands pre-made for easy use in a bot.
// They take in the params from the Command Handler,
// a callback(err, res), and any extra, command specific Varibles from the bot
// Alltought it may envolve more work for some commands that just call the Lib,
// (EX: Joining Voice), It is better to have a constant standard where changes,
// best methods, complex methods, and error handling are shared instead of relying
// on each bot to impliment it them seleves (often out-date Copy and Paste)

exports.JoinVoice = cmdJoinVoice;
function cmdJoinVoice(voiceManager, msg, parms, cb) {
	if (parms) {
		voiceManager.JoinChannel(parms[0], msg.channel.server);
		if (cb) {
			cb(msg, parms);
		}
	}
}

exports.JoinVoice = cmdJoinVoice;
function cmdDownloadYT(ytManager, msg, parms, cb) {

	var firstSpace = msg.indexOf(" ");
	var link = msg.substring(firstSpace + 1, msg.indexOf(" ", firstSpace + 1));
	var file = msg.substring(msg.indexOf(" ", msg.indexOf(link)) + 1, cmd.content.length);

	ytManager.Download(link, file);
}

exports.Help = cmdHelp;
function cmdHelp(commands, msg, parms, cb) {
	for (var i = 0; i < commands.length; i++) {
		var cmd = commands[i];
		cb(cmd.cmd, cmd.desc, cmd.usage);
	}
}