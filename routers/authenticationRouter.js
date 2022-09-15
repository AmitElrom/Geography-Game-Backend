require('dotenv').config()
const { genSalt, hash, compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const { User } = require('../models/models');
const { authenticateToken } = require('../middlewares/authentication');

router.route('/')
    .get(authenticateToken, async (req, res) => {
        const user = await User.findOne({ email: req.user.email });
        res.json(user.firstName + ' ' + user.lastName + ' is connected.')
    })

router.route('/check-sign-in')
    .post(authenticateToken, async (req, res) => {
        const user = await User.findOne({ email: req.user.email });
        const { email, firstName, lastName } = user;
        res.json({
            status: `${user.firstName} ${user.lastName} is connected`,
            user: {
                email,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`
            }
        })
    })

router.route('/sign-up')
    .post(async (req, res) => {
        try {
            const { email, firstName, lastName, password1, password2 } = req.body;
            if (email && firstName && lastName && password1 && password2) {
                const existedUser = await User.findOne({ email });
                if (!existedUser) {
                    if (password1 === password2) {
                        let salt = await genSalt(10);
                        let hashedPassword = await hash(password1, salt);

                        const newUser = await User.create({
                            firstName,
                            lastName,
                            email,
                            password: hashedPassword
                        })

                        const token = sign({ email: newUser.email }, process.env.ACCESS_TOKEN_KEY);

                        res.status(201).json({
                            message: `Success message - a user with the email of ${email} was added.`,
                            userData: {
                                email,
                                firstName,
                                lastName,
                                fullName: `${newUser.firstName} ${newUser.lastName}`,
                            },
                            token,
                        })
                    } else {
                        res.status(400).json({ error: "Error - passwords don't match." })
                    }
                } else {
                    res.status(400).json({ error: `Error - a user with an email of ${email} already exists.` })
                }
            } else {
                const reqBody = { email, firstName, lastName, password1, password2 };
                const missingFields = [];
                for (const prop in reqBody) {
                    if (!reqBody[prop]) {
                        missingFields.push(prop);
                    }
                }
                let auxiliaryVerb1 = missingFields.length === 1 ? ' a' : '';
                let auxiliaryVerb2 = missingFields.length === 1 ? '' : 's';
                let missingFieldsStr = missingFields.join(', ');
                res.status(400).json({ error: `Error - new user has${auxiliaryVerb1} missing field${auxiliaryVerb2} - ${missingFieldsStr}.` })
            }
        } catch (error) {
            res.status(500).json({ error })
        }
    })

router.route('/sign-in')
    .post(async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                // check id user with particular email exists
                const existedUser = await User.findOne({ email });
                if (existedUser) {
                    const { email, firstName, lastName, _id } = existedUser;
                    const userData = { email, firstName, lastName, fullName: `${firstName} ${lastName}` };
                    let isMatch = await compare(password, existedUser.password);
                    if (isMatch) {
                        const userDataToToken = { email, _id };
                        const token = sign(userDataToToken, process.env.ACCESS_TOKEN_KEY);
                        res.status(200).json({
                            message: `Success - user with email ${email} logged in successfully`,
                            userData,
                            token
                        })
                    } else {
                        res.status(403).json({ error: `Error - wrong password`, status: '403' })
                    }
                } else {
                    res.status(403).json({ error: `Error - a user with an email of ${email} is not exists.`, status: '403' })
                }
            } else {
                const reqBody = { email, password };
                const missingFields = [];
                for (const prop in reqBody) {
                    if (!reqBody[prop]) {
                        missingFields.push(prop)
                    }
                }
                let auxiliaryVerb1 = missingFields.length === 1 ? ' a' : '';
                let auxiliaryVerb2 = missingFields.length === 1 ? '' : 's';
                let missingFieldsStr = missingFields.join(', ');
                res.status(400).json({ error: `Error - user has${auxiliaryVerb1} missing field${auxiliaryVerb2} - ${missingFieldsStr}.` })
            }
        } catch (error) {
            res.status(401).json({ error })
        }
    })

router.route('/')
    .put(authenticateToken, async (req, res) => {
        try {
            const { firstName, lastName, email } = req.body;
            const { _id } = req.user;

            const query = { _id };
            const update = {
                firstName,
                lastName,
                email
            };
            const option = { new: true }
            const updatedUser = await User.findOneAndUpdate(query, update, option);
            const updatedUserToClient = {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email
            }
            res.status(200).json(updatedUserToClient)
        } catch (error) {
            res.status(400).json({ error })
        }

    })

router.route('/forgot-password')
    .post(async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                res.status(200).json({ message: "User doesn't exist" });
            } else {

            }
        } catch (error) {
            res.status(400).json({ error });
        }
    })

module.exports = router;