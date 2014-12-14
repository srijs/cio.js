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

describe('Binders', function () {

  describe('bindFulfilled', function () {

    it('handler is called with (value)', function (done) {
      var handlerCalled = false;
      IO.run(IO.resolved(resolveValue).bindFulfilled(IO.method(function (value) {
        handlerCalled = true;
        assert.equal(value, resolveValue);
      })), function (err, value) {
        assert.ifError(err);
        assert(handlerCalled);
        done();
      });
    });

    it('handler is not called with (reason)', function (done) {
      var handlerCalled = false;
      IO.run(IO.rejected(rejectReason).bindFulfilled(IO.method(function (value) {
        handlerCalled = true;
      })), function (err, value) {
        assert.equal(err, rejectReason);
        assert(!handlerCalled);
        done();
      });
    });

  });

  describe('bindRejected', function () {

    it('handler is called with (reason)', function (done) {
      var handlerCalled = false;
      IO.run(IO.rejected(rejectReason).bindRejected(IO.method(function (reason) {
        handlerCalled = true;
        assert.equal(reason, rejectReason);
      })), function (err, value) {
        assert.ifError(err);
        assert(handlerCalled);
        done();
      });
    });

    it('handler is not called with (value)', function (done) {
      var handlerCalled = false;
      IO.run(IO.resolved(resolveValue).bindRejected(IO.method(function (reason) {
        handlerCalled = true;
      })), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue); 
        assert(!handlerCalled);
        done();
      });
    });

  });
});
