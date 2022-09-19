require('./configs/database')

const cors = require('cors');
const express = require('express');
const app = express();

const countriesRoute = require('./routers/countriesRouter');
const authRoute = require('./routers/authenticationRouter');
const scoreRoute = require('./routers/scoreRouter');

app.use(cors())
app.use(express.json())

app.use('/auth-elrom', authRoute)
app.use('/countries-elrom', countriesRoute)
app.use('/score-elrom', scoreRoute)

app.listen(8000, () => {
    console.log('main is listening to port 8000');
})
