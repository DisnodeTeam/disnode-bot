var Discord = require('discord.io');

var bot = new Discord.Client({
    token: "MzIwNDEwNDUzMTQwNTcwMTEy.DCJfIw.3ajzo6xlFSTfW3reToUAE435HoU",
    autorun: true
});

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});
var users = ["I Perfer Kids"];
bot.on('message', function(user, userID, channelID, message, event) {
    if(channelID != "275395383071342594"){return;}
    users.push(user);
    var randomUser = users[Math.floor(Math.random() * users.length)];
    bot.editNickname({
      serverID: "236338097955143680",
      userID: userID,
      nick: "FUCK ME " + randomUser
    }, function(err, res){
      if(err){console.log(err);return;}
      console.log("Set User: " + user.username + " to " +  message.substring(0, 12));
    });
});
