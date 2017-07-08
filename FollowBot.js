var Discord = require('discord.io');
var bot = new Discord.Client({
    autorun: true,
    token: "MTcwMDIwODA3MTk4NjM4MDgw.DD9tOQ.WBW0csrPVpEMmnT6lrdNcEeRm4g"
});

bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});
setInterval(function () {
  bot.moveUserTo( {serverID:"236338097955143680",userID: "228912767346671617", channelID:"296122910035410946"} );

},5000);
