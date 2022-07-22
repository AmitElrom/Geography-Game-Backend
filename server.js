// const axios = require('axios');

// const cors = require('cors');
// const express = require('express');
// const app = express();

// app.use(cors())
// app.use(express.json())

// // app.get('/', async (req, res) => {
// //     const { data: countriesElrom } = await axios.default.get('http://localhost:8000/countries-elrom');
// //     const { data: countriesAPI } = await axios.default.get('https://restcountries.com/v2/all?fields=numericCode,flag');
// //     const newCountries = countriesElrom.map(country => {
// //         const countryAPI = countriesAPI.find(x => x.flag === country.flag);
// //         if (countryAPI !== null) {
// //             return {
// //                 ...country,
// //                 id: countryAPI.numericCode
// //             }
// //         }
// //     })
// //     res.json(newCountries)
// // })

// app.get('/', async (req, res) => {
//     const { data: countriesElrom } = await axios.default.get('http://localhost:8000/countries-elrom');
//     const newCountries = countriesElrom.map(country => {
//         return {
//             ...country,
//             similarity: {
//                 similarity1: [],
//                 similarity2: []
//             }
//         }
//     })
//     res.json(newCountries)
// })

// app.listen(7000, () => {
//     console.log('server is listening to port 7000');
// })