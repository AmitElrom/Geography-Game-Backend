const express = require('express');
const router = express.Router();

const { getMeRandomElements, getMeRandomElement } = require('../utils/utils-general')

const { countries } = require('../countries.json');

// router.route('/')
//     .get((req, res) => {
//         try {
//             const minknown = +req.query.minknown;
//             const maxknown = +req.query.maxknown;
//             const questionsQuantity = +req.query['questions-quantity'];
//             let similarities = +req.query.similarities;

//             const allCountries = [...countries];
//             let finalCountries;

//             if (maxknown >= minknown) {
//                 const potentialTrueCountries = allCountries.filter(country => {
//                     return country.flagKnown >= +minknown && country.flagKnown <= +maxknown
//                 })
//                 const potentialFalseCountries = allCountries.filter(country => {
//                     return !(country.flagKnown >= +minknown && country.flagKnown <= +maxknown)
//                 })
//                 finalCountries = {
//                     potentialTrueCountries,
//                     potentialFalseCountries
//                 }
//             }
//             else if (minknown > maxknown) {
//                 res.status(400).json({
//                     error: `definitional error - maxKnown must be bigger or equal to minKnown`
//                 })
//                 return
//             }
//             else if (minknown && !maxknown) {
//                 const potentialTrueCountries = allCountries.filter(country => {
//                     return country.flagKnown >= +minknown
//                 })
//                 const potentialFalseCountries = allCountries.filter(country => {
//                     return !(country.flagKnown >= +minknown)
//                 })
//                 finalCountries = {
//                     potentialTrueCountries,
//                     potentialFalseCountries
//                 }
//             }
//             else if (maxknown && !minknown) {
//                 const potentialTrueCountries = allCountries.filter(country => {
//                     return country.flagKnown <= +maxknown
//                 })
//                 const potentialFalseCountries = allCountries.filter(country => {
//                     return !(country.flagKnown <= +maxknown)
//                 })
//                 finalCountries = {
//                     potentialTrueCountries,
//                     potentialFalseCountries
//                 }
//             }
//             else {
//                 finalCountries = {
//                     potentialTrueCountries: allCountries,
//                     potentialFalseCountries: []
//                 }
//             }
//             // build questions

//             // select randomly the true countries (array of countries objects)
//             const { trueArray: chosenTrueCountries, falseArray: chosenFalseCountries } = getMeRandomElements(finalCountries.potentialTrueCountries, questionsQuantity);
//             const trueCountries = chosenTrueCountries.map(country => {
//                 return {
//                     ...country,
//                     isCountry: true
//                 }
//             })

//             // build the false countries (array of countries objects)
//             const preFalseCountries = finalCountries.potentialFalseCountries.concat(...chosenFalseCountries)
//             const falseCountries = preFalseCountries.map(country => {
//                 return {
//                     ...country,
//                     isCountry: false
//                 }
//             })

//             // build every question
//             const questions = [];
//             for (let i = 0; i < trueCountries.length; i++) {
//                 const {
//                     trueArray: questionFalseCountries,
//                     trueIndexes: falseCountriesIndexes
//                 } = getMeRandomElements(falseCountries, 3)
//                 const questionFalseCountriesManipulated = questionFalseCountries.map(country => {
//                     return {
//                         name: country.name,
//                         id: country.id,
//                         flag: country.flag,
//                         isCountry: country.isCountry
//                     }
//                 })
//                 // optional - splicing - causes false options are always different
//                 for (let i = 0; i < 3; i++) {
//                     falseCountries.splice(falseCountriesIndexes[i], 1)
//                 }
//                 questions.push([trueCountries[i], ...questionFalseCountriesManipulated])
//             }

//             // return the questions array
//             res.status(200).json(questions)

//         } catch (error) {
//             res.status(400).json({
//                 error: error.message
//             })
//         }
//     })

router.route('/')
    .get((req, res) => {
        try {
            const minknown = req.query.minknown ? +req.query.minknown : 1;
            const maxknown = req.query.maxknown ? +req.query.maxknown : 197;
            const questionsQuantity = +req.query['questions-quantity'];
            let similarities = +req.query.similarities;

            const allCountries = [...countries];
            let finalCountries;

            if (questionsQuantity) {
                if (maxknown >= minknown) {

                    const questions = [];

                    const potentialTrueCountries = allCountries.filter(country => {
                        return country.flagKnown >= minknown && country.flagKnown <= maxknown
                    })
                    const potentialFalseCountries = allCountries.filter(country => {
                        return !(country.flagKnown >= minknown && country.flagKnown <= maxknown)
                    })
                    finalCountries = {
                        potentialTrueCountries,
                        potentialFalseCountries
                    }

                    // select randomly the true countries (array of countries objects)
                    const { trueArray: chosenTrueCountries, falseArray: chosenFalseCountries } = getMeRandomElements(finalCountries.potentialTrueCountries, questionsQuantity);
                    const trueCountries = chosenTrueCountries.map(country => {
                        return {
                            ...country,
                            isCountry: true
                        }
                    })

                    // build the false countries (array of countries objects)
                    const preFalseCountries = finalCountries.potentialFalseCountries.concat(...chosenFalseCountries)
                    const falseCountries = preFalseCountries.map(country => {
                        return {
                            ...country,
                            isCountry: false
                        }
                    })


                    if (similarities) {
                        if (similarities === 1) {
                            for (let i = 0; i < trueCountries.length; i++) {
                                const trueCountry = trueCountries[i];
                                let questionFalseCountries;

                                if (trueCountry.similarity.similarity1.length > 0) {
                                    // select randomly a country with a flag that similars to true country's flag to be a false country of the question
                                    let similarFalseCountryId = getMeRandomElement(trueCountry.similarity.similarity1);
                                    // find the country with the 'similarFalseCountryId'
                                    const similarFalseCountry = countries.find(country => country.id === similarFalseCountryId);
                                    // create a new array of the 'falseCountries' without 'similarFalseCountry' - in order to prevent a repeatition of the same false country
                                    const falseCountriesWithoutsimilarFalseCountry = falseCountries.filter(country => country.id !== similarFalseCountryId);
                                    // select randomly 2 countries to be the false countries of the question
                                    const {
                                        trueArray: question2FalseCountries
                                    } = getMeRandomElements(falseCountriesWithoutsimilarFalseCountry, 2);

                                    questionFalseCountries = [...question2FalseCountries, similarFalseCountry];

                                } else {
                                    const {
                                        trueArray: question3FalseCountries
                                    } = getMeRandomElements(falseCountries, 3);

                                    questionFalseCountries = [...question3FalseCountries];
                                }
                                const questionFalseCountriesManipulated = questionFalseCountries.map(country => {
                                    return {
                                        name: country.name,
                                        id: country.id,
                                        flag: country.flag,
                                        isCountry: false
                                    }
                                })

                                questions.push([trueCountry, ...questionFalseCountriesManipulated])
                            }
                        }
                        else if (similarities === 2) {
                            for (let i = 0; i < trueCountries.length; i++) {
                                const trueCountry = trueCountries[i];
                                let questionFalseCountries;

                                if (trueCountry.similarity.similarity1.length > 0) {
                                    console.log('yes');
                                    // select randomly a country with a flag that similars to true country's flag (from 'similarity1') to be a false country of the question
                                    let similarFirstFalseCountryId = getMeRandomElement(trueCountry.similarity.similarity1);
                                    // select randomly a country with a flag that similars to true country's flag (from 'similarity1' and 'similarity1' besides 'similarFalseCountryId') to be a false country of the question
                                    // const similarity1Arr = [...trueCountry.similarity.similarity1];
                                    const similarity1WithoutSimilarFalseCountryId = trueCountry.similarity.similarity1.filter(countryId => countryId !== similarFirstFalseCountryId);
                                    let falseCountriesWithoutsimilarFalseCountries;
                                    if (similarity1WithoutSimilarFalseCountryId.length > 0) {
                                        console.log(2);
                                        const similarities = [...similarity1WithoutSimilarFalseCountryId, ...trueCountry.similarity.similarity2];
                                        let similarSecondFalseCountryId = getMeRandomElement(similarities);
                                        const similarFalseCountries = countries.filter(country => country.id === similarFirstFalseCountryId || country.id === similarSecondFalseCountryId);
                                        falseCountriesWithoutsimilarFalseCountries = falseCountries.filter(country => country.id !== similarFirstFalseCountryId || country.id !== similarSecondFalseCountryId);
                                        // select randomly 2 countries to be the false countries of the question
                                        const thirdFalseCountry = getMeRandomElement(falseCountriesWithoutsimilarFalseCountries);
                                        questionFalseCountries = [...similarFalseCountries, thirdFalseCountry];
                                    } else {
                                        console.log(1);
                                        let falseCountriesWithoutsimilarFalseCountry = countries.filter(country => country.id !== similarity1WithoutSimilarFalseCountryId);
                                        // select randomly 2 countries to be the false countries of the question
                                        const {
                                            trueArray: question2FalseCountries
                                        } = getMeRandomElements(falseCountriesWithoutsimilarFalseCountry, 2);

                                        questionFalseCountries = [...question2FalseCountries, similarFalseCountry];
                                    }
                                } else {
                                    console.log(0);
                                    const {
                                        trueArray: question3FalseCountries
                                    } = getMeRandomElements(falseCountries, 3);

                                    questionFalseCountries = [...question3FalseCountries];
                                }

                                const questionFalseCountriesManipulated = questionFalseCountries.map(country => {
                                    return {
                                        name: country.name,
                                        id: country.id,
                                        flag: country.flag,
                                        isCountry: false
                                    }
                                })

                                questions.push([trueCountry, ...questionFalseCountriesManipulated])
                            }
                        }
                        // if - there similarities query parameter that is not equal to 1 or 2
                        else {
                            res.status(400).json({
                                error: "definitional error - 'similarities' must be equal to 1 or 2"
                            })
                        }
                    }
                    // if - there is not similarities query parameter
                    else {

                        // build every question
                        for (let i = 0; i < trueCountries.length; i++) {
                            const {
                                trueArray: questionFalseCountries,
                                trueIndexes: falseCountriesIndexes
                            } = getMeRandomElements(falseCountries, 3)
                            const questionFalseCountriesManipulated = questionFalseCountries.map(country => {
                                return {
                                    name: country.name,
                                    id: country.id,
                                    flag: country.flag,
                                    isCountry: country.isCountry
                                }
                            })
                            // optional - splicing - causes false options to be always different
                            for (let i = 0; i < 3; i++) {
                                falseCountries.splice(falseCountriesIndexes[i], 1)
                            }
                            questions.push([trueCountries[i], ...questionFalseCountriesManipulated])
                        }
                    }
                    res.status(200).json(questions)
                }
                // if - maxknown is smaller that minknown
                else {
                    res.status(400).json({
                        error: "definitional error - 'maxknown' must be bigger or equal to 'minknown'"
                    })
                    return
                }
            }
            // if - there is not questionsQuantity
            else {
                res.status(400).json({
                    error: "'questions-quantity' is a mandatory query parameter"
                })
                return
            }
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    })

module.exports = router;