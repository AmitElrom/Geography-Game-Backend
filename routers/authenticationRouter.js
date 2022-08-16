const { genSalt, hash, compare } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const { User } = require('../models/models');

router.route('/')
    .get(async (req, res) => {
        try {
            const users = await User.find({})
            res.status(200).json(users)
        } catch (err) {
            res.status(400).json(err)
        }
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
                        res.status(201).json({
                            message: `Success message - a user with the email of ${email} was added.`,
                            newUser
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
                let missingFieldsStr = '';
                for (const prop in reqBody) {
                    if (!reqBody[prop]) {
                        missingFields.push(prop);
                    }
                }
                let auxiliaryVerb1 = missingFields.length === 1 ? ' a' : '';
                let auxiliaryVerb2 = missingFields.length === 1 ? '' : 's';
                missingFieldsStr = missingFields.join(', ');
                res.status(400).json({ error: `Error - new user has${auxiliaryVerb1} missing field${auxiliaryVerb2} - ${missingFieldsStr}.` })
            }
        } catch (error) {
            res.status(500).json({ error })
        }
    })

router.route('/sign-in')
    .post(async (req, res) => {
        const { email, password } = req.body;
        // check id user with particulat email exists
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            let isMatch = await compare(password, existedUser.password);
            if (isMatch) {

            } else {
                res.status(403).json({ error: `Error - wrong password` })
            }
        } else {
            res.status(403).json({ error: `Error - a user with an email of ${email} is not exists.` })
        }
    })

module.exports = router;