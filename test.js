var assert = require('assert');

var IO = require('./index.js');

describe('Constructors', function () {

  describe('resolved', function () {

    it('calls run callback with (null, value)', function (done) {
      var resolveValue = {};
      IO.run(IO.resolved(resolveValue), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

  });

  describe('rejected', function () {

    it('calls run callback with (err)', function (done) {
      var rejectReason = new Error('fail');
      IO.run(IO.rejected(rejectReason), function (err) {
        assert.equal(err, rejectReason);
        done();
      });
    });

  });

  describe('try', function () {

    it('returns a resolved promise if f returns a value', function (done) {
      var resolveValue = 'foobar';
      IO.run(IO.try(function () { return resolveValue; }), function (err, value) {
        assert.ifError(err);
        assert.equal(value, resolveValue);
        done();
      });
    });

  });

});

describe('Binders', function () {

  describe('bindFulfilled', function () {

    it('handler is called with (value)', function (done) {
      var resolveValue = {}, handlerCalled = false;
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
      var rejectReason = new Error('fail'), handlerCalled = false;
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
      var rejectReason = new Error('fail'), handlerCalled = false;
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
      var resolveValue = {}, handlerCalled = false;
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
