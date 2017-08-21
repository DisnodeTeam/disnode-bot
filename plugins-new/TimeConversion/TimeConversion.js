var fetchUrl = require("fetch").fetchUrl;

class TimeConversion {
  constructor() {


  }

  default (command) {

    this.disnode.bot.SendCompactEmbed(command.msg.channel, "Commands", "!time zone [date 4/15 00:00] [from] [to]  \n");
  }
  commandZone(command){

    var date = new Date(command.params[0]);
    var unixTime = Math.floor(date / 1000);

    var from = command.params[1];

    if(!from){
      this.disnode.bot.SendCompactEmbed(command.msg.channel, "Error :warning: ", "Please Enter a TimeZone!");
      return;
    }
    var to = command.params[2];
    if(!to){
      this.disnode.bot.SendCompactEmbed(command.msg.channel, "Error :warning:  ", "Please Enter a TimeZone!");
        return;
    }
    var self = this;
    var TimeZoneDBKey = "JKN6BLGSWQ8C";
    fetchUrl("http://api.timezonedb.com/v2/convert-time-zone?key="+TimeZoneDBKey+"&format=json&from="+from+"&to="+to+"&time="+unixTime+" ", function(error, meta, body){
      body = JSON.parse(body);
      if(body.status == "FAILED"){
          self.disnode.bot.SendCompactEmbed(command.msg.channel, "API Error :exclamation: ", body['message']);
          return;
      }

      var returnDate = new Date(body['toTimestamp']);
      var convertString = (returnDate.getMonth() + 1 )+ "/" + returnDate.getDate() + "/" + returnDate.getFullYear() + " - " + returnDate.getHours() + ":" + returnDate.getMinutes()
      self.disnode.bot.SendEmbed(command.msg.channel,
        {
          color: 3447003,
          author: {},
          fields: [
            {
              name: "Converted Time :alarm_clock:",
              inline: false,
              value: "`" + convertString + "`"
           },
           {
             name: "From :earth_americas: ",
             inline: false,
             value: "**" + body['fromAbbreviation']+"** - **" + body['fromZoneName'] + "**"
          },
          {
            name: "To :earth_americas: ",
            inline: false,
            value: "**" + body['toAbbreviation']+"** - **" + body['toZoneName'] + "**"
         }
          ],
          footer: {}
        });

    });

  }
}

module.exports = TimeConversion;
