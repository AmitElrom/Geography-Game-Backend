// const axios = require('axios');

const cors = require('cors');
const express = require('express');
const app = express();

const countriesRouter = require('./routers/countriesRouter');

app.use(cors())
app.use(express.json())

app.use('/countries-elrom', countriesRouter)

// using axios to get data from countries rest api and manipulate it 

// app.get('/', async (req, res) => {
//     const { data: countries } = await axios.default.get('https://restcountries.com/v2/all?fields=name,flag')
//     const newCountries = countries.filter
//      (country => !country.name.toLowerCase().includes('palestine')).map(country => {
//         return {
//             name: country.name,
//             flag: country.flag,
//             flagKnown: 0
//             id: country.numericCode
//         }
//     })
//     res.json(newCountries)
// })

app.listen(8000, () => {
    console.log('main is listening to port 8000');
})
