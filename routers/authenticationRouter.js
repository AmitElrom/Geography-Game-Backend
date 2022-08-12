const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();

const { User } = require('../models/models');

router.route('/')
    .get(async (req, res) => {
        try {
            await User.find({}, (err, data) => {
                if (error) {
                    console.log(error);
                } else {
                    res.json(data)
                }
            })
        } catch (error) {
            res.json({ error })
        }
    })

router.route('/sign-up')
    .post(async (req, res) => {
        try {
            let { email, firstName, lastName, password1, password2 } = req.body;

        } catch (error) {

        }
    })

router.route('/sign-in')
    .post((req, res) => {
        res.json('sign-in')
    })

module.exports = router;