const UserModel = require("../../models/users/users.model")

const UserController = {
    createUser: async function(req, res) {
        const { username, password, image } = req.body;
        if (!username|| !image || !password) {
            return res.status(400).json({message: "Invalid request"});
        }
        try {
            const user = await UserModel.createUser(username, password, image);
            return res.status(201).json({message: "User created"});
        }
        catch (error) {
            return res.status(500).json({message: "Something went wrong"});
        }
    },
    getUser: async function(req, res) {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({message: "Invalid request"});
        }
        try {
            const user = await UserModel.getUserById(id);
            res.status(200).json({user});
        }
        catch (error) {
            res.status(500).json({message: "Something went wrong"});
        }
    },
    loginUser: async function(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({message: "Invalid request"});
        }
        try {
            const user = await UserModel.getUserByUsername(username);
            console.log(user)
            if (user && user.password === password) {
                const { password, ..._user } = user;
                res.status(200).json({user: _user});
            }
            else {
                return res.status(400).json({message: "Invalid request"});
            }
        }
        catch (error) {
            res.status(500).json({message: "Something went wrong"});
        }
    },
    deleteUser: async function(req, res) {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({message: "Invalid request"});
        }
        try {
            const user = await UserModel.deleteUser(id);
            res.status(200).json({message: "User deleted"});
        }
        catch (error) {
            res.status(500).json({message: "Something went wrong"});
        }
    }
}

module.exports = UserController;