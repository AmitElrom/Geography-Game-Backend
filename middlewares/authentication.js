require('dotenv').config();
const { verify } = require('jsonwebtoken');
const { createTransport } = require('nodemailer');
const router = require('../routers/authenticationRouter');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const authToken = authHeader && authHeader.split(' ')[1];
        // check if there is a token
        if (authToken) {
            // check if the token is the same token saved in env file
            verify(authToken, process.env.ACCESS_TOKEN_KEY, (err, user) => {
                if (err) {
                    res.status(403).json({ error: 'Error - wrong token - user is not authorized.', status: '403' })
                } else {
                    req.user = user;
                    next()
                }
            });
        } else {
            res.status(401).json({ error: 'Error - no token - user is not authorized.', status: '401' })
        }
    } catch (error) {
        res.status(401).json({ error })
    }
}

const sendEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

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

        const mailOptions = {
            from: 'amitelrom99@gmail.com',
            to: 'amitelrom99@gmail.com',
            subject: 'Testing',
            text: 'First emaul send from Nodejs using Nodemailer'
        };

        const successInfo = await transporter.sendMail(mailOptions)
        req.sendEmailRes = successInfo;
        next();

    } catch (error) {
        res.status(400).json({ error });
    }
};


module.exports = { authenticateToken, sendEmail };