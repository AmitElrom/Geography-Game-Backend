const { verify } = require('jsonwebtoken');

const authenticateTokenMW = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const authToken = authHeader?.split(' ')[1];
        // check if there is a token
        if (!authToken) {
            res.status(401).json({ error: 'Error - no token - user is not authorized.', status: '401' })
        } else {
            // check if the token is the same token saved in env file
            verify(authToken, process.env.ACCESS_TOKEN_KEY, (err, user) => {
                if (err) {
                    res.status(403).json({ error: 'Error - wrong token - user is not authorized.', status: '403' })
                } else {
                    req.user = user;
                    next()
                }
            });
        }
    } catch (error) {
        res.status(401).json({ error })
    }
}


module.exports = { authenticateTokenMW };