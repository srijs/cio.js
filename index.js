var statePending = 0,
    stateFulfilled = 1,
    stateRejected = 2;

var IO = module.exports = function (a) {
  this.state = statePending;
  this.action = a;
  this.value = null;
  this.reason = null;
  this.onFulfilled = IO.resolved;
  this.onRejected = IO.rejected;
};

IO.resolved = function (value) {
  var io = new IO();
  io.state = stateFulfilled;
  io.value = value;
  return io;
};

IO.rejected = function (reason) {
  var io = new IO();
  io.state = stateRejected;
  io.reason = reason;
  return io;
};

IO.try = function (f) {
  try {
    var v = f();
    if (!(v instanceof IO)) {
      return IO.resolved(v);
    }
    return v;
  } catch (e) {
    return IO.rejected(e);
  }
};

IO.method = function (f) {
  return function () {
    var c = this, a = arguments;
    return IO.try(function () {
      return f.apply(c, a);
    });
  };
};

IO.prototype.bindFulfilled = function (h) {
  var of = this.onFulfilled;
  var or = this.onRejected;
  if (this.state === statePending) {
    var io = new IO(this.action);
    io.onFulfilled = function (value) {
      return of(value).bindFulfilled(h);
    };
    io.onRejected = function (reason) {
      return of(value).bindFulfilled(h);
    };
    return io;
  }
  if (this.state === stateFulfilled) {
    return h(this.value);
  }
  return this;
};

IO.prototype.bindRejected = function (h) {
  var of = this.onFulfilled;
  var or = this.onRejected;
  if (this.state === statePending) {
    var io = new IO(this.action);
    io.onFulfilled = function (value) {
      return of(value).bindRejected(h);
    };
    io.onRejected = function (reason) {
      return or(reason).bindRejected(h); 
    };
    return io;
  }
  if (this.state === stateRejected) {
    return h(this.reason);
  }
  return this;
};

IO.run = function (io, cb) {
  if (io.state === stateFulfilled) {
    return cb(null, io.value);
  }
  if (io.state === stateRejected) {
    return cb(io.reason);
  }
  io.action(function (err, value) {
    if (err) {
      IO.run(io.onRejected(err), cb);
    } else {
      IO.run(io.onFulfilled(value), cb);
    }
  });
};
