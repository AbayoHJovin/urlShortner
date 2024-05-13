const joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const userJoiSchema = joi.object({
  username: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(3).required()
});

const User = mongoose.model("User", userSchema);

module.exports=userJoiSchema
module.exports = User;
