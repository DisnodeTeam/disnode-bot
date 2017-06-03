exports.identify = function (token, shardID = 0, shardCount = 1) {
  return{
    op: 2,
    d:{
      "token": token,
      "properties": {
        "$os": "linux",
        "$browser": "Disnode",
        "$device": "Disnode",
        "$referrer": "",
        "$referring_domain": ""
      },
      "compress": false,
      "large_threshold": 250,
      "shard": [shardID, shardCount]}
  }
};


exports.heartbeat = function () {
  return{
    op:11,
  }
};

exports.presence = function (name) {
  return{
    op:3,
    d:{

      "idle_since": null,
      "game":{
        "name": name,
      }
    }
  }
};
