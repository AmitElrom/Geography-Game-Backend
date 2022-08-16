const { Schema } = require('mongoose');
const connection = require('../configs/database');

const userSchema = new Schema({
    // _id: { type: Schema.Types.ObjectId, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
})

const User = connection.model('users', userSchema);

module.exports = User;