const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    createdAt: {
        type: Date
    },
    username: {
        type: String
    },
    donewelcome: {
        type: String,
        expires: 10
    }
});

module.exports = mongoose.model('User', UserSchema);