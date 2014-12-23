var assert = require('assert');

var IO = require('./core');

var resolveValue = {};
var rejectReason = new Error('fail');

describe('Constructors', function () {

  describe('action', function () {

    it('calls run callback with (null, value)', function (done) {
      IO.run({
        test: function (cb) {
          cb(null, resolveValue);
        }
      }, new IO('test'), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

    it('calls run callback with (err)', function (done) {
      IO.run({
        test: function (cb) {
          cb(rejectReason);
        }
      }, new IO('test'), function (err, value) {
        assert.equal(err, rejectReason);
        done();
      });
    });

    it('passes arguments to action', function (done) {
      IO.run({
        test: function (foo, bar, cb) {
          assert.equal(foo, 'foo');
          assert.equal(bar, 'bar');
          cb(null, resolveValue);
        }
      }, new IO('test', ['foo', 'bar']), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

    it('converts multiple arguments to array', function (done) {
      IO.run({
        test: function (cb) {
          cb(null, 'foo', 'bar');
        }
      }, new IO('test'), function (err, value) {
        assert.ifError(err);
        assert.deepEqual(value, ['foo', 'bar']);
        done();
      });
    });

  });

  describe('resolved', function () {

    it('calls run callback with (null, value)', function (done) {
      IO.run({}, IO.resolved(resolveValue), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

  });

  describe('rejected', function () {

    it('calls run callback with (err)', function (done) {
      IO.run({}, IO.rejected(rejectReason), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });

  });

  describe('try', function () {

    it('returns the resolved IO that f returns', function (done) {
      var io = IO.resolved(resolveValue);
      IO.run({}, IO.try(function () { return io; }), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

    it('returns the rejected IO that f returns', function (done) {
      var io = IO.rejected(rejectReason);
      IO.run({}, IO.try(function () { return io; }), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });


    it('returns a resolved IO if f returns a value', function (done) {
      IO.run({}, IO.try(function () { return resolveValue; }), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

    it('returns a rejected IO if f throws', function (done) {
      IO.run({}, IO.try(function () { throw rejectReason; }), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });

  });

});

describe('Composition', function () {

  describe('map', function () {

    it('error handler is called with (reason)', function (done) {
      var handlerCalled = 0;
      IO.run({}, IO.rejected(rejectReason).map(function (value) {
        assert(false, 'wrong handler called');
      }, function (reason) {
        handlerCalled++;
        assert.equal(reason, rejectReason);
      }), function (err, value) {
        assert.ifError(err);
        assert.equal(1, handlerCalled);
        done();
      });
    });

    it('value handler is called with (value)', function (done) {
      var handlerCalled = 0;
      IO.run({}, IO.resolved(resolveValue).map(function (value) {
        handlerCalled++;
        assert.equal(value, resolveValue);
      }, function (reason) {
        assert(false, 'wrong handler called');
      }), function (err, value) {
        assert.ifError(err);
        assert.equal(1, handlerCalled);
        done();
      });
    });

  });

  describe('multiple map', function () {

    it('error handler is called with (reason)', function (done) {
      var handlerCalled = 0;
      IO.run({}, IO.resolved(resolveValue).map(function (value) {
        handlerCalled++;
        assert.equal(value, resolveValue);
        return IO.rejected(rejectReason);
      }, function (reason) {
        assert(false, 'wrong handler called 1');
      }).map(function (value) {
        assert(false, 'wrong handler called 2');
      }, function (reason) {
        handlerCalled++;
        assert.equal(reason, rejectReason);
        return IO.resolved(resolveValue);
      }).map(null, function () {
        assert(false, 'wrong handler called 2');
      }), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        assert.equal(2, handlerCalled);
        done();
      });
    });

    it('value handler is called with (value)', function (done) {
      var handlerCalled = 0;
      IO.run({}, IO.rejected(rejectReason).map(function (value) {
        assert(false, 'wrong handler called 1');
      }, function (reason) {
        handlerCalled++;
        assert.equal(reason, rejectReason);
        return IO.resolved(resolveValue);
      }).map(function (value) {
        handlerCalled++;
        assert.equal(value, resolveValue);
        return IO.rejected(rejectReason);
      }, function (reason) {
        assert(false, 'wrong handler called 2');
      }).map(function () {
        assert(false, 'wrong handler called 2');
      }), function (err, value) {
        assert.equal(err, rejectReason);
        assert.equal(undefined, value);
        assert.equal(2, handlerCalled);
        done();
      });
    });

  });

});
