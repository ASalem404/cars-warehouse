const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    length: users.length,
    users,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      msg: "Input validation error",
      errors: errors.array(),
    });
  }
  const user = await User.create(req.body);

  res.status(201).json({
    status: "success",
    user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(204).json({});
});
