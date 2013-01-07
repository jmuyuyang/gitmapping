/*
-this api is base on gitmapping
-the method ini is like command gitmapping init:
	gitmaping.init(repo_url,repo_name,branch,callback)
-you can also read or sync rules on .gitmapping.json,like
	gitmapping.find_meta(dir,function(err,data){
		gitmaping.add(name,repo_name,source, target, options);
		gitmaping.add(name,repo_name,source, target, options);
		gitmaping.sync_meta(dir,function(err,data){});
	});
-run the rule 
	gitmapping.run(rule_name,callback);
-or run direct on .gitmapping.json 
	gitmapping.run(dir,rule_name,callback);
*/
var child_process = require("child_process");
var meta = require("./meta");
var Git = require("./git");
module.exports = {
	rules : {},

	config:function(source){
		Git("/tmp/"+source);
	},

	init : function (repo,source,branch,callback){
		this.config(source);
		Git.fetchRepo(repo,branch,callback);
	},

	update: function(name,version){
		if(this.rules[name]){
			this.rules[name].options.version = version;
			return true;
		}
		return false;
	},

	add: function (name,repo,source, target, options){
		if(!this.rules[name]){
			this.rules[name] = {};
		}
		this.rules[name].repo = repo;
		this.rules[name].source = source;
		this.rules[name].target = target;
		this.rules[name].options = options;
	},

	rm: function(name){
		if(this.rules[name]){
			delete this.rules[name];
			return true;
		}
		return false;
	},

	rname: function(oldName,newName){
		if(this.rules[oldName]){
			var rule = this.rules[oldName];
			delete this.rules[oldName];
			this.rules[newName] = rule;
			return true;
		}
		return false;
	},

	run: function (name,callback){
		var rule = this.rules[name];
		if(!rule){
			return callback("the rule "+name+" is not exists");
		}
		this.config(rule.repo);
		if(rule.options.version){
			var version = version;
		}else{
			var version = null;
		}
		if(rule.options.type == "file"){
			Git.cpFile(version,rule.source,rule.target,callback)
		}else{
			Git.cpDir(version,rule.source,rule.target,rule.options,callback);
		}
	},

	runWithFile: function(dir,name,callback){
		var parent = this;
		meta.find(dir,function(err,data){
			if(err) return callback(err);
			if(data[name]){
				var rule = data[name];
				parent.add(name,rule.repo,rule.source,rule.target,rule.options);
				parent.run(name,callback);
			}else{
				return callback("rule "+name+" is not exists");
			}
		});
	},

	sync_meta: function(dir,callback){
		meta.sync(dir,this.rules,function(err,result){
			if(err) return callback(err);
			callback(null,result);
		});
	},

	find_meta: function(dir,callback){
		var parent = this;
		meta.find(dir,function(err,data){
			if(err) callback(err);
			parent.rules = data;
			callback(null,"add rules from .gitmapping.json");
		});
	}
};