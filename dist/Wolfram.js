"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colors = require('colors');

var Wolfram = function () {
	function Wolfram(options) {
		_classCallCheck(this, Wolfram);

		var WolframAPI = require('wolfram-alpha');
		console.log("[Wolfram]".grey + " Init".green);
		if (options.key) {
			this.key = options.key;
		} else {
			console.log("[Wolfram INIT ERROR]".grey + " No \'key\' found in options object, cannot use wolfram requests without an API KEY".red);
		}
		this.wolframapi = WolframAPI.createClient(this.key);
		this.disnode = options.disnode;
		this.defaultConfig = {
			commands: [{
				"cmd": "wa",
				"context": "Wolfram",
				"run": "cmdWA",
				"desc": "Wolfram Alpha Request.",
				"usage": "wa [Question] [Option1] [Option2]"
			}]
		};
	}

	//Makes a request based on params (empty = normal lookup, int = limited lookup, img = images only, and you can combine)
	//callback sends a formatted message
	//imageIdentity is a string value use to define what its looking for in the parms to lookup and img ex 'img' or 'Image'


	_createClass(Wolfram, [{
		key: 'makeRequest',
		value: function makeRequest(parms, imageIdentity, cb) {
			var self = this;
			console.log("[Wolfram]".grey + " Wolfram request with Q: " + colors.cyan(parms[0]) + " Options: " + colors.cyan(parms[1] + " " + parms[2]));
			if (parms[0] == null || parms[0] == undefined || parms[0] == "") {
				cb("NO_QUESTION");
				return;
			}
			var text = '```';
			if (parms[1] == imageIdentity && parms[2] == parseInt(parms[2])) {
				self.wolframapi.query(parms[0], function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						if (i < parseInt(parms[2])) {
							text = text + result[i].subpods[0].image + ' \n';
						}
					}
					text = text + '```';
					cb(text);
				});
			} else if (parms[2] == imageIdentity && parms[1] == parseInt(parms[1])) {
				self.wolframapi.query(parms[0], function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						if (i < parseInt(parms[1])) {
							text = text + result[i].subpods[0].image + ' \n';
						}
					}
					text = text + '```';
					cb(text);
				});
			} else if (parms[1] == imageIdentity) {
				self.wolframapi.query(parms[0], function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						text = text + result[i].subpods[0].image + ' \n';
					}
					text = text + '```';
					cb(text);
				});
			} else if (parms[1] == parseInt(parms[1])) {
				self.wolframapi.query(parms[0], function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						if (i < parseInt(parms[1])) {
							text = text + result[i].subpods[0].text + '\n';
						}
					}
					text = text + '```';
					cb(text);
				});
			} else if (!parms[1] && !parms[2]) {
				self.wolframapi.query(parms[0], function (err, result) {
					if (err) throw err;
					for (var i = 0; i < result.length; i++) {
						text = text + result[i].subpods[0].text + '\n';
					}
					text = text + '```';
					cb(text);
				});
			} else {
				cb("LOOKUP_ERROR");
			}
		}
	}, {
		key: 'cmdWA',
		value: function cmdWA(parsedMsg) {
			var self = this;

			var wolfmsg;
			self.disnode.bot.sendMessage(parsedMsg.msg.channel, "``` Waiting on Wolfram API Q: " + parsedMsg.params[0] + " Options: " + parsedMsg.params[1] + " " + parsedMsg.params[2] + " ```", function (err, sent) {
				wolfmsg = sent;
				console.log(err);
			});
			self.makeRequest(parsedMsg.params, "img", function (text) {
				if (text === "NO_QUESTION") {
					console.log("[Wolfram]".grey + " No Question!".red);
					self.disnode.bot.updateMessage(wolfmsg, "```You didn't put a question in for wolfram to answer!```");
				} else if (text === "LOOKUP_ERROR") {
					self.disnode.bot.updateMessage(wolfmsg, "```There was an error when looking up your question sorry!```");
				} else {
					self.disnode.bot.updateMessage(wolfmsg, text);
				}
			});
		}
	}]);

	return Wolfram;
}();

module.exports = Wolfram;