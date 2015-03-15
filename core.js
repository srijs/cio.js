var statePending = 0,
    stateFulfilled = 1,
    stateRejected = 2;

var IO = module.exports = function (type, args) {
  this.state = statePending;
  this.type = type;
  this.args = args || [];
  this.value = null;
  this.reason = null;
  this.onFulfilled = null;
  this.onRejected = null;
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

var invoke = function (f, v) {
  try {
    var v = f(v);
    if (!(v instanceof IO)) {
      return IO.resolved(v);
    }
    return v;
  } catch (e) {
    return IO.rejected(e);
  }
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

IO.try = invoke;

IO.method = function (f) {
  return function () {
    return apply(f, this, arguments);
  };
};

IO.prototype.then = function (hf, hr) {
  var of = this.onFulfilled || IO.resolved;
  var or = this.onRejected || IO.rejected;
  if (this.state === statePending) {
    var io = new IO(this.type, this.args);
    io.onFulfilled = function (value) {
      return of(value).then(hf, hr);
    };
    io.onRejected = function (reason) {
      return or(reason).then(hf, hr);
    };
    return io;
  }
  if (this.state === stateFulfilled) {
    return invoke(hf || IO.resolved, this.value);
  }
  if (this.state === stateRejected) {
    return invoke(hr || IO.rejected, this.reason);
  }
  return this;
};

IO.run = function (actions, io, cb) {
  if (io.state === stateFulfilled) {
    if (io.onFulfilled) {
      IO.run(actions, io.onFulfilled(io.value), cb);
    } else {
      cb(null, io.value);
    }
  } else if (io.state === stateRejected) {
    if (io.onRejected) {
      IO.run(actions, io.onRejected(io.reason), cb);
    } else {
      cb(io.reason);
    }
  } else {
    actions[io.type].apply(null, [].concat(io.args, function (err, value) {
      if (err) {
        if (io.onRejected) {
          IO.run(actions, io.onRejected(err), cb);
        } else {
          cb(err);
        }
      } else {
        if (arguments.length > 2) {
          value = Array.prototype.slice.call(arguments, 1);
        }
        if (io.onFulfilled) {
          IO.run(actions, io.onFulfilled(value), cb);
        } else {
          cb(null, value);
        }
      }
    }));
  }
};
