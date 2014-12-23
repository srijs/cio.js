var fs = require('fs');

var wrap = require('./wrap');

module.exports = function (method, args, cb) {
  args = Array.prototype.slice.call(args);
  fs[method].apply(fs, args.concat(cb));
};

[ 'rename',
  'ftruncate',
  'truncate',
  'chown',
  'fchown',
  'lchown',
  'chmod',
  'fchmod',
  'lchmod',
  'stat',
  'lstat',
  'fstat',
  'link',
  'symlink',
  'readlink',
  'realpath',
  'unlink',
  'rmdir',
  'mkdir',
  'readdir',
  'close',
  'open',
  'utimes',
  'futimes',
  'fsync',
  'write',
  'read',
  'readFile',
  'writeFile',
  'appendFile'
].forEach(function (key) {
  module.exports[key] = wrap('fs', key);
});
