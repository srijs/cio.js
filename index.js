var statePending = 0,
    stateFulfilled = 1,
    stateRejected = 2;

var IO = module.exports = function (a) {
  this.state = statePending;
  this.action = a;
  this.value = null;
  this.reason = null;
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

var apply = function (f, c, a) {
  try {
    var v = f.apply(c, a);
    if (!(v instanceof IO)) {
      return IO.resolved(v);
    }
    return v;
  } catch (e) {
    return IO.rejected(e);
  }
};

IO.try = function (f) {
  return apply(f, null, []);
};

IO.method = function (f) {
  return function () {
    return apply(f, this, arguments);
  };
};

IO.prototype.bind = function (hf, hr) {
  var of = this.onFulfilled;
  var or = this.onRejected;
  if (this.state === statePending) {
    var io = new IO(this.action);
    io.onFulfilled = function (value) {
      return (of || IO.resolved)(value).bind(hf, hr);
    };
    io.onRejected = function (reason) {
      return (or || IO.rejected)(reason).bind(hf, hr); 
    };
    return io;
  }
  if (this.state === stateFulfilled) {
    return apply(hf || IO.resolved, null, [this.value]);
  }
  if (this.state === stateRejected) {
    return apply(hr || IO.rejected, null, [this.reason]);
  }
  return this;
};

IO.run = function (io, cb) {
  if (io.state === stateFulfilled) {
    if (io.onFulfilled) {
      IO.run(io.onFulfilled(io.value), cb);
    } else {
      cb(null, io.value);
    }
  } else if (io.state === stateRejected) {
    if (io.onRejected) {
      IO.run(io.onRejected(io.reason), cb);
    } else {
      cb(io.reason);
    }
  } else {
    io.action(function (err, value) {
      if (err) {
        IO.run(io.onRejected(err), cb);
      } else {
        IO.run(io.onFulfilled(value), cb);
      }
    });
  }
};
