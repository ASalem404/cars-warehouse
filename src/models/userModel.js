const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    /** only works with mongoose.save() and mongoose.create() */
    validate: {
      validator: function (confirmPass) {
        return confirmPass === this.password;
      },
      message: "passwords do not match!",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// check if the password is correct in login
userSchema.methods.isCorrectPassword = async function (
  bodyPassword,
  realPassword
) {
  return await bcrypt.hash(bodyPassword, realPassword);
};

userSchema.methods.isPassChangedAfterToken = function (JWTInitialTime) {
  if (this.passwordChangedAt) {
    const changedAtParsed = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedAtParsed > JWTInitialTime;
  }
  return false;
};

const User = mongoose.Model("User", userSchema);

module.exports = User;
