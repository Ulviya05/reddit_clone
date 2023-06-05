const MessageModel = require("../../models/messages/messages.model");
const ReplyModel = require("../../models/replies/replies.model");

const MessagesController = {
    getMessages: async function (req, res) {
        const user_id = req.headers.authorization;
        try {
            let func = null;
            const { reply_id } = req.params;
            if (reply_id && reply_id !== "ALL") {
                func = ReplyModel.Reply.findById(reply_id)
            }
            else {
                func = MessageModel.Message.find()
            }

            let messages = await func
                .populate({
                    path: "user",
                    model: "User",
                })
                .populate({
                    path: "replies",
                    model: "Reply",
                    populate: [
                        {
                            path: "user",
                            model: "User",
                        },
                        {
                            path: "replies",
                            model: "Reply",
                            populate: [
                                {
                                    path: "user",
                                    model: "User",
                                },
                                {
                                    path: "replies",
                                    model: "Reply"
                                }
                            ]
                        }
                    ]
                })
                .lean()
                .exec();

            function findSign(message) {
                let sign = "";
                if (message.plus.map(o => o.toString()).includes(user_id)) {
                    sign = "+"
                }
                else if (message.minus.map(o => o.toString()).includes(user_id)) {
                    sign = "-"
                }
                return sign;
            }

            if (reply_id && reply_id !== "ALL") {
                messages = [messages];
            }

            const _messages = messages.map(message => {
                message.replies = message.replies.map(reply => {
                    reply.replies = reply.replies.map(_reply => {
                        if (_reply.deleted) {
                            return {
                                _id: _reply._id,
                                deleted: true,
                                replies: _reply.replies
                            }
                        }
                        _reply.sign = findSign(_reply);
                        delete _reply["plus"];
                        delete _reply["minus"];
                        return _reply;
                    })
                    if (reply.deleted) {
                        return {
                            _id: reply._id,
                            deleted: true,
                            replies: reply.replies
                        }
                    }
                    reply.sign = findSign(reply);
                    delete reply["plus"];
                    delete reply["minus"];
                    return reply;
                })
                if (message.deleted) {
                    return {
                        _id: message._id,
                        deleted: true,
                        replies: message.replies
                    }
                }
                message.sign = findSign(message);
                delete message["plus"];
                delete message["minus"];
                return message;
            })
            res.status(200).json({ messages: _messages });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong" });
        }
    },
    createMessage: async function (req, res) {
        const { user_id, content } = req.body;
        if (!user_id || !content) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            const message = await MessageModel.createMessage(user_id, content);
            const populatedMessage = await message.populate("user", "username image")
            res.status(201).json({ message: populatedMessage });
        } catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    },
    createReply: async function (req, res) {
        const { message_id, user_id, reply_content, type } = req.body;
        if (!message_id || !user_id || !reply_content || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            async function createReply(get) {
                const message_reply = await get(message_id);
                if (message_reply) {
                    const reply_message = await ReplyModel.createReply(user_id, reply_content);
                    const populatedReply = await reply_message.populate("user", "username image")
                    message_reply.replies.push(populatedReply);
                    message_reply.save();
                    res.status(201).json({ message: message_reply });
                }
                else {
                    res.status(400).json({ message: "Invalid request" });
                }
            }
            if (type === "message") {
                createReply(MessageModel.getMessageById)
            }
            else if (type === "reply") {
                createReply(ReplyModel.getReplyById)
            }
            else {
                res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }

    },
    score: async function (req, res) {
        const { sign, message_id, user_id, type } = req.body;
        if (!message_id || !user_id || !sign || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            async function createReplyScore(get) {
                const message = await get(message_id);
                console.log(message)
                if (message) {
                    if (sign === "+") {
                        if (!message.plus.includes(user_id)) {
                            message.score += 1;
                            message.plus.push(user_id);
                        }
                        const minus = message.minus.indexOf(user_id);
                        if (minus > -1) {
                            message.score += 1;
                            message.minus.splice(minus, 1);
                        }
                    }
                    else if (sign === "-") {
                        if (!message.minus.includes(user_id)) {
                            message.score -= 1;
                            message.minus.push(user_id);
                        }
                        const plus = message.plus.indexOf(user_id);
                        if (plus > -1) {
                            message.score -= 1;
                            message.plus.splice(plus, 1);
                        }
                    }
                    else {
                        res.status(400).json({ message: "Invalid request" });
                    }
                    message.save();
                    res.status(200).json({ message });

                }
                else {
                    res.status(400).json({ message: "Invalid request" });
                }
            }
            if (type === "message") {
                createReplyScore(MessageModel.getMessageByIdAndPlusMinus)
            }
            else if (type === "reply") {
                createReplyScore(ReplyModel.getReplyByIdAndPlusMinus)
            }
            else {
                res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    deleteMessage: async function (req, res) {
        const { message_id, type } = req.params;
        if (!message_id || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }

        try {
            async function deleteMe(_delete) {
                await _delete(message_id);
                res.status(200).json({ message: "Message deleted" });
            }
            if (type === "message") {
                deleteMe(MessageModel.deleteMessage)
            }
            else if (type === "reply") {
                deleteMe(ReplyModel.deleteReply)
            }
            else {
                res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    editMessage: async function (req, res) {
        const { message_id, type } = req.params;
        const { edited_content } = req.body;
        if (!message_id || !edited_content || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            async function editMe(_edit) {
                const message = await _edit(message_id, edited_content);
                res.status(200).json({ message });
            }
            if (type === "message") {
                editMe(MessageModel.editMessage)
            }
            else if (type === "reply") {
                editMe(ReplyModel.editReply)
            }
            else {
                res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
        
    }
}

module.exports = MessagesController;