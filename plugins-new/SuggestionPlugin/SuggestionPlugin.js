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

    
  }


  ParseCheck(bool){
    if(bool){return ":white_check_mark:"}else{return ":x:"}
  }
}

module.exports = SuggestionPlugin;
