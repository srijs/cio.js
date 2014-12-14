var assert = require('assert');

var IO = require('./index.js');

var resolveValue = {};
var rejectReason = new Error('fail');

describe('Constructors', function () {

  describe('resolved', function () {

    it('calls run callback with (null, value)', function (done) {
      IO.run(IO.resolved(resolveValue), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

  });

  describe('rejected', function () {

    it('calls run callback with (err)', function (done) {
      IO.run(IO.rejected(rejectReason), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });

  });

  describe('try', function () {

    it('returns the resolved IO that f returns', function (done) {
      var io = IO.resolved(resolveValue);
      IO.run(IO.try(function () { return io; }), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

    it('returns the rejected IO that f returns', function (done) {
      var io = IO.rejected(rejectReason);
      IO.run(IO.try(function () { return io; }), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });


    it('returns a resolved IO if f returns a value', function (done) {
      IO.run(IO.try(function () { return resolveValue; }), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

    it('returns a rejected IO if f throws', function (done) {
      IO.run(IO.try(function () { throw rejectReason; }), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });

  });

});

describe('Composition', function () {

  describe('bind', function () {

    it('error handler is called with (reason)', function (done) {
      var handlerCalled = 0;
      IO.run(IO.rejected(rejectReason).bind(function (value) {
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
      IO.run(IO.resolved(resolveValue).bind(function (value) {
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

});
