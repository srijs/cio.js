var assert = require('assert');

var IO = require('./core');
var fs = require('./fs');

describe('fs', function () {

  describe('stat', function () {

    it('works', function (done) {
      var io = fs.stat('./core.js').then(function (stat) {
        return IO.resolved(stat.isFile());
      });
      IO.run({fs:fs}, io, function (err, isFile) {
        assert.ifError(err);
        assert(isFile);
        done();
      });
    });

  });

});
