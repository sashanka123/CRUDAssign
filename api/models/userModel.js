var mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  hash_password: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: "",
  },
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

mongoose.model("User", UserSchema);
