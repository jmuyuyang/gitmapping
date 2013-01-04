process.env.NODE_ENV = 'test';
var assert = require('assert');
var git =  require("../lib/git");
git("/tmp/php-yaf");
git.fetchRepo("https://github.com/jmuyuyang/php-yaf.git","master",function(err,data){
	assert.ok(!err);
});

git.cpFile(null,"yaf.php","/tmp/php-yaf/yafs.php",function(err,data){
	assert.ok(!err);
});

git.cpDir(null,"routes","/tmp/php-yaf/routess",{},function(err,data){
	assert.ok(!err);
});
