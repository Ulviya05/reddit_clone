const express = require("express");
const { auth, my_message } = require("../../utils/auth");
const MessagesController = require("./messages.controller")

const messagesRouter = express.Router();

messagesRouter.get(
    "/:reply_id",
    auth,
    MessagesController.getMessages
)

messagesRouter.post(
    "/",
    auth,
    MessagesController.createMessage
)

messagesRouter.post(
    "/reply",
    auth,
    MessagesController.createReply
)

messagesRouter.post(
    "/score",
    auth,
    MessagesController.score
)

messagesRouter.delete(
    "/:type/:message_id",
    auth,
    my_message,
    MessagesController.deleteMessage
)

messagesRouter.put(
    "/:type/:message_id",
    auth,
    my_message,
    MessagesController.editMessage
)

module.exports = messagesRouter;