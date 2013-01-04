var fs = require('fs');
var path = require("path");

var meta_find = function(dir,callback){
	function _parseFile(f,cb){
		fs.readFile(f,function(err,data){
			if(err) return cb(err);
			var meta;
			try{
				meta = JSON.parse(data);
			}catch(e){
				return cb(e);
			}
			return cb(null,meta);
		});
	}

	dir = path.resolve(dir);
	var f = path.join(dir,".gitmapping.json");
	return fs.exists(f,function(exists){
		if(exists){
			return _parseFile(f, function(err, meta) {
        		if (err) return callback(err);
        		return callback(null, meta);
      		});
		}else{
			return callback("file .gitmaping.json is not exists in "+dir,null);
		}
	});
}

var meta_sync = function (dir,data,callback){
	var f = path.join(dir,".gitmapping.json");
  	var json_data = JSON.stringify(data);
  	return fs.writeFile(f,json_data,callback);
}

exports.find = meta_find;
exports.sync = meta_sync;