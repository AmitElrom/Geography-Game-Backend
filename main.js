require('dotenv').config();

require('./configs/database');

const cors = require('cors');
const express = require('express');

const countriesRouter = require('./routers/countries router/countriesRouter');
const authRouter = require('./routers/authentication router/authenticationRouter');
const scoreRouter = require('./routers/score router/scoreRouter');
const badgesRouter = require('./routers/badges router/badgesRouter');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth-elrom', authRouter);
app.use('/countries-elrom', countriesRouter);
app.use('/score-elrom', scoreRouter);
app.use('/badges-elrom', badgesRouter);

app.listen(process.env.PORT, () => {
    console.log('main is listening to port');
});
