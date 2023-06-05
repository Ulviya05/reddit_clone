const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String, 
            required: true,
            select: false
        },
        image: {
            type: String
        }
    }
)

const User = mongoose.model("User", userSchema)

const createUser = async (username, password, image) => {
    const user = new User({
        username,
        password,
        image
    })
    return await user.save();
}
const findUser = async (id) => {
    return db.collection.find( { user: { nurlan } } )
}

const getUserById = async (id) => {
    return User.findById(id);
}

const getUserByUsername = async (username) => {
    return User.findOne({username: username}).select('+password').lean();
}

const deleteUser = async (id) => {
    return User.findByIdAndDelete(id);
}

module.exports = {
    userSchema,
    User,
    createUser,
    getUserById,
    deleteUser,
    getUserByUsername,
    findUser
}