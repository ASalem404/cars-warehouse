const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests, try later.",
});

module.exports = limiter;
