const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const {getToken, getUserFromToken} = require('../utils/helpers');
const axios = require('axios');


router.post('/deleteProfile', async (req, res) => {
    const { user_id } = req.body;
    console.log("Delete User called: ", user_id);

    try {
        // Find the user to be deleted
        const userToDelete = await UserModel.findById(user_id);

        if (!userToDelete) {
            console.log("Delete User not found");
            return res.status(404).json({ message: 'User not found' });
        }

        // Iterate through each user to update their following and followers arrays
        const allUsers = await UserModel.find({});
        for (const user of allUsers) {
            if (user.following.includes(user_id)) {
                user.following = user.following.filter(id => id !== user_id);
                user.followingCount = user.followingCount - 1;
                await user.save();
            }
            if (user.followers.includes(user_id)) {
                user.followers = user.followers.filter(id => id !== user_id);
                user.followCount = user.followCount - 1;
                await user.save();
            }
        }

        // Delete the user
        await UserModel.findByIdAndDelete(user_id);

        console.log("Delete User success");
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});


router.put('/update-profile', async (req, res) => {
    const {email, firstName, lastName, username} = req.body.profile;
    // console.log("Update Profile called: ", req.body.profile);
    const user = await UserModel.findOne({email: email});
    if(user) {
        if(user.username != username){
            const usernameExist = await UserModel.findOne({username: username});
            if(usernameExist)
            {
                return res.status(403).json({err: "This Username already exists"});
            }
        }
        
        const newUserData =  {email: email, firstName: firstName, lastName: lastName, username: username};
        const newUser = await UserModel.findOneAndUpdate({email: email}, newUserData);

        const userToReturn = newUser.toJSON(); 
        delete userToReturn.password; 
        res.status(200).json(userToReturn);
        
    } else {
        res.status(403).json({err: "User does not exist"});
    }
});

router.post('/getProfile', async (req, res) => {
    
    const {token} = req.body;
    // console.log("Getting Profile called 1: ", req.body);

    const user_id = await getUserFromToken(token);
    // console.log("Getting Profile called 2");

    const user = await UserModel.findOne({_id: user_id});
    // console.log("Getting Profile called 3: ", user);

    if(!user) {
        console.log("backend error");
        res.status(403).json({err: "User does not exist"});
    }
    delete user.password; 
    res.status(200).json(user);
    
});


router.get('/getSearchedProfile/:pid', async (req, res) => {
    
    const pid = req.params.pid;
    // console.log("Getting Searched Profile called: ", pid)
    const user = await UserModel.findOne({_id: pid});
    // console.log("Getting Searched Profile called 2: ", {user});
    if(!user) {
        console.log("backend error");
        res.status(403).json({err: "User does not exist"});
    }
    delete user.password; 
    res.status(200).json(user);
});

router.post('/followUser', async (req, res) => {
    const {token, pid} = req.body;
    console.log("Follow User called: ", token, pid);
    const user_id = await getUserFromToken(token);

    const currentUser = await UserModel.findOne({_id: user_id});
    const followUser = await UserModel.findOne({_id: pid});

    if (currentUser && followUser) {
        const isAlreadyFollowing = currentUser.following.includes(followUser._id);
        if(isAlreadyFollowing) {
            console.log("Already following this user");
            try {
                const response = await axios.post('http://localhost:8000/profile/unfollowUser', { token, pid });
                console.log("Unfollow User response:", response.data);
                return res.status(200).json(response.data);
            } catch (error) {
                console.error("Error unfollowing user:", error);
            }
            return res.status(200).json(followUser);
        }

        await currentUser.updateOne({ $push: { following: followUser._id } });
        await currentUser.updateOne({ $inc: { followingCount: 1 } });

        const updatedCurrentUser =  await UserModel.findOne({_id: user_id});
        
        await followUser.updateOne({ $push: { followers: currentUser._id } });
        await followUser.updateOne({ $inc: { followCount: 1 } });

        const updatedFollowUser = await UserModel.findOne({_id: pid});
        console.log("updated follow user: ", updatedCurrentUser, updatedFollowUser);
        res.status(200).json(updatedFollowUser);

    } else {
        console.log("User not found");
        res.status(200).json(followUser);
    }
});

router.post('/unfollowUser', async (req, res) => {

    const {token, pid} = req.body;
    console.log("Un-Follow User called: ", token, pid);
    const user_id = await getUserFromToken(token);

    const currentUser = await UserModel.findOne({_id: user_id});
    const followUser = await UserModel.findOne({_id: pid});

    if (currentUser && followUser) {
        const isAlreadyFollowing = currentUser.following.includes(followUser._id);
        if(isAlreadyFollowing) {

            await currentUser.updateOne({ $pull: { following: followUser._id } });
            await currentUser.updateOne({ $inc: { followingCount: -1 } });

            const updatedCurrentUser =  await UserModel.findOne({_id: user_id});
            
            await followUser.updateOne({ $pull: { followers: currentUser._id } });
            await followUser.updateOne({ $inc: { followCount: -1 } });

            const updatedFollowUser = await UserModel.findOne({_id: pid});
            console.log("updated un-followed user: ", updatedCurrentUser, updatedFollowUser);
            res.status(200).json(updatedFollowUser);
        } else {
            console.log("Already not following this user");
            return res.status(200).json(followUser);
        }
    } else {
        console.log("User not found");
        res.status(200).json(followUser);
    }
});


router.post('/user-data-following', async (req, res) => {
    const {user_id} = req.body;

    const user = await UserModel.findOne({_id: user_id});


    const followingList = user.following; // Assuming 'followers' is the field containing follower IDs

    try {
        const followingUsers = await Promise.all(
            followingList.map(async (followingId) => {
                const followingUser = await UserModel.findOne({ _id: followingId });
                return followingUser;
            })
        );

        const sanitizedFollowingUsers = followingUsers.map((followingUser) => {
            const { password, ...userWithoutPassword } = followingUser.toObject();
            return userWithoutPassword;
        });
        res.status(200).json(sanitizedFollowingUsers);
        
    } catch (error) {
        console.error("Error fetching following:", error);
        res.status(500).json({ error: "An error occurred while fetching following" });
    }
});

router.post('/user-data-followers', async (req, res) => {
    const {user_id} = req.body;

    const user = await UserModel.findOne({_id: user_id});

    const followersList = user.followers; // Assuming 'followers' is the field containing follower IDs

    try {
        const followerUsers = await Promise.all(
            followersList.map(async (followerId) => {
                const followerUser = await UserModel.findOne({ _id: followerId });
                return followerUser;
            })
        );

        const sanitizedFollowerUsers = followerUsers.map((followerUser) => {
            const { password, ...userWithoutPassword } = followerUser.toObject();
            return userWithoutPassword;
        });
        res.status(200).json(sanitizedFollowerUsers);
        
    } catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).json({ error: "An error occurred while fetching followers" });
    }
});


module.exports = router;