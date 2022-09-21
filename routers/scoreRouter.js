const express = require('express');
const router = express.Router();

const User = require('../models/userModel');

const { authenticateToken } = require('../middlewares/authentication');


router.route('/')
    .put(authenticateToken, async (req, res) => {

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
            const newGames = user.score ? [...user?.score[level]?.games, newGame] : [newGame];

            const update = await User.updateOne({ _id }, {
                score: {
                    [level]: {
                        $push: {
                            games: newGame,
                        }
                    }
                }
            })

            res.status(200).json(update)
        }

    })


module.exports = router;