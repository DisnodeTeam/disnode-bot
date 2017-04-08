//TODO: Change this!


class SuggestionPlugin {
  constructor() {


  }
  Launch(){
    this.db = this.disnode.db.Init({DBName: "disnode-test"});
    var self = this;
    setInterval(function () {
      self.UpdateLoop();
    }, 10000);
  }
  default (command) {
    var suggestion = command.params[0];
    var self = this;
    if(!suggestion || suggestion == "" ||suggestion == " " ){
        self.disnode.bot.SendCompactEmbed(command.msg.channel, "Suggestion", "Please enter a suggestion! :x:");
    }

    self.db.Find("settings" , {}).then(function(res){
      var ID = res[0].channel;
      self.disnode.bot.SendEmbed(ID,
        {
          color: 3447003,
          author: {},
          fields: [
            {
              name: "Suggestion",
              inline: false,
              value: "**" + suggestion + "**"
           },
           {
             name: "By ",
             inline: true,
             value: command.msg.user
          },
          {
            name: "Implmented",
            inline: true,
            value: false
         }
          ],
          footer: {}
        }).then(function(res){

          var newObj=  {
            suggestion: suggestion,
            implmented: false,
            by: command.msg.user,
            msg:{id: res.id, channel:res.channel_id }
          }

          self.db.Insert("suggestions" , newObj)
          .then(function(res){
            self.disnode.bot.SendCompactEmbed(command.msg.channel, "Suggestion", "Suggestion Added :white_check_mark:");

          }).catch(function(err){
            console.log(err);
          });
        });

    }).catch(function(err){
      console.log(err);
    });

  }
  commandChannel(command){
    var self = this;
    this.db.Update("settings", {}, {channel: command.msg.channel}).then(function(res){

      self.disnode.bot.SendCompactEmbed(command.msg.channel, "Suggestion", "Channel Set :white_check_mark:");
    }).catch(function(err){
      console.log(err);
    })
  }

  UpdateLoop(){
    var self = this;
    this.db.Find("suggestions",{}).then(function(res){
      for (var i = 0; i < res.length; i++) {
        var cur = res[i];
        self.disnode.bot.EditEmbed(cur.msg.channel, cur.msg.id, {
          color: 3447003,
          author: {},
          fields: [
            {
              name: "Suggestion",
              inline: false,
              value: "**" + cur.suggestion + "**"
           },
           {
             name: "By",
             inline: true,
             value: cur.by
          },
          {
            name: "Implmented",
            inline: true,
            value: self.ParseCheck(cur.implmented)
         }
          ],
          footer: {}
        });
      }
    });
  }

  ParseCheck(bool){
    if(bool){return ":white_check_mark:"}else{return ":x:"}
  }
}

module.exports = SuggestionPlugin;
