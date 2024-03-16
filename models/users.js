const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Users = new Scheme({
    usename: { type: String, unique: true, maxLength: 255 },
    password: { type: String, maxLength: 255 },
    email: { type: String, unique: true },
    name: { type: String },
    avatar: { type: String },
    available: { type: String, default: false }
}, {
    timestamps: true//tạo ra 2 trường create at và update at
})
module.exports = mongoose.model('user', Users)