const express = require("express");
const UserController = require("./user.controller")

const userRouter = express.Router();

userRouter.post(
    "/",
    UserController.createUser
)

userRouter.post(
    "/login",
    UserController.loginUser
)

userRouter.get(
    "/",
    UserController.getUser
)

userRouter.delete(
    "/",
    UserController.deleteUser
)

module.exports = userRouter;