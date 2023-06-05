const express = require("express");

const api = express.Router();

const messagesRouter = require("./messages/messages.route");
const userRouter = require("./user/user.route");

api.use("/message", messagesRouter);
api.use("/user", userRouter);

module.exports = api