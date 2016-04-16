var Disnode = require("../DisnodeLib/Disnode.js");
var bot = new Disnode.DiscordBot("Victory Bot", "MTcwMDIwODA3MTk4NjM4MDgw.CfCntw.lUVQYtFJ-Jh2flq0-TXRUImjkZw");

bot.SetOnReady(function(){
  console.log("TESt");
});

bot.SetOnMessage(function(msg){

});

bot.Start();
