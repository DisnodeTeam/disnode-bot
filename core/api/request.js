exports.identify = function (token, shardID = 0, shardCount = 1) {
  return{
    "token": token,
    "properties": {
        "$os": "linux",
        "$browser": "my_library_name",
        "$device": "my_library_name",
        "$referrer": "",
        "$referring_domain": ""
    },
    "compress": true,
    "large_threshold": 250,
    "shard": [shardID, shardCount]
  }
};
