const appError = require("../utils/appError");
const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const JWT = require("jsonwebtoken");

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(user._id);
  res.status(201).json({
    message: "User created successfully",
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new appError("Invalid email or password", 400));
  const user = await User.findOne({ email }).select("+password ");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new appError("Invalid email or password", 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    message: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // check for the token existence
  let token;
  if (req.headers.authorization?.startWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new appError(
        "You are not logged in, please login first to access this page.",
        401
      )
    );
  }

  // verify the token
  let decoded;
  try {
    decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new appError("Authentication failed, login again.", 401));
  }

  // check if the user is still exist.
  const user = await User.findById(decoded.id);
  if (!user) return next(new appError("User no longer exist.", 401));

  // check if the user change the password so he must be login again.
  if (user.isPassChangedAfterToken(decoded.iat))
    return next(new appError("Session expired, login again.", 401));

  req.user = user;
  // if user pass all the previous validations, then user is authorized
  next();
});
