const cors = require('cors');
const express = require('express');
const app = express();

const countriesRoute = require('./routers/countriesRouter');
const authRoute = require('./routers/authenticationRouter');

app.use(cors())
app.use(express.json())

app.use('/countries-elrom', countriesRoute)
app.use('/auth-elrom', authRoute)

app.listen(8000, () => {
    console.log('main is listening to port 8000');
})
