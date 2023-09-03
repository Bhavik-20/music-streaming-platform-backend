const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const axios = require('axios');

router.post('/like', async (req, res) => {
    const {currentUserId, songId} = req.body;

    const user = await UserModel.findById(currentUserId);
    if(!user) return res.status(400).json({message: 'User not found'});

    if(user.likedSongs.includes(songId)) {
        const response = await axios.post('http://localhost:8000/songs/unlike', { currentUserId, songId });
        return res.status(200).json(response.data); 
    } else {
        await user.updateOne({ $push: { likedSongs: songId } });
    }

    const updatedUser = await UserModel.findById(currentUserId);

    res.status(200).json(updatedUser.likedSongs);
});

router.post('/unlike', async (req, res) => {
    const {currentUserId, songId} = req.body;

    const user = await UserModel.findById(currentUserId);
    if(!user) return res.status(400).json({message: 'User not found'});

    if(user.likedSongs.includes(songId)) {
        await user.updateOne({ $pull: { likedSongs: songId } });
    }

    const updatedUser = await UserModel.findById(currentUserId);

    res.status(200).json(updatedUser.likedSongs);
});

router.post('/get-all-liked-songs', async (req, res) => {
    const {currentUserId} = req.body;
    const user = await UserModel.findOne({_id: currentUserId});
    if(!user) {
        console.log("No user")
        return res.status(400).json({message: 'User not found'});
    }
    res.status(200).json(user.likedSongs);
});

module.exports = router;