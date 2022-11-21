require('dotenv').config();

require('./configs/database');

const cors = require('cors');
const express = require('express');

const countriesRouter = require('./routers/countriesRouter');
const authRouter = require('./routers/authenticationRouter');
const scoreRouter = require('./routers/scoreRouter');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth-elrom', authRouter);
app.use('/countries-elrom', countriesRouter);
app.use('/score-elrom', scoreRouter);

app.listen(8000, () => {
    console.log('main is listening to port 8000');
});
