'use strict';

var fs = require('fs');
var path = require("path");
var f = path.resolve(process.cwd(),".gitmapping.json");
var config = {};
config.load = function(){
  try{
    var meta = fs.readFileSync(f);
    meta = JSON.parse(meta);
    return meta;
  }catch(err){
    throw new Error('Unable to load config file: ' + err);
  }
}

config.update = function(config){
  try{
    var config = json.stringfy(config,{},"\t");
    return fs.writeFileSync(f,config);
  }catch(err){
    throw new Error("Unable to update config file: "+err);
  }
}

var meta_find = function(dir, callback) {
  function _parseFile(f, cb) {
    fs.readFile(f, function(err, data) {
      if (err) {
        return cb(err);
      }
      var meta;
      try {
        meta = JSON.parse(data);
      } catch (e) {
        return cb(e);
      }
      return cb(null, meta);
    });
  }

  dir = path.resolve(dir);
  var f = path.join(dir, ".gitmapping.json");
  return fs.exists(f, function(exists) {
    if (exists) {
      return _parseFile(f, function(err, meta) {
        if (err) {
          return callback(err);
        }
        return callback(null, meta);
      });
    } else {
      return callback(null, null);
    }
  });
};

var meta_sync = function(dir, data, callback) {
  var f = path.join(dir, ".gitmapping.json");
  var json_data = JSON.stringify(data, {}, "\t");
  return fs.writeFile(f, json_data, callback);
};

exports.find = meta_find;
exports.sync = meta_sync;
