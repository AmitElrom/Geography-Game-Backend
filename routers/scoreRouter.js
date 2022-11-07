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
            const user = await User.findOne({ _id });
            if (user) {
                res.status(200).json({ score: user.score });
            } else {
                res.status(400).json({ error: 'user does not exist.' })
            }
        } catch (error) {
            res.status(403).json({ error });
        }
    })


module.exports = router;