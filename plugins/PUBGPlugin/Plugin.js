
const { PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH } = require('pubg-api-redis');

class Template {
  constructor() {
    this.api = new PubgAPI({
      apikey: 'e8b020e9-ac97-4365-b48d-e2a2a3a0d6a5',
    });
  }
  default(command) { // This is the default command that is ran when you do your bot prefix and your plugin prefix example   !ping
    var self = this;
    var _username = command.params[0];

    if (!_username) {
      self.disnode.bot.SendCompactEmbed(command.msg.channelID, "PUBG Bot Error", ":warning: Please enter a username!");
      return;
    }
   
    var _type = MATCH.SOLO;
    var _typeString = command.params[2];

    switch (_typeString) {
      case "duo":
        _type = MATCH.DUO;
        break;

      case "squad":
        _type = MATCH.SQUAD;
        break;

      default:
        _type = MATCH.DEFAULT;
        break;
    }
    self.disnode.bot.SendCompactEmbed(command.msg.channelID, "PUBG Loading", "Getting stats for player: **" + _username + "**").then((msg)=>{
      var lastid = msg.id;

      self.api.getProfileByNickname(_username)
      .then((profile) => {
        const data = profile.content;
        const stats = profile.getStats({
          region: REGION.ALL, // defaults to profile.content.selectedRegion
          season: profile.content.defaultSeason, // defaults to profile.content.defaultSeason
          match: _type // defaults to SOLO
        });

        var embed = {
          title: "PUBG Stats for: **" + _username + "**",
          description: "Stats for season `" + stats.season + "` in __**" + stats.match + "**__",
          thumbnail: {
            url: "http://vort3xgaming.com/wp-content/uploads/2017/03/bp_logo.png",
            height: 683,
            width: 213
          },
          footer: {
            text: _username + " / " + new Date(),
            icon_url: data.Avatar
          },
          fields: [
            {
              name: "**Performance**",
              inline: true,
              value:
              "**K/D**: __" + stats.performance.killDeathRatio + "__ \n" +
              "**Win Ratio**: __" + stats.performance.winRatio + "__ \n" +
              "**Time Survived**: __" + stats.performance.timeSurvived + "__ \n" +
              "**Roundes Played**: __" + stats.performance.roundsPlayed + "__ \n" +
              "**Wins**: __" + stats.performance.wins + "__ \n" +
              "**Top 10's**: __" + stats.performance.top10s + "__ \n" +
              "**Loses**: __" + stats.performance.losses + "__ \n" +
              "**Win Points**: __" + stats.performance.winPoints + "__ \n"
            },
            {
              name: "**Per Game**",
              inline: true,
              value: "**Damage**: __" + stats.perGame.damagePg + "__ \n" +
              "**Headshots**: __" + stats.perGame.headshotKillsPg + "__ \n" +
              "**Heals**: __" + stats.perGame.healsPg + "__ \n" +
              "**Kills**: __" + stats.perGame.killsPg + "__ \n" +
              "**Move Distance**: __" + ConvertDistance( stats.perGame.moveDistancePg) + "__ \n"+
              "**Revives**: __" + stats.perGame.revivesPg + "__ \n"+
              "**Road Kills**: __" + stats.perGame.roadKillsPg + "__ \n"+
              "**Team Kills**: __" + stats.perGame.teamKillsPg + "__ \n"+
              "**Time Survived**: __" + stats.perGame.timeSurvivedPg + "__ \n"+
              "**Top 10's**: __" + stats.perGame.top10sPg + "__ \n"
            },
            {
              name: "**Combat**",
              inline: true,
              value: "**Kills**: __" + stats.combat.kills + "__ \n" +
              "**Assists**: __" + stats.combat.assists + "__ \n" +
              "**Suicides**: __" + stats.combat.suicides + "__ \n" +
              "**TeamKills**: __" + stats.combat.teamKills + "__ \n" +
              "**Headshot Kills**: __" + stats.combat.headshotKills + "__ \n"
            },
            {
              name: "**Survival**",
              inline: true,
              value: "**Days**: __" + stats.survival.days + "__ \n" +
              "**Longest Survived**: __" + stats.survival.longestTimeSurvived + "__ \n" +
              "**Most Survival Time**: __" + stats.survival.mostSurvivalTime + "__ \n" +
              "**Avg. Survival Time**: __" + stats.survival.avgSurvivalTime + "__ \n"
            },
            {
              name: "**Distance**",
              inline: true,
              value: 
              "**Walk Distance**: __" + ConvertDistance(stats.distance.walkDistance) + "__ \n" +
              "**Ride Distance**: __" + ConvertDistance(stats.distance.rideDistance) + "__ \n" +
              "**Move Distance**: __" + ConvertDistance(stats.distance.moveDistance) + "__ \n" +
              "**Avg Walk Distance**: __" + ConvertDistance(stats.distance.avgWalkDistance) + "__ \n" +
              "**Avg Ride Distance**: __" + ConvertDistance(stats.distance.avgRideDistance) + "__ \n" +
              "**Longest Kill**: __" + ConvertDistance(stats.distance.longestKill) + "__ \n" 
            },
            {
              name: "**Support**",
              inline: true,
              value: 
              "**Heals**: __" + stats.support.heals + "__ \n" +
              "**Revives**: __" + stats.support.revives + "__ \n" +
              "**Damage Dealt**: __" + stats.support.damageDealt + "__ \n" +
              "**Boosts**: __" + stats.support.boosts + "__ \n"
            },

            
          ],
        }

        self.disnode.bot.EditEmbed(command.msg.channelID, lastid, embed, 16750080).catch((err) => { console.log(err) });

      }).catch((err) => { self.disnode.bot.EditCompactEmbed(command.msg.channelID,lastid, "PUBG Stats Error :x:", "Error: " + err.toString(), 16711680) });
    });
   
  }
}

function ConvertTime(time){

}

function ConvertDistance(distance){
  return (distance / 1000) + "km"
}
module.exports = Template;
