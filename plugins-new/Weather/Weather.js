const weather = require('weather-js');

class WeatherPlugin {

  default (command) {
    var self = this;
    var prefix = self.disnode.botConfig.prefix;
    self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Weather Commands", "**" + prefix + "weather forecast** - Gets the forecast of a place.\n**" + prefix + "weather info** - Gets the current weather info of a place");

  }
  info(command) {
    var self = this;
    var prefix = self.disnode.botConfig.prefix;
    if (command.params[0] == undefined) {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Current Weather Commands", "**" + prefix + "weather info [Name of place]** - Gets the current weather info of a place.");
      return;
    }
    weather.find({
      search: command.params.join(" "),
      degreeType: 'F'
    }, function(err, result) {
      if (typeof result !== 'undefined' && result.length > 0) {
        var out = result[0];
        self.disnode.bot.SendEmbed(command.msg.channel_id, {
          color: 1752220,
          author: {},
          thumbnail: {
            url: out.current.imageUrl,
          },
          fields: [{
            name: 'City',
            inline: true,
            value: out.location.name,
          }, {
            name: 'Wind',
            inline: true,
            value: out.current.winddisplay,
          }, {
            name: 'Temp',
            inline: true,
            value: out.current.temperature + ' °F | ' + parseInt((out.current.temperature - 32) * 5 / 9) + ' °C',
          }, {
            name: 'Sky',
            inline: true,
            value: out.current.skytext,
          }, {
            name: 'Humidity',
            inline: true,
            value: out.current.humidity,
          }],
          footer: {
            text: command.msg.author.username,
            icon_url: self.avatarCommandUser(command),
          },
          timestamp: new Date(),
        });
      } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "Could not find a place called ``" + command.params.join(" ") + '``');
    });
  }
  forecast(command) {
    var self = this;
    var prefix = self.disnode.botConfig.prefix;
    if (command.params[0] == undefined) {
      self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forecast Commands", "**" + prefix + "weather forecast [Day/5day] [Name of place]** - Gets the forecast of a place.");
      return;
    }
    weather.find({
      search: command.params.splice(1).join(" "),
      degreeType: 'F'
    }, function(err, result) {
      if (typeof result !== 'undefined' && result.length > 0) {
        var out = result[0];
        var params = command.params[0].replace(/(^|\s)[a-z]/g, function(f) {
          return f.toUpperCase();
        });
        switch (params) {
          case "Monday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Monday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Monday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Monday\'s forcast yet');
            break;
          case "Tuesday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Tuesday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Tuesday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Tuesday\'s forcast yet');
            break;
          case "Wednesday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Wednesday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Wednesday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Wednesday\'s forcast yet');
            break;
          case "Thursday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Thursday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Thursday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Thursday\'s forcast yet');
            break;
          case "Friday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Friday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Friday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Friday\'s forcast yet');
            break;
          case "Saturday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Saturday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Saturday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Saturday\'s forcast yet');
            break;
          case "Sunday":
            var found = false;
            var pos;
            for (var i = 0; i < out.forecast.length; i++) {
              if (out.forecast[i].day == 'Sunday') {
                found = true;
                pos = i;
                break;
              }
            }
            if (found) {
              var low = '``' + out.forecast[pos].low + '`` °F | ``' + parseInt((out.forecast[pos].low - 32) * 5 / 9) + '`` °C';
              var high = '``' + out.forecast[pos].high + '`` °F | ``' + parseInt((out.forecast[pos].high - 32) * 5 / 9) + '`` °C';
              var sky = out.forecast[pos].skytextday;
              var precip = out.forecast[pos].precip;
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: 'Sunday',
                  inline: false,
                  value: (out.forecast[pos].precip != '') ? 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%' : 'Low ' + low + '\nHigh ' + high + '\nSky ``' + sky + '``\nPrecip ``0``%',
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for Sunday\'s forcast yet');
            break;
          case "5day":
            if (out.forecast.length >= 5) {
              var info = "";
              for (var i = 0; i < out.forecast.length; i++) {
                if (out.forecast.hasOwnProperty(i)) {
                  var low = 'Low ``' + out.forecast[i].low + '`` °F | ``' + parseInt((out.forecast[i].low - 32) * 5 / 9) + '`` °C';
                  var high = 'High ``' + out.forecast[i].high + '`` °F | ``' + parseInt((out.forecast[i].high - 32) * 5 / 9) + '`` °C';
                  var sky = out.forecast[i].skytextday;
                  var precip = out.forecast[i].precip;
                  var day = '**' + out.forecast[i].day + '**';
                  info += (out.forecast[i].precip != '') ? day + '\n' + low + '\n' + high + '\nSky ``' + sky + '``\nPrecip ``' + precip + '``%\n\n' : day + '\n' + low + '\n' + high + '\nSky ``' + sky + '``\nPrecip ``0``%\n\n';
                }
              }
              self.disnode.bot.SendEmbed(command.msg.channel_id, {
                color: 1752220,
                author: {},
                fields: [{
                  name: '5 Day',
                  inline: false,
                  value: info,
                }],
                footer: {
                  text: command.msg.author.username,
                  icon_url: self.avatarCommandUser(command),
                },
                timestamp: new Date(),
              });
            } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Forcast", 'No data for a 5 day forcast yet');
            break;
        }
      } else self.disnode.bot.SendCompactEmbed(command.msg.channel_id, "Error", "Could not find a place called ``" + command.params.join(" ") + '``');
    });
  }
  avatarCommandUser(command) {
    var self = this;
    if (command.msg.author.avatar != null) {
      if (command.msg.author.avatar.indexOf('_') > -1) {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.author.id + "\/" + command.msg.author.avatar + ".gif";
      } else {
        return "https:\/\/cdn.discordapp.com\/avatars\/" + command.msg.author.id + "\/" + command.msg.author.avatar + ".png";
      }
    }
  }
}
module.exports = WeatherPlugin;
