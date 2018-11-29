const program = require('commander');

program
  .version('0.1.0')
;

program
  .command('redeploy <out> <source>')
  .description('run redeploy command')
  .option('-d, --delete', 'delete source directory')
  .action((out, source, options) => {
    const fs = require('fs');
    const path = require('path');
    if (out[0] !== '.' && out[1] !== '/') {
      console.error('Invalid out dir. Must be ./*');
      process.exit(1);
    }
    if (source[0] !== '.' && source[1] !== '/') {
      console.error('Invalid source dir. Must be ./*');
      process.exit(1);
    }
    if (!fs.existsSync(out)) {
      fs.mkdirSync(out);
    }
    const isNeedDelete = options.delete;

    const removeDirFunc = source => {
      if (fs.existsSync(source)) {
        const files = fs.readdirSync(source);
        if (!files.length) {
          fs.rmdirSync(source);
        }
        files.forEach(item => {
          let localDirBase = path.join(source, item);
          let dirDtate = fs.statSync(localDirBase);

          if (dirDtate.isDirectory()) {
            removeDirFunc(localDirBase);
          }
        });
      }
    };
    const readDir = (base, level, isNeedDelete, removeDirFunc) => {
      const files = fs.readdirSync(base);
      files.forEach(item => {
        let localBase = path.join(base, item);
        let state = fs.statSync(localBase);
        if (state.isDirectory()) {
          readDir(localBase, level + 1, isNeedDelete, removeDirFunc);
        } else {
          if (!fs.existsSync(out + '/' + item[0])) {
            fs.mkdirSync(out + '/' + item[0]);
          }
          fs.renameSync(localBase, out + '/' + item[0] + '/' + item);
        }
      });
      if (isNeedDelete) {
        removeDirFunc(base);
      }
    };
    readDir(source, 0, isNeedDelete, removeDirFunc);
    // if (isNeedDelete) {
    //   console.log('fires dir del')
    //   removeDirFunc(source);
    // }
  });
program
  .command('*')
  .description('default')
  .action(() => {
    console.log('Введена несуществующая команда');
  });
program
  .parse(process.argv);
