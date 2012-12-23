# gitmapping

Mapping files and folders to your apps from git repositories.

## Getting Started
Install the module with: `npm install gitmapping`

## Documentation
```javascript
var gitmapping = require('gitmapping');
gitmapping.init(repository, directory, options);
gitmapping.add(name, source, target, options);
gitmapping.run(rule, options, callback);
```

```bash
gitmapping init [--branch] [--commit] <repository> <directory>
gitmapping rule add [-d] <name> <source> <target> [--ignore]
gitmapping rule rename <old> <new>
gitmapping rule rm <name>
gitmapping config repository <value>
gitmapping config branch <value>
gitmapping config commit <value>
gitmapping config auth.user <value>
gitmapping config auth.password <value>
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
