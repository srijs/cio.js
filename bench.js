var Benchmark = require('benchmark');

var IO = require('./core');

var opts = {
  onStart: function () {
    console.log('=== Benchmarking: ' + this.name);
  },
  onCycle: function (event) {
    console.log(String(event.target));
  },
  onComplete: function () {
    //console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  }
};

(new Benchmark.Suite('Construct', opts))
.add('IO#new', function () {
  new IO();
})
.add('Callback', function () {
  (function () {});
})
.run();

(new Benchmark.Suite('Resolve', opts))
.add('IO#new', function () {
  IO.run({
    run: function (cb) { cb(null, 'abc'); }
  }, new IO('run'), function () {});
})
.add('IO#resolved', function () {
  IO.run({}, IO.resolved('abc'), function () {});
})
.add('IO#try', function () {
  IO.run({}, IO.try(function () {
    return 'abc';
  }), function () {});
})
.add('Callbacks#call', function () {
  (function (cb) {return cb(null, 'abc')})(function () {});
})
.add('Callbacks#try', function () {
  (function (cb) {
    try {
      return cb('abc');
    } catch (e) {
      return cb(e);
    }
  })(function () {});
})
.run();

(new Benchmark.Suite('Reject', opts))
.add('IO#new', function () {
  IO.run({
    run: function (cb) { cb('abc'); }
  }, new IO('run'), function () {});
})
.add('IO#rejected', function () {
  IO.run({}, IO.rejected('abc'), function () {});
})
.add('IO#try', function () {
  IO.run({}, IO.try(function () {
    throw 'abc';
  }), function () {});
})
.add('Callbacks#call', function () {
  (function (cb) {return cb(null, 'abc')})(function () {});
})
.add('Callbacks#try', function () {
  (function (cb) {
    try {
      throw 'abc';
    } catch (e) {
      return cb(e);
    }
  })(function () {});
})
.run();
