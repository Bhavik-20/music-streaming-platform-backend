const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const axios = require('axios');

router.post('/like', async (req, res) => {
    const {currentUserId, albumId} = req.body;

    const user = await UserModel.findById(currentUserId);
    if(!user) return res.status(400).json({message: 'User not found'});

    if(user.likedAlbums.includes(albumId)) {
        const response = await axios.post('http://localhost:8000/albumsPlaylist/unlike', { currentUserId, albumId });
        return res.status(200).json(response.data); 
    } else {
        await user.updateOne({ $push: { likedAlbums: albumId } });
    }

    const updatedUser = await UserModel.findById(currentUserId);

    res.status(200).json(updatedUser.likedAlbums);
});

router.post('/unlike', async (req, res) => {
    const {currentUserId, albumId} = req.body;

    const user = await UserModel.findById(currentUserId);
    if(!user) return res.status(400).json({message: 'User not found'});

    if(user.likedAlbums.includes(albumId)) {
        await user.updateOne({ $pull: { likedAlbums: albumId } });
    }

    const updatedUser = await UserModel.findById(currentUserId);

    res.status(200).json(updatedUser.likedAlbums);
});

router.post('/get-all-liked-albums', async (req, res) => {
    const {currentUserId} = req.body;
    const user = await UserModel.findOne({_id: currentUserId});
    if(!user) {
        console.log("No user")
        return res.status(400).json({message: 'User not found'});
    }
    res.status(200).json(user.likedAlbums);
});

module.exports = router;