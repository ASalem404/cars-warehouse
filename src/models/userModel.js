const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
  },

  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
  },
});

const User = mongoose.Model("User", userSchema);

module.exports = User;
