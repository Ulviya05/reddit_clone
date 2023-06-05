const mongoose = require("mongoose");
const { userSchema } = require("../users/users.model");

const messagesSchema = new mongoose.Schema(
    {
        content: {
            type: String
        },
        score: {
            type: Number
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reply"
            }
        ],
        deleted: {
            type: Boolean
        },
        plus: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        },
        minus: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        }
    },
    { timestamps: true }
)

const Message = mongoose.model("Message", messagesSchema);

const createMessage = async (user_id, content) => {
    const message = new Message({
        content,
        score: 0,
        user: user_id,
        replies: [],
        deleted: false,
        plus: [],
        minus: []
    })
    return await message.save();
}

const getAllMessages = async () => {
    return Message.find();
}

const getMessageById = async (id) => {
    return Message.findById(id);
}

const getMessageByIdAndPlusMinus = async (id) => {
    return Message.findOne({_id: id}, { plus: 1, minus: 1, score: 1 }).exec();
}

const deleteMessage = async (id) => {
    const message = await getMessageById(id);
    message.deleted = true;
    message.save();
    return message
}

const editMessage = async (message_id, edited_content) => {
    const message = await getMessageById(message_id);
    console.log(message)
    message.content = edited_content;
    message.save();
    return message
}


module.exports = {
    Message,
    createMessage,
    getAllMessages,
    getMessageById,
    getMessageByIdAndPlusMinus,
    deleteMessage,
    editMessage
}