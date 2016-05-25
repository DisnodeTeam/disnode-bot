"use strict"
class PlaylistManager{
  constructor(bot, jsonFile, path){
    this.bot = bot;
    this.jsonFile = jsonFile;
    this.path = path;
    this.playLists = [];
  }

  loadPlaylists(){
    var _this = this;
    this.jsonFile.readFile(this.path, function(err, obj) {
        if(obj)
        {
          console.dir(obj);
          if(obj.playLists)
          {
            _this.playLists = obj.playLists;
          }
        }
    });

  }

  newPlayList(name, anyoneEdit, creator){
    var _this = this;
    var newObj = {
      name: name,
      anyoneEdit: anyoneEdit,
      creator: creator,
      clips: []
    };
    _this.playLists.push(newObj);
    console.log("[PlayListManager] Creating new Playlist: " + name + ":"+anyoneEdit);
    console.log(_this.playLists);
    this.savePlayLists();
  }
  addCommand(name,command,user,cb){
    if(anyoneEdit){
      findPlaylist(name).clips.push(command);
      cb();
    }else{
      if(findPlaylist(name).owner == user)
      {
        findPlaylist(name).clips.push(command);
        cb();
      }else{
        cb("USER_NOT_ALLOWED");
      }
    }
    this.savePlayLists();
  }
  findPlaylist(name){
    for (var i = 0; i < this.playLists.length; i++) {
      if(this.playLists[i].name == name)
      {
        return this.playLists[i];
      }
    }
  }
  savePlayLists(){
    var _this = this;
    var toWrite = {
      name: "PLAY_NAME",
      playLists: _this.playLists
    };
    console.log("[PlayListManager] Saving: " + JSON.stringify(toWrite));
    this.jsonFile.writeFile(this.path, toWrite, function (err) {
      console.error(err)
    });
  }
}
module.exports.PlaylistManager = PlaylistManager;
