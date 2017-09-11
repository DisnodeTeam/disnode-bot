const os = require('os');
const cpu = require('os-utils')
class Sysinfo {
  constructor() {
  }
  default (command) {
    var self = this;
    var fieldEmbed = [];
    cpu.cpuUsage(function(v){
      var cpumsg = "```Markdown\n[" + os.cpus()[0].model + "]\n" + self.renderPercentage(parseInt(v * 10)) + "[Cpu Usage: " + parseInt(v * 100) + "%]\n```";
      var ramMsg = "```Markdown\n" + self.renderPercentage(parseInt((os.freemem() / os.totalmem()) * 10)) + "[Free RAM: " + parseInt((os.freemem() / os.totalmem()) * 100) + "%]\n" +
      self.renderPercentage(((os.totalmem() - os.freemem()) / os.totalmem()) * 10) + "[Used RAM: " + parseInt(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + "%]\n" +
      "[Free: " + parseInt((os.freemem() / 1024) / 1024) + " MB]\n" +
      "[Used: " + parseInt(((os.totalmem() - os.freemem()) / 1024) / 1024) + " MB]\n" +
      "[Total: " + parseInt((os.totalmem() / 1024) / 1024) + " MB]\n```"
      self.disnode.bot.SendEmbed(command.msg.channelID, {
        color: 3447003,
        author: {},
        fields: [{
          name: 'OS',
          inline: true,
          value: os.platform() + os.release() + '\nArch ``' + os.arch() + '``',
        },{
          name: 'RAM',
          inline: false,
          value: ramMsg,
        },{
          name: 'CPU',
          inline: false,
          value: "" + cpumsg,
        }],
        footer: {}
      }
    );
  });
  }
  renderPercentage(bars){
    var ret = "["
    for (var i = 0; i < bars; i++) {
      ret += "#";
    }
    for (var i = ret.length; i < 11; i++) {
      ret += "-";
    }
    ret += "]";
    return ret;
  }
}
module.exports = Sysinfo;
