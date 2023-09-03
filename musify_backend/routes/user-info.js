const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const {getUserFromToken} = require('../utils/helpers');


router.get('/search', async (req, res) => {
    const searchTerm = req.query.searchTerm || "";
    const token = req.query.token || "";

    const currentUser = await getUserFromToken(token);
    const users = await UserModel.find({
        $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { firstName: { $regex: searchTerm, $options: "i" } },
            { lastName: { $regex: searchTerm, $options: "i" } }
        ]
    });

    const sanitized_user_list = users
                                .filter(user => user._id != currentUser)
                                .map(user => {
                                            const { password, ...userWithoutPassword } = user.toObject();
                                            return userWithoutPassword;
                                });

    return res.json(sanitized_user_list);
});

module.exports = router;
