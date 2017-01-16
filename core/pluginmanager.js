const fs = require('fs');
const async = require('async');
const jsonfile = require('jsonfile');
const Logging = require('./logging')
class PluginManager {
    constructor() {
        this.classes = [];
        this.launched = [];
    }

    Load(path) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!path) {
                reject("No Path!");
            }

            var _ManagerFolders = [];

            //Load Directories. Its sync since this Function is already
            //wrapped in a Promise
            _ManagerFolders = fs.readdirSync(path);

            if (!_ManagerFolders) {
                reject("Managers Null!")
            }
            Logging.DisnodeInfo("PluginManager", "Load", "Loading Classes")



            async.every(_ManagerFolders, function(folder, callback) {

                var className = folder + ".js";
                var commandName = folder + "-Commands.json";
                var configName = folder + "-Config.json";
                var fullPath = path + "/" + folder + "/" ;

                var importClass = null;
                var configFile = null;
                var commandFile = null;

                async.waterfall([

                    // Check if class exists
                    function(callback) {
                        Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Checking for class");
                        fs.stat(fullPath + className, function(err, stats) {
                            if (err) {
                                Logging.DisnodeError("PluginManager", "Load-"+folder, "Failed to find Class (" + fullPath + className + ")");
                                callback(err);
                                return;
                            } else {
                                Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Found Class");
                                callback();
                            }
                        });

                    },

                    // Attempt to import the class
                    function(callback) {
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Trying to import class");
                        try {
                            var NpmRequire = require("../" + fullPath + className);
                            Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Imported");

                            importClass = NpmRequire;
                            callback(null);
                        } catch (e) {
                            Logging.DisnodeError("PluginManager", "Load-"+folder, "Failed to Import: " + className + " - '" + e  + "'");

                            callback(e, null);
                        }
                    },
                     //Check if command file exists
                    function(callback) {
                        Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Checking for Command File");
                        fs.stat( fullPath + commandName, function(err, stats) {
                            if (err) {
                                Logging.DisnodeWarning("PluginManager", "Load-"+folder, "Failed to find Command File (" + fullPath + commandName+")");

                                callback();
                                return;
                            } else {
                                Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Found Command File");
                                callback();
                            }
                        });

                    },

                    function(callback) { // Read File
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Loading Command File");
                        jsonfile.readFile(fullPath + commandName, function(err, obj) {
                            if (err) {
                                callback();
                                Logging.DisnodeWarning("PluginManager", "Load-"+folder, "Failed to Load Command JSON File: " + err);
                                return;
                            }

                            if(!obj.commands){
                              callback();
                              Logging.DisnodeWarning("PluginManager", "Load-"+folder, "No Command Array found!: " + className);

                              return;
                            }
                            Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Loaded Command JSON File");
                            commandFile = obj.commands;

                            callback();
                        });
                    },

                    function(callback) {
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Checking for config file");

                        fs.stat( fullPath + configName, function(err, stats) {
                            if (err) {
                                Logging.DisnodeWarning("PluginManager","Load-"+folder, "Failed to find Config File (" + fullPath + configName+")");

                                callback();
                                return;
                            } else {
                              Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Found Config File");

                                callback();
                            }
                        });

                    },

                    function(callback) { // Read File
                      Logging.DisnodeInfo("PluginManager", "Load-"+folder, "Loading Config File");
                        jsonfile.readFile(fullPath + configName, function(err, obj) {
                            if (err) {
                                Logging.DisnodeWarning("PluginManager", "Load-"+folder, "Failed to Load Config JSON File: " + err);
                                callback();

                                return;
                            }

                            Logging.DisnodeSuccess("PluginManager", "Load-"+folder, "Loaded Config JSON File");
                            configFile = obj;

                            callback();
                        });
                    },
                    // Finished Loading, adds class to array
                    function(callback) {

                        Logging.DisnodeSuccess("PluginManager","Load-"+folder, "Finished Loading");

                        self.classes.push({
                            name: folder,
                            class: importClass,
                            commands: commandFile,
                            config: configFile
                        });

                        //console.log(self.classes);
                        callback();
                    },

                ], function(err, result) {
                    callback(err, result); // Finish Waterfall
                });
            }, function(err, res) {
                Logging.DisnodeInfo("PluginManager", "Load", "Loaded " + self.classes.length + " plugin(s)");

                resolve();
            });
        });

    }

    Launch(managerName, server) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!managerName) {
                reject("[PluginManager 'Launch'] No Manager Name!")
            }

            var Manager = self.GetPlugin(managerName);

            if (!Manager) {
                reject("[PluginManager 'Launch'] No Manager Found!")
            }

            var newInstance = new Manager.class(server);
            newInstance.server = server;
            self.launched.push(newInstance);
            resolve();
        });
    }
    GetPlugin(name) {
        var self = this;
        for (var i = 0; i < self.classes.length; i++) {
            if (self.classes[i].name == name) {
                return self.classes[i];
            }
        }
    }
}


module.exports = PluginManager;
