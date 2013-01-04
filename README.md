# gitmapping

Mapping files and folders to your apps from git repositories.

## Getting Started
Install the module with: `npm install gitmapping`

## Documentation
###API 
```javascript
var gitmapping = require('gitmapping');
gitmapping.init(repo_url,repo_name,branch,callback)
gitmapping.add(name,repo_name,source, target, options);
gitmapping.run(rule,callback);
```
###read or sync rules on .gitmapping.json
```javascript
gitmapping.find_meta(dir,callback);
gitmapping.sync_meta(dir,callback);
```
###command
```bash
gitmapping init <repository> [-s repo_name] [-b branch] [-v version]   
gitmapping rule add [-s repo_name] [-d] <name> <source> <target> [-a allow] [-i ignore]  
gitmapping rule rename <old> <new>  
gitmapping rule rm <name>  
gitmapping run <rule>
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
