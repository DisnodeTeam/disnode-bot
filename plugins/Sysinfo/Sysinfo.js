const os = require('os');
const cpu	= require('os-utils');
class Sysinfo {
  constructor() {
  }
  default (command) {
    var self = this;
    cpu.cpuUsage(function(v){
    self.disnode.bot.SendEmbed(command.msg.channel, {
      color: 3447003,
      author: {},
      fields: [{
        name: 'OS',
        inline: true,
        value: os.platform() + os.release() + '\nArch ``' + os.arch() + '``',
      },{
        name: 'RAM',
        inline: true,
        value: 'Used ``' + parseInt((os.freemem() / 1024) / 1024)  + ' MB``\nFree ``' + parseInt(((os.totalmem() - os.freemem()) / 1024) / 1024) + ' MB``\nTotal ``' + parseInt((os.totalmem() / 1024) / 1024) + ' MB``',
      },{
        name: 'CPU',
        inline: true,
        value: os.cpus()[0].model  + '\nUsage ``' + parseInt(v * 100) + '%``\nLoad Avg. 1M ``' + os.loadavg()[0] + '`` 5M ``' + os.loadavg()[1] + '`` 15M ``' + os.loadavg()[2] + '``',
      }],
      footer: {}
    });
  });
  }
}
module.exports = Sysinfo;
