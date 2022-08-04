// const axios = require('axios');

// const cors = require('cors');
const express = require('express');
const app = express();

// app.use(cors())
app.use(express.json())

const { countries } = require('./countries.json');

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

// app.get('/', async (req, res) => {
//     const newCountries = countries.map(country => {
//         return {
//             ...country,
//             funFact: ''
//         }
//     })
//     res.status(200).json(newCountries)
// })

// app.get('/', async (req, res) => {
//     const funFacts = countries.map(country => {
//         return country.funFact
//     })
//     let counter = 0;
//     funFacts.forEach(funFact => {
//         if (funFact !== "") {
//             counter++;
//         }
//     })
//     res.json({ counter })
// })

// app.get('/', async (req, res) => {
//     let longestName = '';
//     for (let i = 0; i < countries.length; i++) {
//         if (countries[i].name.length > longestName.length) {
//             longestName = countries[i].name;
//             console.log(longestName);
//         }
//     }
//     res.json({ longestName })
// })

app.get('/', async (req, res) => {
    countries.forEach(country => {
        if (country.funFact === '') {
            res.json(country.name)
        }
    })
})

// app.get('/', async (req, res) => {
//     const countriesWithFunFacts = [];
//     countries.filter(country => {
//         if (Array.isArray(country.funFact)) {
//             let countryFunFacts = {};
//             countryFunFacts[country.name] = country.funFact;
//             countriesWithFunFacts.push(countryFunFacts)
//         }
//     })
//     res.json(countriesWithFunFacts)
// })

// app.get('/', async (req, res) => {
//     let longestFunFact = '';
//     for (let i = 0; i < countries.length; i++) {
//         if (countries[i].funFact.length > longestFunFact.length) {
//             longestFunFact = countries[i].funFact;
//         }
//     }
//     res.json({ longestFunFact })
// })

// app.get('/', async (req, res) => {
//     res.json(countries.length)
// })


app.listen(7000, () => {
    console.log('server is listening to port 7000');
})