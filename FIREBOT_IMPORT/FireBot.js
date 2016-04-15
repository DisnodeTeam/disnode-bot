var Discord = require("discord.js");
var bot = new Discord.Client();
var fs = require('fs');
var wolfram = require('wolfram-alpha').createClient("");
var random
var Joinedchannel = ""
var filesloc = "C:/Users/Garrett/Desktop/FireBot/files/"
bot.on("ready", () => {
	console.log("FireBot is Ready to take in commands!");
});
bot.on("message", function (msg) {
	if (msg.author != bot.user) {
		if (msg.content.indexOf("#ping") === 0) {
			bot.sendMessage(msg.channel, "pong!");
			console.log("pong-ed " + msg.author.username);
		}
		if (msg.content.indexOf("#help") === 0) {
			bot.sendMessage(msg.channel, "``` Help \n    #ping - command to test the bot. \n    #help - Command that displays this message. \n    #wa question|option|option -WolframAlpha API lookup. \n 		Options:  \n 			image: pulls images instead of text. \n 			int: use an int to limit the output of the results. \n    #inv - gives you the Oauth2 link to add to your channel. \n Voice Channel Commands \n    #jv channel - joins the channel given if no channel is given it will try to join the channel you are connected to. \n    #lv - Leaves the voice channel its connected to. \n    #space - runs several quotes from the Space Core in Portal 2. \n    #play file extention - plays an audio file based on the given filename and extention. \n    #stop - stops all running audio. ```");
		}
		if (msg.content.indexOf("#avatar") === 0) {
			var Avatar = function setAvater() {
				fs.readFile("icon.png", {encoding: 'base64'},function(err, data) {
					if(err){
						console.log(err);
					}
					data = "data:image/jpeg;base64," + data;
					console.log("Image Icon Read. Setting.");
					bot.setAvatar(data, function(err){
					if(err){
						console.log(err);
					}
					console.log("Set Avatar");
					});
				});
			}
			Avatar();
		}
		if (msg.content.indexOf("#wa") === 0) {
			var rest = msg.content.split(" ");
			var option1 = msg.content.split("|");
			var option2 = msg.content.split("|");
			option1.splice(0, 1);
			option1.splice(1, 1);
			option1 = option1.join("|");
			option2.splice(0, 2);
			option2 = option2.join("|");
			rest.splice(0, 1);
			rest = rest.join(" ");
			rest = rest.split("|");
			rest.splice(1, 2);
			rest = rest.join("|");
			var l = rest.length;
			rest = rest.substring(0, l);
			bot.sendMessage(msg.channel, "``` Please Wait for Wolfram API... Q: " + rest + " Option 1: " + option1+ " Option 2: " + option2 + " ```");
			var text = '```';
			if (option1 == "image" && option2 == parseInt(option2)){
				wolfram.query(rest, function (err, result) {
					if (err) throw err;
					for (var i = 0; i < parseInt(option2); i++) {
						if (i <= parseInt(option2)){text = text + result[i].subpods[0].image + ' \n';}
					}
					text = text + '```'
					bot.sendMessage(msg.channel, text);
				});
			}else if (option1 == parseInt(option1) && option2 == "image"){
				wolfram.query(rest, function (err, result) {
					if (err) throw err;
					for (var i = 0; i < parseInt(option1); i++) {
						if (i <= parseInt(option1)){text = text + result[i].subpods[0].image + ' \n';}
					}
					text = text + '```'
					bot.sendMessage(msg.channel, text);
				});
			}else if (option1 == parseInt(option1) && option2 == ""){
				wolfram.query(rest, function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						if (i <= parseInt(option1)){text = text + result[i].subpods[0].text + '\n';}
					}
					text = text + '```'
					bot.sendMessage(msg.channel, text);
				});
			}else if (option1 == "image" && option2 == ""){
				wolfram.query(rest, function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						text = text + result[i].subpods[0].image + ' \n';
					}
					text = text + '```'
					bot.sendMessage(msg.channel, text);
				});
			}else if (option1 == "" && option2 == ""){
				wolfram.query(rest, function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						text = text + result[i].subpods[0].text + '\n';
					}
					text = text + '```'
					bot.sendMessage(msg.channel, text);
				});
			}else {
				wolfram.query(rest, function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						text = text + result[i].subpods[0].text + '\n';
					}
					text = text + '```'
					bot.sendMessage(msg.channel, text);
				});
			}
				
		}
		if (msg.content.indexOf("#inv") === 0) {
			bot.sendMessage(msg.channel, "Here is the link to add me to your server! https://discordapp.com/oauth2/authorize?&client_id=169998277847023617&scope=bot&permissions=0");
		}
		if (msg.content.indexOf("#space") === 0) {
			if (bot.internal.voiceConnection) {
				random = Math.floor(Math.random() * 9) + 1;
				var connection = bot.internal.voiceConnection;
				var filePath = filesloc + "space" + random + ".wma";
				connection.playFile(filePath, 0.5);
			}
		}
		if (msg.content.startsWith("#game")) {
			var rest = msg.content.split(" ");
			rest.splice(0, 1);
			rest = rest.join(" ");
			if (msg.author.username == "FireGamer3") {
				bot.setStatus(rest);
				bot.sendMessage(msg.channel, "``` Attempting to set the game to: " + rest + " ```");
			}
		}
		if (msg.content.startsWith("#jv")) {
			var rest = msg.content.split(" ");
			rest.splice(0, 1);
			rest = rest.join(" ");
			if (msg.author.voiceChannel != null || rest != "") {
				for (var channel of msg.channel.server.channels) {
					if (channel instanceof Discord.VoiceChannel) {
						if(rest == channel.name){
							Joinedchannel = channel;
							bot.sendMessage(msg.channel, "``` Joining: " + channel.name + " - id: " + channel.id + " ```");
							bot.joinVoiceChannel(channel);
							break;
						}else if (rest == ""){
							if (channel.name == msg.author.voiceChannel.name){
								Joinedchannel = channel;
								bot.sendMessage(msg.channel, "``` No Channel Specified Joining the channel you are connected to. Joining: " + channel.name + " - id: " + channel.id + " ```");
								bot.joinVoiceChannel(channel);
							}
						} 
					}
				}
			}else {
				bot.sendMessage(msg.channel, "``` No Channel Specified and you are not connected to a voice channel! Command Ignored ```");
			}
		}
		if (msg.content.indexOf("#lv") === 0) {
			if (bot.internal.voiceConnection) {
				bot.sendMessage(msg.channel, "``` ...Leaving active voice channel... ```");
				bot.internal.leaveVoiceChannel(Joinedchannel);
			}
			return;
		}
		if (msg.content.indexOf("#dc") === 0) {
			if (msg.author.username == "FireGamer3") {
				bot.sendMessage(msg.channel, "``` Disconnecting for safe shutdown ```");
				bot.logout();
			}
			return;
		}
		if (msg.content.indexOf("#stop") === 0) {
			if (bot.internal.voiceConnection) {
				bot.sendMessage(msg.channel, "``` Audio Stopped ```");
				var connection = bot.internal.voiceConnection;
				connection.stopPlaying();
			}
			return;
		}
		if (msg.content.indexOf("#play") === 0) {
			var name = msg.content.split(" ");
			var ext = msg.content.split(" ");
			name.splice(0, 1);
			name.splice(1, 1);
			name = name.join(" ");
			ext.splice(0, 2);
			ext = ext.join(" ");
			if (bot.internal.voiceConnection) {
				if (ext == ""){
					bot.sendMessage(msg.channel, "``` No Extention given. Command Ignored (use: #play filename extention)```");
				}else if (ext != ""){
					bot.sendMessage(msg.channel, "``` ok, Playing " + name + "." + ext+ " ```");
					var connection = bot.internal.voiceConnection;
					var filePath = filesloc + name + "." + ext;
					connection.playFile(filePath, 1);
				}
			}
		}
	}
});
bot.loginWithToken("");