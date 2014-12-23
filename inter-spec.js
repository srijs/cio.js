var assert = require('assert');

var IO = require('./core');
var Bluebird = require('bluebird');

var resolveValue = 'foobar';
var rejectReason = new Error('fail');

describe('Intercompatibility', function () {

  describe('Bluebird', function () {
    
    it('wraps a resolved IO', function (done) {
      var io = IO.resolved(resolveValue);
      var p = Bluebird.resolve(io).then(function (value) {
        assert.equal(value, resolveValue);
      }, function () {
        assert(false, "wrong handler called");
      }).nodeify(done);
    });

    it('wraps a rejected IO', function (done) {
      var io = IO.rejected(rejectReason);
      var p = Bluebird.resolve(io).then(function (value) {
        assert(false, "wrong handler called");
      }, function (err) {
        assert.equal(err, rejectReason);
      }).nodeify(done);
    });

  });

});
