const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const router = express.Router();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
const User = require("../model/user");
const shortUrlDb = require("../model/urls");
const userJoiSchema = require("../model/user");
const joi = require("joi");
const url = process.env.URL;
const port = process.env.PORT;
const secret = process.env.SECRET;

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to database successfully");
    app.listen(port, () => {
      console.log("Sever has started");
    });
  })
  .catch((e) => {
    console.log("Connection failed:", e);
  });

function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      throw new Error("No token found");
    }
    const requester = jwt.verify(token, secret);
    if (!requester) {
      throw new Error("Unauthorized");
    }
    req.user = requester;
    next();
  } catch (e) {
    return res
      .status(401)
      .json({ message: e.message || "Something went wrong" });
  }
}

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new Error("Some credentials are missing");
    }
    const validationResult = userJoiSchema.validate({
      username: username,
      email: email,
      password: password,
    });
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }
    const hash = await bcrypt.hash(password, 6);
    const command = await User.create({
      username: username,
      email: email,
      password: hash,
    });
    return res.status(201).json({ message: "User Added Successfully" });
  } catch (e) {
    return res
      .status(401)
      .json({ message: e.message || "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Some credentials are missing");
    }
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      throw new Error("Invalid credentials");
    }
    const compare = await bcrypt.compare(password, foundUser.password);
    if (!compare) {
      throw new Error("Invalid credentials");
    }
    const userId = foundUser.id;
    const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });
    return res.status(200).json({ data: foundUser, token: token });
  } catch (e) {
    return res
      .status(401)
      .json({ message: e.message || "Something went wrong" });
  }
});

app.get("/:user", checkAuth, async (req, res) => {
  try {
    const user = req.params.user;
    const userWithId = await User.findById(user);
    if (!userWithId) {
      throw new Error("Invalid user");
    }
    return res.status(200).json({ userData: userWithId });
  } catch (e) {
    return res
      .status(401)
      .json({ message: e.message || "Something went wrong" });
  }
});

app.post("/shortenUrl", async (req, res) => {
  try {
    const { originalUrl, userId } = req.body;
    const shortenedUrl = new shortUrlDb({
      originalUrl: originalUrl,
      user: userId,
    });
    const savedUrl = await shortenedUrl.save();
    const shortUrl = savedUrl.shortenedCode;
    return res
      .status(201)
      .json({ message: "Added successfully", url: shortUrl });
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
});
app.get("/", async (req, res) => {
  try {
    const shortUrl = req.query.short;
    if (!shortUrl) {
      throw new Error("Invalid short url");
    }
    const lookForFullUrl = await shortUrlDb.findOne({
      shortenedCode: shortUrl,
    });
    if (!lookForFullUrl) {
      throw new Error("Invalid short url");
    }
    res.redirect(lookForFullUrl.originalUrl);
    console.log(lookForFullUrl.originalUrl);
  } catch (e) {
    return res
      .status(401)
      .json({ message: e.message || "Something went wrong" });
  }
});
app.get("/all/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    if (!userId) {
      throw new Error("Something went wrong");
    }
    const userWithId = await shortUrlDb.find({ user: userId });
    if (!userWithId) {
      throw new Error("There are some issues, please try again");
    }
    return res.status(200).json({ response: userWithId});
  } catch (e) {
    return res
      .status(401)
      .json({ messssage: e.message || "Something went wrong" });
  }
});
