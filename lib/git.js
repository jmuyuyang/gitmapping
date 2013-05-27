'use strict';

var fs = require("fs");
var child_process = require("child_process");
var async = require("async");
var Path = require("path");

var worktree;
var gitCommand;

var Git = module.exports = function(dir) {
  worktree = dir;
  gitCommand = ["--git-dir=" + worktree + "/.git", "--work-tree=" + worktree];
};

Git.exec = function(exec, callback) {
  var stdoutData;
  var exitCode;
  exec.stdout.on('data', function(data) {
    stdoutData = data.toString();
  });
  exec.stderr.on('data', function(data) {
    data.toString().split('\n').forEach(function(line) {
      if (!line || line.trim().length === 0) {
        return;
      }
      console.log(line);
    });
  });
  exec.on("exit", function(code) {
    exitCode = code;
  });
  exec.on("close", function() {
    if (exitCode > 1) {
      return callback(new Error("git failed"));
    }
    callback(null, stdoutData);
    exec.stdin.end();
  });
};

Git.fetchRepo = function(remoteUrl, branch, callback) {
  fs.exists(worktree + "/.git", function(exists) {
    var exec;
    if (exists) {
      var pullCmd = gitCommand.concat(["fetch", "origin", branch]);
      exec = child_process.spawn("git", pullCmd);
    } else {
      fs.mkdirSync(worktree, 0755);
      exec = child_process.spawn("git", ['clone', remoteUrl, '-b', branch, worktree]);
    }
    Git.exec(exec, callback);
  });
};

Git.getVersion = function(callback) {
  var commitCmd = gitCommand.concat(["log", "--pretty=format:%H", "-1"]);
  var commitExec = child_process.spawn("git", commitCmd);
  commitExec.stdout.on("data", function(data) {
    callback(null, data.toString());
  });
  commitExec.stderr.on("data", function(data) {
    callback(data.toString());
  });
};

Git.diffStat = function(version, path, callback) {
  var stat;
  var cmd = ["diff", "--stat", version + "..."];
  if (path) {
    cmd.push(path);
  }
  var diffCmd = gitCommand.concat(cmd);
  var exec = child_process.spawn("git", diffCmd);
  exec.stdout.on("data", function(data) {
    stat = data.toString();
    callback(null, stat);
  });
  exec.stderr.on("data", function(data) {
    callback(data, null);
  });
  exec.on("exit", function(code) {
    if (code === 0 && !stat) {
      callback(null, "Everything-is-up-to-date");
    }
  });
};

Git.cpFile = function(version, source, target, callback) {
  if (!version) {
    child_process.exec("cp " + worktree + "/" + source + " " + target, function(err, stdout) {
      if (err) {
        callback(err);
        return false;
      }
      callback(null, "copy file " + source + " to " + target);
    });
  } else {
    var error;
    var cmd = gitCommand.concat(["show", version + ":" + source]);
    var exec = child_process.spawn("git", cmd);
    var file = fs.createWriteStream(target, {
      'flags': 'w'
    });
    exec.stdout.pipe(file);
    exec.stderr.on("data", function(data) {
      error = data.toString();
    });
    exec.on("close", function() {
      if (error) {
        return callback(error);
      }
      callback(null, "copy file " + source + " to " + target);
    });
  }
};

Git.readDir = function(version, path, callback) {
  if (version) {
    //Load the directory listing from git is a sha is requested
    var cmd = gitCommand.concat(["show", version + ":" + path]);
    var exec = child_process.spawn("git", cmd);
    Git.exec(exec, function(err, text) {
      if (err) {
        callback(err);
      }
      if (!(/^tree .*\n\n/).test(text)) {
        callback(path + " is not a directory");
        return;
      }
      text = text.replace(/^tree .*\n\n/, '').trim();
      var files = [];
      var dirs = [];
      text.split("\n").forEach(function(entry) {
        if (/\/$/.test(entry)) {
          dirs[dirs.length] = entry.substr(0, entry.length - 1);
        } else {
          files[files.length] = entry;
        }
      });
      var data = {
        dirs: dirs,
        files: files
      };
      callback(null, data);
    });
  } else {
    var realPath = Path.join(worktree, path);
    fs.readdir(realPath, function(err, filenames) {
      if (err) {
        callback(err);
        return;
      }
      var count = filenames.length;
      var files = [];
      var dirs = [];
      filenames.forEach(function(filename) {
        fs.stat(Path.join(realPath, filename), function(err, stat) {
          if (err) {
            callback(err);
            return;
          }
          if (stat.isDirectory()) {
            dirs[dirs.length] = filename;
          } else {
            files[files.length] = filename;
          }
          count--;
          if (count === 0) {
            callback(null, {
              files: files,
              dirs: dirs
            });
          }
        });
      });
    });
  }
};

Git.cpDir = function(version, source, target, options, callback) {
  source = source === "/" ? "" : source + "/";

  function filterFile(file, callback) {
    if (!options) {
      callback(true);
      return;
    } else {
      var re = new RegExp(options.allow ? options.allow : options.deny);
      if (re.test(file)) {
        callback(true);
        return;
      }
      callback(false);
    }
  }

  function cpF(file, callback) {
    Git.cpFile(version, source + file, target + "/" + file, callback);
  }

  function cpD(dir, callback) {
    var targetDir = target + "/" + dir;
    fs.exists(targetDir, function(exists) {
      if (!exists) {
        fs.mkdirSync(targetDir, 0755);
      }
      Git.cpDir(version, source + dir, targetDir, options, callback);
    });
  }

  if (!version && !options.allow && !options.deny) {
    child_process.exec("cp -R " + worktree + "/" + source + "* " + target, function(err, stdout) {
      if (err) {
        return callback(new Error(err));
      }
      return callback(null, "copy dir " + worktree + "/" + source + " to " + target);
    });
  } else {
    Git.readDir(version, source, function(err, data) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, "copying dir " + worktree + "/" + source + " to " + target);
      if (data.files) {
        var fq = async.queue(cpF, 2);
        async.filter(data.files, filterFile, function(result) {
          fq.push(result, function(err, data) {
            if (err) {
              callback(err);
            }
          });
        });
      }
      if (data.dirs) {
        var dq = async.queue(cpD, 2);
        dq.push(data.dirs, function(err, data) {
          if (err) {
            callback(err);
          }
        });
      }
    });
  }
};
