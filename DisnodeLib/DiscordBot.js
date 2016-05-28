"use strict";
const EventEmitter = require("events");
const Discord = require( "discord.js");

class DiscordBot extends EventEmitter{
  constructor(key)
  {
    super();

    this.key = key;
  }

  startBot()
  {
    var _this = this;

    this.bot = new Discord.Client();
    this.bot.loginWithToken(this.key);
    this.emit("BotReady");
  }
}
module.exports = DiscordBot;
