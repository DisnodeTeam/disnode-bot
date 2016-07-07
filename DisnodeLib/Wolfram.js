"use strict"

class Wolfram {
	constructor(options){
		const WolframAPI = require('wolfram-alpha');
    console.log("[Wolfram] Init");
    if(options.key){
      this.key = options.key;
    }else{
      console.log("[Wolfram INIT ERROR] No \'key\' found in options object, cannot use wolfram requests without an API KEY");
      return;
    }
		this.wolframapi = WolframAPI.createClient(this.key);
	}

	//Makes a request based on params (empty = normal lookup, int = limited lookup, img = images only, and you can combine)
	//callback sends a formatted message
	//imageIdentity is a string value use to define what its looking for in the parms to lookup and img ex 'img' or 'Image'
	makeRequest(parms, imageIdentity, cb){
		var self = this;
		console.log("[Wolfram] Wolfram request with Q: " + parms[0] + " Options: " + parms[1] + " " + parms[2]);
		if(parms[0] == null || parms[0] == undefined || parms[0] == ""){
			cb("NO_QUESTION");
			return;
		}
		var text = '```';
		if (parms[1] == imageIdentity && parms[2] == parseInt(parms[2])){
			self.wolframapi.query(parms[0], function (err, result) {
				if (err) throw err;
				for (var i = 0; i < result.length; i++) {
					if (i < parseInt(parms[2])){text = text + result[i].subpods[0].image + ' \n';}
				}
				text = text + '```'
				cb(text);
			});
		}else if (parms[2] == imageIdentity && parms[1] == parseInt(parms[1])){
			self.wolframapi.query(parms[0], function (err, result) {
				if (err) throw err;
				for (var i = 0; i < result.length; i++) {
					if (i < parseInt(parms[1])){text = text + result[i].subpods[0].image + ' \n';}
				}
				text = text + '```'
				cb(text);
			});
		}else if(parms[1] == imageIdentity){
			self.wolframapi.query(parms[0], function (err, result) {
				if (err) throw err;
				for (var i = 0; i < result.length; i++) {
					text = text + result[i].subpods[0].image + ' \n';
				}
				text = text + '```'
				cb(text);
			});
		}else if (parms[1] == parseInt(parms[1])){
			self.wolframapi.query(parms[0], function (err, result) {
				if (err) throw err;
				for (var i = 0; i < result.length; i++) {
					if (i < parseInt(parms[1])){text = text + result[i].subpods[0].text + '\n';}
				}
				text = text + '```'
				cb(text);
			});
		}else if (!parms[1] && !parms[2]){
			self.wolframapi.query(parms[0], function (err, result) {
				if (err) throw err;
				for (var i = 0; i < result.length; i++) {
					text = text + result[i].subpods[0].text + '\n';
				}
				text = text + '```'
				cb(text);
			});
		}else {
			cb("LOOKUP_ERROR");
		}
	}
}

module.exports = Wolfram;
