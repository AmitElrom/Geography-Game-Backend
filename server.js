// const axios = require('axios');

// const cors = require('cors');
const express = require('express');
const app = express();

// app.use(cors())
app.use(express.json())

const { countries } = require('./countries.json');

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
//     const funFacts = countries.map(country => {
//         return country.funFact
//     })
//     let counter = 0;
//     funFacts.forEach(funFact => {
//         if (funFact === "") {
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

// app.get('/', async (req, res) => {
//     let counter = 1;
//     countries.forEach(country => {
//         if (country.funFact === '') {
//             if (counter === 1) {
//                 res.json(country.name)
//             }
//             counter++;
//         } else {
//             res.json({ status: 'no more empty fun facts' })
//         }
//     })
// })

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

// app.get('/', async (req, res) => {
//     const countriesNoFunFacts = countries.filter(country => country.funFact === "")
//     let lastNoFunFactCountry = {
//         name: countriesNoFunFacts[countriesNoFunFacts.length - 1].name,
//         funFact: countriesNoFunFacts[countriesNoFunFacts.length - 1].funFact,
//     }
//     res.json(lastNoFunFactCountry)
// })

// app.get('/', async (req, res) => {
//     const newCountries = countries.map(country => {
//         if (Array.isArray(country.funFact)) {
//             return {
//                 name: country.name,
//                 flag: country.flag,
//                 flagKnown: country.flagKnown,
//                 id: country.id,
//                 similarity: country.similarity,
//                 funFact: {
//                     data: country.funFact,
//                     images: country.funFactImages ? country.funFactImages : [],
//                     mapLocationLink: ""
//                 }
//             }
//         } else {
//             return {
//                 name: country.name,
//                 flag: country.flag,
//                 flagKnown: country.flagKnown,
//                 id: country.id,
//                 similarity: country.similarity,
//                 funFact: {
//                     data: [country.funFact],
//                     images: country.funFactImages ? country.funFactImages : [],
//                     mapLocationLink: ""
//                 }
//             }
//         }
//     })
//     res.json(newCountries)
// })

// app.get('/', async (req, res) => {
//     res.json(countries)
// })

app.get('/', async (req, res) => {
    let number = +req.query.number;
    const country = countries.find(country => country.flagKnown === number)
    res.json(country)
})


app.listen(7000, () => {
    console.log('server is listening to port 7000');
})