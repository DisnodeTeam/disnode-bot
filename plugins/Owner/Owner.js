class OwnerPlugin {
    constructor() {
        this.ownerName = "Insert Name";  //Insert Name so that users that do [p]owner will know who the owner of the bot is
        this.owner = "Insert ID";  //Insert ID so that only you can run these commands
    }

    default (command) {
        console.log(command);
        var self = this;
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 3447003,
            author: {},
            fields: [{
                name: "Owner",
                inline: false,
                value: this.ownerName + "\n" + this.owner,
            }],
            footer: {}
        });
    }
    commandRestart(command) {
        console.log(command);
        var self = this;
        if (command.msg.userID == this.owner) {
            self.disnode.bot.SendMessage(command.msg.channel, "I am restarting");
            self.disnode.Restart();
        } else self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 15158332,
            author: {},
            fields: [{
                name: "Stop",
                inline: false,
                value: "**You're not my Owner**",
            }],
            footer: {}
        });
    }
    commandShutdown(command) {
        console.log(command);
        var self = this;
        if (command.msg.userID == this.owner) {
            self.disnode.bot.SendMessage(command.msg.channel, "Shutting down");
            this.disnode.bot.client.disconnect();
        } else self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 15158332,
            author: {},
            fields: [{
                name: "Stop",
                inline: false,
                value: "**You're not my Owner**",
            }],
            footer: {}
        });
    }
    commandStatus(command) {
        console.log(command);
        var self = this;
        if (command.msg.userID == this.owner) {
            self.disnode.bot.SetStatus(command.params[0]);
            self.disnode.bot.SendMessage(command.msg.channel, "Status Set To - **Playing " + command.params[0] + "**");
        } else self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 15158332,
            author: {},
            fields: [{
                name: "Stop",
                inline: false,
                value: "**You're not my Owner**",
            }],
            footer: {}
        });
    }
    commandUsername(command) {
        console.log(command.params);
        var self = this;
        if (command.msg.userID == this.owner) {
            self.disnode.bot.SetUsername(command.params[0]);
        } else self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 15158332,
            author: {},
            fields: [{
                name: "Stop",
                inline: false,
                value: "**You're not my Owner**",
            }],
            footer: {}
        });
    }


}
module.exports = OwnerPlugin
// Made by Hazed SPaCE✘#2574
