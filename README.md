# gitmapping

Mapping files and folders to your apps from git repositories.

## Getting Started
Install the module with: `npm install gitmapping`

## Documentation
###api
```javascript
var gitmapping = require('gitmapping');
gitmapping.init(repo_url,repo_name,branch,callback)
gitmapping.add(rule,repo_name,source,target,options);
@params 
	the source or target path must use relative path
gitmapping.rm(rule);
gitmapping.rname(old_name,new_name);
gitmapping.run(rule,callback);
gitmapping.runWithFile(rule_file,rules,callback)
@params 
	rules is rule_list like ["rule1","rule2"]
```
###read or sync rules on .gitmapping.json
```javascript
gitmapping.find_meta(dir,callback);
gitmapping.sync_meta(dir,callback);
```
###command
```bash
gitmapping init <repository> [-s repo_name] [-b branch]   
gitmapping add [-s repo_name] [-d] <name> <source> <target> [-a allow] [-i ignore] [-v version]
gitmapping rename <old> <new>  
gitmapping rm <name>  
gitmapping config repo.branch <repo> <branch>  
gitmapping config rule.version <rule> <version> 
gitmapping check <rule>
gitmapping run [-u] <rule>
```
####help
```bash
~gitmapping --help
Usage: gitmapping init     - init git repo <remote-url> <--branch> <--version>           
       gitmapping add      - add git maping rules <name> <source> <target> <allow> <deny>
       gitmapping rm       - remove git maping rules <name>
       gitmapping rname    - rname git maping rules <old name> <new name>
       gitmapping check    - check <rule> and diff current commit with up-to-date commit
       gitmapping run      - run and mapping the rule <name>
Options:
    -h, --help                 output usage information
    -s, --source [source]      source name of the repository for gitmapping
    -b, --branch [branch]      branch of the repository for gitmapping init
    -v, --versions [versions]  version(commit or tag) for the repository
    -d, --dir                  set the file type for maping rules
    -a, --allow [allow]        filter rules for maping files
    -i, --ignore [ingore]      filter rules for maping files
    -u, --update               update the repository before running the rule
```  


## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 amazingSurge  
Licensed under the MIT license.
