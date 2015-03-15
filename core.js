var statePending = 0,
    stateFulfilled = 1,
    stateRejected = 2;

var IO = module.exports = function (type, args) {
  Object.defineProperties(this, {
    state: {value: statePending},
    type: {value: type},
    args: {value: args || []}
  });
};

IO.resolved = function (value) {
  return Object.defineProperties(Object.create(IO.prototype), {
    state: {value: stateFulfilled},
    value: {value: value}
  });
};

IO.rejected = function (reason) {
  return Object.defineProperties(Object.create(IO.prototype), {
    state: {value: stateRejected},
    reason: {value: reason}
  });
};

var invoke = function (f, a) {
  try {
    var v = f(a);
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
