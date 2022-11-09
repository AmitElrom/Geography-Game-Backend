const express = require('express');
const router = express.Router();

const User = require('../models/userModel');

const { authenticateToken } = require('../middlewares/authentication');
const { findOne } = require('../models/userModel');


router.route('/')
    .patch(authenticateToken, async (req, res) => {

        // expected variables : 
        // level => beginner/ amateur/ medium/ hard/ expert : String
        // totalScore (game) : Number
        // Array of questions => every item in the array is an object with the fields => 
        // => isCorrect : Boolean, trueCountry : String, falseCountry : String || Undefined

        const {
            level,
            startTime,
            endTime,
            score,
            questions,
        } = req.body;

        const { _id } = req.user;

        const user = await User.findOne({ _id });
        if (user) {

            let newTotalScore = +score + (user.score ? +user?.score[level]?.totalScore : 0);
            const newGame = { totalScore: score, startTime, endTime, questions };

            const update = await User.updateOne({ _id }, {
                score: {
                    ...user.score._doc,
                    [level]: {
                        totalScore: newTotalScore,
                        games: [...user.score[level].games, newGame]
                    }
                }
            });

            res.status(200).json(update);
        }

    })

router.route('/')
    .get(authenticateToken, async (req, res) => {
        try {
            const { _id } = req.user;
            const users = await User.find({});

            const transformedUsers = users.map(user => {
                if (user._id.toString() === _id) {
                    return {
                        userDetails: {
                            userId: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                        userScore: {
                            beginner: user.score.beginner.games ? user.score.beginner.totalScore / user.score.beginner.games.length : 0,
                            amateur: user.score.amateur.games ? user.score.amateur.totalScore / user.score.amateur.games.length : 0,
                            medium: user.score.medium.games ? user.score.medium.totalScore / user.score.medium.games.length : 0,
                            hard: user.score.hard.games ? user.score.hard.totalScore / user.score.hard.games.length : 0,
                            expert: user.score.expert.games ? user.score.expert.totalScore / user.score.expert.games.length : 0,
                        },
                        theUser: true
                    }
                } else {
                    return {
                        userDetails: {
                            userId: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                        userScore: {
                            beginner: user.score.beginner.games ? (user.score.beginner.totalScore / user.score.beginner.games.length) : 0,
                            amateur: user.score.amateur.games ? (user.score.amateur.totalScore / user.score.amateur.games.length) : 0,
                            medium: user.score.medium.games ? (user.score.medium.totalScore / user.score.medium.games.length) : 0,
                            hard: user.score.hard.games ? (user.score.hard.totalScore / user.score.hard.games.length) : 0,
                            expert: user.score.expert.games ? (user.score.expert.totalScore / user.score.expert.games.length) : 0,
                        }
                    }
                }
            })

            console.log(transformedUsers);
            res.status(200).json(transformedUsers);

        } catch (error) {
            res.status(403).json({ error });
        }
    })


module.exports = router;