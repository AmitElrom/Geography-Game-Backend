const { createConnection } = require('mongoose');

const connection = createConnection('mongodb://localhost:27017/geoGameDB')

module.exports = connection;