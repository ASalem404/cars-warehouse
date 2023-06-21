const mongoose = require("mongoose");
const crypto = require("crypto");
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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordTokenExp: Date,
});

// encrypt the password before sending it to the DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// update passwordChangedAt property after password modification
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// check if the password is correct in login
userSchema.methods.isCorrectPassword = async function (
  bodyPassword,
  realPassword
) {
  return await bcrypt.compare(bodyPassword, realPassword);
};

// check for authorization point,
// if user change the password then he must login again
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

//  initialize the token that will be used for restoring the user password
userSchema.methods.resetPasswordToken = function () {
  const passToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(passToken)
    .digest("hex");
  this.passwordTokenExp = Date.now() + 10 * 60 * 1000;

  return passToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
