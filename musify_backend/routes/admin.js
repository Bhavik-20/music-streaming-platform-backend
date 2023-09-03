const express = require('express');
const router = express.Router();
const AdminModel = require('../models/AdminSchema');
const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const {getToken} = require('../utils/helpers');

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    
    const admin = await AdminModel.findOne({ email: email });
    if(!admin) {
        return res.status(403).json({err: "Admin does not exist"});
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if(!isPasswordValid) {
        return res.status(403).json({err: "Invalid credentials"});
    }

    const token = await getToken(email, admin);

    const userToReturn = {...admin.toJSON(), token}; 
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

router.get('/users', async (req, res) => {
    
    const user_list = await UserModel.find();
    const sanitized_user_list = user_list.map(user => {
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
    });
    return res.status(200).json(sanitized_user_list);
});

router.put('/verify-artist', async (req, res) => {
    const {id} = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(id, {role: "artist-verified"});
    const user_list = await UserModel.find();
    const sanitized_user_list = user_list.map(user => {
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
    });
    return res.status(200).json(sanitized_user_list);
});

router.put('/ignore-verify-artist', async (req, res) => {
    const {id} = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(id, {role: "artist"});
    const user_list = await UserModel.find();
    const sanitized_user_list = user_list.map(user => {
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
    });
    return res.status(200).json(sanitized_user_list);
});

module.exports = router;