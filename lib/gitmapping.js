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
var fs = require("fs");
var async = require("async");
var meta = require("./meta");
var Git = require("./git");
var baseDir = process.cwd();
module.exports = {
  rules: {},

  repos: {},

  initGit: function(source) {
    var dir = baseDir+"/.components/"; 
    fs.exists(dir, function(exists) {
      if (!exists) {
        fs.mkdirSync(dir, 0755);
      }
    });
    new Git(dir + source);
  },

  init: function(source, remoteUrl, branch, callback) {
    this.initGit(source);
    if (!this.check(source, remoteUrl)) {
      return callback("the repository in /tmp/gitmapping/" + source +
        " is existed,please use -s redefined source name", null);
    }
    Git.fetchRepo(remoteUrl, branch, callback);
  },

  check: function(source, remoteUrl) {
    if (this.repos[source] && this.repos[source].url !== remoteUrl) {
      return false;
    }
    return true;
  },

  configRepo: function(name, url, branch) {
    this.repos[name] = {};
    this.repos[name]['url'] = url;
    this.repos[name]['branch'] = branch;
  },

  updateRepo: function(name, callback) {
    var $this = this;
    Git.getVersion(function(err, data) {
      if (err) {
        callback(err);
      }
      if($this.repos[name]['commit'] && $this.repos[name]['commit'] == data){
        callback(null,null);
      }else{
        $this.repos[name]['commit'] = data;
        callback(null, data);
      }
    });
  },

  diffStat: function(name, callback) {
    var rule = this.rules[name];
    var repo = this.repos[rule.repo];
    var path = rule.source;
    if (path === "/") {
      path = null;
    }
    var version = rule.options.version;
    if (!version || version.length !== 40) {
      version = repo.commit;
    }
    this.init(rule.repo, repo.url, repo.branch, function(err, data) {
      if (err) {
        return callback(err);
      }
      Git.diffStat(version, path, callback);
    });
  },

  diffLog:function(name,callback){
    var rule = this.rules[name];
    var repo = this.repos[rule.repo];
    var version = rule.options.version;
    if(!version || version.length !== 40){
      version = repo.commit;
    }
    this.init(rule.repo,repo.url,repo.branch,function(err,data){
      if(err){
        return callback(err);
      }
      Git.diffLog(version,callback);
    })
  },

  add: function(name, repo, source, target, options) {
    if (!this.rules[name]) {
      this.rules[name] = {};
    }
    this.rules[name].repo = repo;
    this.rules[name].source = source;
    this.rules[name].target = target;
    this.rules[name].options = options;
  },

  update: function(type, config, name, val) {
    if (type === "rule" && this.rules[name]) {
      this.rules[name].options[config] = val;
      return true;
    }
    if (type === "repo" && this.repos[name]) {
      this.repos[name][config] = val;
      return true;
    }
    return false;
  },

  rm: function(name) {
    if (this.rules[name]) {
      delete this.rules[name];
      return true;
    }
    return false;
  },

  rname: function(oldName, newName) {
    if (this.rules[oldName]) {
      var rule = this.rules[oldName];
      delete this.rules[oldName];
      this.rules[newName] = rule;
      return true;
    }
    return false;
  },

  run: function(name, version, callback) {
    var rule = this.rules[name];
    if (!rule) {
      return callback("the rule " + name + " is not exists");
    }
    this.initGit(rule.repo);
    if(!version){
      if(rule.options.version){
        version = rule.options.version;
      }
    }else{
      this.update("rule","version",name,version);
    }
    if (rule.options.type === "file") {
      Git.cpFile(version, rule.source, rule.target, callback);
    } else {
      Git.cpDir(version, rule.source, rule.target, rule.options, callback);
    }
  },


  runWithFile: function(names, version, updateRepo, callback) {
    var parent = this;

    function runRule(name, callback) {
      var rule = parent.rules[name];
      if (!rule) {
        return callback("the rule " + name + " is not exists");
      }
      if (!fs.existsSync("/tmp/gitmapping/" + rule.repo)) {
        updateRepo = 1;
      }
      var $task_list = [
        function(callback) {
          parent.run(name, version, callback);
        },
        function(callback) {
          parent.updateRepo(rule.repo, callback);
        },
        function(callback) {
          parent.sync_meta(baseDir, callback);
        }
      ];
      if (updateRepo) {
        var repos = parent.repos[rule.repo];
        if (!repos) {
          return callback("the repo " + rule.repo + " is not config in .gitmapping.json");
        }
        $task_list.unshift(function(callback) {
          parent.init(rule.repo, repos.url, repos.branch, callback);
        });
        console.log("fetching repository " + rule.repo + ".....this may take a few minutes");
        async.series($task_list, callback);
      } else {
        async.series($task_list, callback);
      }
    }

    this.find_meta(baseDir, function(err, data) {
      if (err) {
        return callback(err);
      }
      if (!names) {
        names = Object.keys(parent.rules);
      }
      var dr = async.queue(runRule, 2);
      dr.push(names, callback);
    });
  },

  sync_meta: function(dir, callback) {
    var data = {
      repos: this.repos,
      rules: this.rules
    };
    meta.sync(dir, data, function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
  },

  find_meta: function(dir, callback) {
    var parent = this;
    meta.find(dir, function(err, data) {
      if (err) {
        return callback(err);
      }
      if (data) {
        parent.rules = data.rules;
        parent.repos = data.repos;
      }
      callback(null, "add rules from .gitmapping.json");
    });
  }
};
