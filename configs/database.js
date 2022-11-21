const { createConnection } = require('mongoose');

const connection = createConnection(process.env.DB_URL);

module.exports = connection;