const { connect } = require('mongoose');

connect(process.env.DB_URL).then(data => console.log(data)).catch(error => console.log(error));

