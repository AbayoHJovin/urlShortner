const mongoose = require("mongoose");
const shortId = require("short-id");
const shortenedUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortenedCode: {
    type: String,
    required: true,
    unique: true,
    default: shortId.generate,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const ShortenedUrl = mongoose.model("ShortenedUrl", shortenedUrlSchema);

module.exports = ShortenedUrl;
