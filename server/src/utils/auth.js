const MessageModel = require("../models/messages/messages.model");
const ReplyModel = require("../models/replies/replies.model");

module.exports = {
    auth: function (req, res, next) {
        if (!req.headers.authorization) {
            return res.status(403).json({ error: 'No credentials sent!' });
        }
        next();
    },
    my_message: function (req, res, next) {
        const { message_id, type } = req.params;
        const user_id = req.headers.authorization;

        if (!message_id || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }
        async function checkMyMessage(get) {
            try {
                const message = await get(message_id);
                if (message) {
                    if (message.user.toString() === user_id) {
                        next();
                    }
                    else {
                        return res.status(403).json({ error: 'Unauthorized!' });
                    }
                }
                else {
                    return res.status(400).json({ message: "Invalid request" });
                }
            } catch (error) {
                return res.status(500).json({ message: "Something went wrong" });
            }
        }
        if (type === "message") {
            checkMyMessage(MessageModel.getMessageById)
        }
        else if (type === "reply") {
            checkMyMessage(ReplyModel.getReplyById)
        }
        else {
            return res.status(400).json({ message: "Invalid request" });
        }
    }
};