const appError = require("../helpers/appError");
const sendEmail = require("../helpers/email");
const asyncHandler = require("express-async-handler");
const { promisify } = require("util");
const User = require("../models/userModel");
const JWT = require("jsonwebtoken");
const AppError = require("../helpers/appError");
const crypto = require("crypto");

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new appError("Invalid email or password", 400));
  const user = await User.findOne({ email }).select("+password ");
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new appError("Invalid email or password", 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = asyncHandler(async (req, res, next) => {
  // check for the token existence
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You dont have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new appError("this email address doesn't exist", 404));

  // Create a reset password Token for the user
  const passwordToken = user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${passwordToken}`;
  const message = "Use the URL provided to reset your password.\n " + resetURL;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Reset password URL was sent to the user email address",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordTokenExp = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "unexpected error during password reset, please try again",
        500
      )
    );
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Check if the user token is valid
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Get the user by using the token information
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordTokenExp: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is not valid"), 400);
  }

  // update the password, delete pasword token, and send access token to the user
  user.passwordResetToken = undefined;
  user.passwordTokenExp = undefined;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  createSendToken(user, 200, res);
});

// update the current user password
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user.isCorrectPassword(req.body.currentPassword, user.password))
    return next(new AppError("Invalid password", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  createSendToken(user, 200, res);
});
