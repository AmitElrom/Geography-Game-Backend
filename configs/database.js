const { connect } = require('mongoose');

async () => {
    try {
        connect(process.env.DB_URL);
    } catch (error) {
        console.log(error);
    }
}

