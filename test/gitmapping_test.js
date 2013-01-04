process.env.NODE_ENV = 'test';
var assert = require('assert');
var gitmapping =  require("../lib/gitmapping");
gitmapping.find_meta("../bin",function(err,data){
	assert.ok(!err);
});

gitmapping.add("git","tests","/home/yuyang/testlib",{type:"dir"});
var rnameInfo = gitmapping.rname("git","gits");
assert.ok(rnameInfo);
var rmInfo = gitmapping.rm("gits");
assert.ok(rmInfo);

gitmapping.sync_meta("../bin",function(err,data){
	console.log(err);
	assert.ok(!err);
})