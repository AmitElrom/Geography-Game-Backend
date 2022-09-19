const express = require('express');
const router = express.Router();

const User = require('../models/userModel');

const { authenticateToken } = require('../middlewares/authentication');


router.route('/')
    .put(authenticateToken, async (req, res) => {
        const { isCorrect,
            trueCountry,
            falseCountry,
            startTime,
            endTime } = req.body;

        console.log({
            isCorrect,
            trueCountry,
            falseCountry,
            startTime,
            endTime
        });
    })


module.exports = router;