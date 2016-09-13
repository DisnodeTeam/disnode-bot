var DisnodeBot = require("../src/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM
var testBot = new DisnodeBot("./TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go


var OnLoad = function(){
  testBot.addService({name: "TwitchService"}, {});
  testBot.addService({name: "DiscordService"}, {});
  testBot.ConnectToAllServices();

}

testBot.loadConfig(OnLoad);

exports.Start = function () {
  testBot.startBot();
};
