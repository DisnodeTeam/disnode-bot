const Service = require("../Service.js");
const Discord = require("discord.js");
class DiscordService extends Service {
    constructor(className, disnode) {
        super(className, disnode);

        this.defaultConfig = {
            auth: "",
        };
        this.client = new Discord.Client();


    }
    Connect() {
        super.Connect();
        var self = this;
        this.client.login("MTcwMDIwODA3MTk4NjM4MDgw.CrkGQw.6dKJs9zu1s0bz9YbxZf9CVP9pLA");
        this.client.on("ready", function(){
          self.OnConnected();
        });

        this.client.on('error', (error) => {
          console.log(error);
        });

    }

    OnConnected(){
      super.OnConnected();
      var self = this;



    }

    SendMessage(data){
      if(!data.channel){
        return;
      }
      if(!data.msg){
        return;
      }

      this.client.say(data.channel,data.msg);
    }

}
module.exports = DiscordService;
