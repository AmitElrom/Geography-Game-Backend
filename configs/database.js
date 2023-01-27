const { connect } = require('mongoose');

connect(process.env.DB_URL).then(data => console.log("server connected to database successfully")).catch(error => console.log(error));

