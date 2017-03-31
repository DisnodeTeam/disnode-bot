const sleep = require('system-sleep');
const Logging = require('disnode-logger');

class OwnerPlugin {
    constructor() {
        this.ownerName = "Insert Name"; //Insert Name so that users that do [p]owner will know who the owner of the bot is
        this.owner = "Insert ID"; //Insert ID so that only you can run these commands
    }

    default (command) {
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
    var self = this;
    if (command.msg.userID == this.owner) {
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 0x12ff0a,
            author: {},
            fields: [{
                name: "Restarting",
                inline: false,
                value: ":repeat:"
            }],
            footer: {}
        });
        self.disnode.Restart();
    } else self.disnode.bot.SendEmbed(command.msg.channel, {
        color: 0xd600c4,
        author: {},
        fields: [{
            name: "Stop",
            inline: false,
            value: "**You're not my Owner**",
        }],
        footer: {}
    });
    Logging.Warning(command.msg.user, command.msg.userID, "Tried using " + self.disnode.botConfig.prefix + "" + command.command.cmd);
}
commandShutdown(command) {
    var self = this;
    if (command.msg.userID == this.owner) {
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 0x12ff0a,
            author: {},
            fields: [{
                name: "Shutting down",
                inline: false,
                value: ":wave:"
            }],
            footer: {}
        });
        self.disnode.bot.Disconnect();
        sleep(1000);
        process.exit();
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
    Logging.Warning(command.msg.user, command.msg.userID, "Tried using " + self.disnode.botConfig.prefix + "" + command.command.cmd);
}
commandStatus(command) {
    var self = this;
    var status = command.params.join(" ");
    if (command.msg.userID == this.owner) {
        self.disnode.bot.SetStatus(status);
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 0x12ff0a,
            author: {},
            fields: [{
                name: "New Status",
                inline: false,
                value: "Playing **" + status + "**"
            }],
            footer: {}
        });
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
    Logging.Warning(command.msg.user, command.msg.userID, "Tried using " + self.disnode.botConfig.prefix + "" + command.command.cmd);
}
commandUsername(command) {
    console.log(command.params);
    var self = this;
    if (command.msg.userID == this.owner) {
        self.disnode.bot.SetUsername(command.params[0]);
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 0x12ff0a,
            author: {},
            fields: [{
                name: "Username",
                inline: false,
                value: "New username **" + command.params[0] + "**"
            }],
            footer: {}
        });
        Logging.Warning("Owner", "Username", "Changed");
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
    Logging.Warning(command.msg.user, command.msg.userID, "Tried using " + self.disnode.botConfig.prefix + "" + command.command.cmd);
}
commandServers(command) {
    var self = this;
    if (command.msg.userID == this.owner) {
        var serverids = Object.keys(self.disnode.bot.client.servers);
        var servers = '';
        for (var i = 0; i < serverids.length; i++) {
            var amount = i + 1;
            if (servers == '') {
                servers += amount + ". " + self.disnode.bot.client.servers[serverids[i]].name + "\n";
            } else if (i == serverids.length) {
                serers += amount + ". " + self.disnode.bot.client.servers[serverids[i]].name;
            } else {
                servers += amount + ". " + self.disnode.bot.client.servers[serverids[i]].name + "\n";
            }
        }
        var results = "```\n" + servers + "```\n**Servers:** " + serverids.length + "\n**Users:** " + Object.keys(self.disnode.bot.client.users).length;
        self.disnode.bot.SendEmbed(command.msg.channel, {
            color: 1752220,
            author: {},
            fields: [{
                name: "Server List",
                inline: false,
                value: "" + results,
            }],
            footer: {}
        });
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
    Logging.Warning(command.msg.user, command.msg.userID, "Tried using " + self.disnode.botConfig.prefix + "" + command.command.cmd);
}
commandEval(command) {
    var self = this;
    if (command.msg.userID == this.owner) {
        try {
            var codes = command.msg.message.split("eval ")[1];
            var results = eval("(() => { " + codes + " })();");
            if (results === "[object Object]") {
                results = JSON.stringify(results, null, 4);
            }
            if (typeof results !== 'string')
                results = require('util').inspect(results);
            self.disnode.bot.SendMessage(command.msg.channel, "```" + results + "```")
        } catch (errors) {
            self.disnode.bot.SendMessage(command.msg.channel, errors)
        }
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
    Logging.Warning(command.msg.user, command.msg.userID, "Tried using " + self.disnode.botConfig.prefix + "" + command.command.cmd);
}

}
module.exports = OwnerPlugin
// Made by Hazed SPaCE✘#2574 & God of _.#6075
