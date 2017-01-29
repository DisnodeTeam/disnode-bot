const Logging = require("./logging")
const jsonfile = require('jsonfile');
const async = require('async');
const fs = require('fs');
class DB{
  constructor(){
    Logging.DisnodeInfo("DB", "Constructor", "Started!")

    this.DataBase = [];

  }
  Init(){
    this.ReadFile();
  }
  Set(plugin,key,value){
    var self = this;

    return new Promise(function(resolve, reject) {
      if(self.GetData(plugin)){
        self.GetData(plugin).data[key] = value
        self.UpdateFile(plugin);
      }else{
        var newEntry = {plugin: plugin, data:{}};
        newEntry.data[key] = value;
        self.DataBase.push(newEntry)
        self.UpdateFile(plugin);
      }
      resolve(self.DataBase)
    });
  }

  Add(plugin,key,value){
    var self = this;

    return new Promise(function(resolve, reject) {
      if(self.GetData(plugin)){
        if(!self.GetData(plugin).data[key]){
          self.GetData(plugin).data[key] = [];
        }
        self.GetData(plugin).data[key].push(value);
        self.UpdateFile(plugin);
      }else{
        var newEntry = {plugin: plugin, data:{}};
        if(!newEntry.data[key]){
          newEntry.data[key] = [];
        }
        newEntry.data[key].push(value);
        self.DataBase.push(newEntry)
        self.UpdateFile(plugin);
      }
      resolve(self.DataBase)
    });
  }

  Get(plugin,key,value){
    var self = this;
  
    return new Promise(function(resolve, reject) {
      if(self.GetData(plugin)){
        if(self.GetData(plugin).data[key]){
            resolve(self.GetData(plugin).data[key]);
        }
        reject("No DB Entry for this key!")
      }else{
        reject("No DB For This Plugin!")
      }
    });
  }

  GetData(name){
    var self = this;
    for (var i = 0; i < self.DataBase.length; i++) {
      if(self.DataBase[i].plugin == name){
        return self.DataBase[i] ;
      }
    }
  }

  ReadFile(){
    var self = this;
    var DBEntries = fs.readdirSync("./db/");
    for (var i = 0; i < DBEntries.length; i++) {
      Logging.DisnodeInfo("DB", 'ReadFile', "Added to Watch List: " + DBEntries[i])
      fs.watch("./db/" + DBEntries[i], function(p1,filename){
        jsonfile.readFile("./db/" + filename,  function (err,obj) {
          self.DataBase = obj;
        });
      });
      Logging.DisnodeInfo("DB", 'ReadFile', "Loading: " + DBEntries[i])
      jsonfile.readFile("./db/" + DBEntries[i],  function (err,obj) {
        self.DataBase = obj;
      });
    };
  }

  UpdateFile(name){
    var self = this;
    fs.stat("./db/"+name+".json", function(err,stat){
      if(err){
        if(err.code == "ENOENT"){
          fs.openSync("./db/"+name+".json", 'w')

        }
      }
    });

    jsonfile.writeFile("./db/"+name+".json", self.DataBase, {spaces: 2}, function (err) {
      //console.error(err)
    });

  }

}

module.exports = DB;
