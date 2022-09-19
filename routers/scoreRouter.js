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
            startTime,
            endTime,
            totalScore,
            questions
        } = req.body;


    })


module.exports = router;