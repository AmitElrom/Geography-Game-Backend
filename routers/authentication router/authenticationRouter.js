const { genSalt, hash, compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const { createTransport } = require('nodemailer');
const express = require('express');

const { User } = require('../../models/models');

const { authenticateTokenMW } = require('../../middlewares/authentication/authenticate-token');

const { generateVerificationCode } = require('../../utils/utils-create');

const router = express.Router();


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
                            password: hashedPassword,
                            score: {
                                beginner: {
                                    totalScore: 0,
                                    games: []
                                },
                                amateur: {
                                    totalScore: 0,
                                    games: []
                                },
                                medium: {
                                    totalScore: 0,
                                    games: []
                                },
                                hard: {
                                    totalScore: 0,
                                    games: []
                                },
                                expert: {
                                    totalScore: 0,
                                    games: []
                                },
                            }
                        })

                        const userDataToToken = { email: newUser.email, _id: newUser._id };
                        const token = sign(userDataToToken, process.env.ACCESS_TOKEN_KEY);

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
                        res.status(400).json({ error: "Error - passwords don't match" })
                    }
                } else {
                    res.status(400).json({ error: `Error - a user with an email of ${email} already exists` })
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
                res.status(400).json({ error: `Error - new user has${auxiliaryVerb1} missing field${auxiliaryVerb2} - ${missingFieldsStr}` })
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
                    const levels = ['beginner', 'amateur', 'medium', 'hard', 'expert'];
                    const levelsLastGames = levels.map(level => {
                        return {
                            level,
                            levelLastGameEndTime: existedUser.score[level].games[existedUser.score[level].games.length - 1].endTime
                        }
                    });
                    let maxEndTime = Math.max(...levelsLastGames.map(x => x.levelLastGameEndTime));
                    const { level } = levelsLastGames.find(levelLastGame => levelLastGame.levelLastGameEndTime === maxEndTime);

                    const userData = { email, firstName, lastName, fullName: `${firstName} ${lastName}`, lastMatchLevel: level };
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
                        res.status(403).json({ error: `Error - wrong password` })
                    }
                } else {
                    res.status(403).json({ error: `Error - a user with an email of ${email} does not exist` })
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
                res.status(400).json({ error: `Error - user has${auxiliaryVerb1} missing field${auxiliaryVerb2} - ${missingFieldsStr}` })
            }
        } catch (error) {
            res.status(401).json({ error })
        }
    })

router.route('/')
    .put(authenticateTokenMW, async (req, res) => {
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

router.route('/change-password')
    .put(authenticateTokenMW, async (req, res) => {
        try {
            const { newPassword, confirmedPassword } = req.body;
            const { _id } = req.user;
            if (newPassword === confirmedPassword) {
                let salt = await genSalt(10);
                let hashedPassword = await hash(newPassword, salt);
                const query = { _id };
                const update = {
                    password: hashedPassword
                };
                const updatedUser = await User.findOneAndUpdate(query, update);

                const { email, firstName, lastName } = updatedUser;
                const userData = { email, firstName, lastName, fullName: `${firstName} ${lastName}` };

                res.status(200).json({
                    message: `User with email ${email} changed password successfully.`,
                    userData
                })
            } else {
                res.status(400).json({ error: 'Passwords do not match' })
            }
        } catch (error) {
            res.status(400).json({ error })
        }
    })

let emailCode = '';
router.route('/forgot-password')
    .post(async (req, res) => {
        try {
            const { email } = req.body;

            // check if user with that email exists
            const existedUser = await User.findOne({ email });

            if (existedUser) {
                const transporter = createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'amitelrom99@gmail.com',
                        pass: process.env.EMAIL_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                emailCode = generateVerificationCode(6);

                const mailOptions = {
                    from: 'amitelrom99@gmail.com',
                    to: email,
                    subject: 'Geography Game - Verification Code',
                    text: emailCode
                };

                const successInfo = await transporter.sendMail(mailOptions);

                res.status(200).json({ message: `Verification code was sent to ${successInfo.accepted[0]}` });
            } else {
                res.status(404).json({ error: "User doesn't exist" });
            }
        } catch (error) {
            res.status(400).json({ error });
        }
    })

router.route('/verify-code')
    .post(async (req, res) => {
        try {
            // pending - make sure email is on session storage and sent via client
            const { code, email } = req.body;

            const existedUser = await User.findOne({ email });
            let _id = existedUser._id;

            if (code === emailCode) {
                // create token
                const userDataToToken = { email, _id };
                const token = sign(userDataToToken, process.env.ACCESS_TOKEN_KEY);

                res.status(200).json({ token });
            } else {
                res.status(401).json({ error: "User is unauthorized" });
            }
        } catch (error) {
            res.status(400).json({ error });
        }
    })


module.exports = router;