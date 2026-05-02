const Log = require('./log');

function logger(req, res, next) {
  Log("backend", "info", "route", req.method + " " + req.url);
  next();
}

module.exports = logger;