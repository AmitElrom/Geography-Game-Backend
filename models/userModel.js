const { Schema } = require('mongoose');
const connection = require('../configs/database');

const { scoreSchema } = require('./nested-user-schemas');

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    score: scoreSchema
})

const User = connection.model('users', userSchema);

module.exports = User;