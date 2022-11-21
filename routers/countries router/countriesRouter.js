const express = require('express');

const { countries } = require('../../countries.json');

const { getMeRandomElements, getMeRandomElement } = require('../../utils/utils-general')

const router = express.Router();

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


                    // every country object has field named 'similarities'.
                    // 'similarities' holds an object with 2 fields - 'similarity1' and 'similarity2'.
                    // each of those fields holds an array with the id's field of countries that their flag is similar to the particular country's flag.
                    // 'similarity1' represents the id's field of the countries which their flags are the most similar to the country's flag.
                    // 'similarity2' represents the id's field of the countries which their flags are similar to the country's flag, but not the most similar.
                    if (similarities) {
                        // similarities === 1 
                        // choosing as a false country option - one country's id field from both 'similarities'' object fields - 'similarity1' and 'similarity2'
                        if (similarities === 1) {
                            for (let i = 0; i < trueCountries.length; i++) {
                                const trueCountry = trueCountries[i];
                                let questionFalseCountries;

                                if (trueCountry.similarity.similarity1.length > 0) {
                                    console.log('similarities === 1 - 1');
                                    const similarities = [...trueCountry.similarity.similarity1, ...trueCountry.similarity.similarity2];
                                    // select randomly a country with a flag that similars to true country's flag to be a false country of the question
                                    let similarFalseCountryId = getMeRandomElement(similarities);
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
                                    console.log('similarities === 1 - 0');
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
                        // similarities === 2
                        // choosing as a false country option - one country's id field from 'similarities'' object field - 'similarity1'
                        // choosing as an other false country option -  one country's id field from both 'similarities'' object fields - 'similarity1' and 'similarity2'
                        // not including the first chosen false country option
                        // this guarantees an a harder false option (from the most similar flags 'similarity1') and an other options (total of 2).
                        else if (similarities === 2) {
                            for (let i = 0; i < trueCountries.length; i++) {
                                const trueCountry = trueCountries[i];
                                let questionFalseCountries;

                                if (trueCountry.similarity.similarity1.length > 0) {
                                    // select randomly a country with a flag that similars to true country's flag (from 'similarity1') to be a false country of the question
                                    let similarFirstFalseCountryId = getMeRandomElement(trueCountry.similarity.similarity1);
                                    // find the country with the 'similarFirstFalseCountryId'
                                    const similarFirstFalseCountry = countries.find(country => country.id === similarFirstFalseCountryId);
                                    // accessing the 'trueCountry.similarity.similarity1' array without 'similarFirstFalseCountryId'
                                    const similarity1WithoutSimilarFalseCountryId = trueCountry.similarity.similarity1.filter(countryId => countryId !== similarFirstFalseCountryId);
                                    // checking if 'similarity1WithoutSimilarFalseCountryId' array has items - countries id's fields
                                    if (similarity1WithoutSimilarFalseCountryId.length > 0) {
                                        console.log('similarities === 2 - ' + 2);
                                        // combining the array's items (countries id's fields) of 'trueCountry.similarity.similarity2' with the items' (countries id's fields) array of  'similarity1WithoutSimilarFalseCountryId'
                                        const similarities = [...similarity1WithoutSimilarFalseCountryId, ...trueCountry.similarity.similarity2];
                                        // select randomly a country with a flag that similars to true country's flag (from 'similarity1' and 'similarity2' besides 'similarFalseCountryId') to be a false country of the question
                                        let similarSecondFalseCountryId = getMeRandomElement(similarities);
                                        // creating an array of the countries with chosen ids above
                                        const similarFalseCountries = countries.filter(country => country.id === similarFirstFalseCountryId || country.id === similarSecondFalseCountryId);
                                        // filtering the falseCountries array from the items (countries) that holds the id field with countries' ids randomly chosen above 
                                        const falseCountriesWithoutsimilarFalseCountries = falseCountries.filter(country => country.id !== similarFirstFalseCountryId || country.id !== similarSecondFalseCountryId);
                                        // select randomly 1 country to be a false country in the question
                                        const thirdFalseCountry = getMeRandomElement(falseCountriesWithoutsimilarFalseCountries);
                                        questionFalseCountries = [...similarFalseCountries, thirdFalseCountry];
                                    } else {
                                        console.log('similarities === 2 - ' + 1);
                                        let falseCountriesWithoutsimilarFalseCountry = countries.filter(country => country.id !== similarity1WithoutSimilarFalseCountryId);
                                        // select randomly 2 countries to be the false countries of the question
                                        const {
                                            trueArray: question2FalseCountries
                                        } = getMeRandomElements(falseCountriesWithoutsimilarFalseCountry, 2);

                                        questionFalseCountries = [...question2FalseCountries, similarFirstFalseCountry];
                                    }
                                } else {
                                    console.log('similarities === 2 - ' + 0);
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