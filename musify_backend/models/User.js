const mangoose = require('mongoose');

const UserSchema = mangoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required:false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true,
        private: true
    },
    username: {
        type: String,
        required:false
    },
    role: {
        type: String,
        required: true,
    },
    followCount: {
        type: Number,
        default: 0,
    },
    followers: {
        type: [String],
        default: [],
    },
    followingCount: {
        type: Number,
        default: 0,
    },
    following: {
        type: [String],
        default: [],
    },
    likedSongs: {
        type: [String],
        default: [],
    },
    likedAlbums: {
        type: [String],
        default: [],
    },
    likedArtists: {
        type: [String],
        default: [],
    }
});

const UserModel = mangoose.model('User', UserSchema);

module.exports = UserModel;