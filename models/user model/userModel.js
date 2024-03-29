const { Schema, model } = require('mongoose');
const connection = require('../../configs/database');

const { scoreSchema } = require('./embedded-user-schemas');

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    score: scoreSchema,
})

const User = model('users', userSchema);

module.exports = User;