var IO = require('./core');

module.exports = function (type, name) {
  return function () {
    return new IO(type, [name, arguments]);
  };
};
