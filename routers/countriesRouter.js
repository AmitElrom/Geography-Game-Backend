const express = require('express');
const router = express.Router();

const { getMeRandomElements } = require('../utils/utils-general')

const { countries } = require('../countries.json');

router.route('/')
    .get((req, res) => {
        try {
            const minknown = +req.query.minknown;
            const maxknown = +req.query.maxknown;
            const questionsQuantity = +req.query['questions-quantity'];

            const allCountries = [...countries];
            let finalCountries;

            if (maxknown >= minknown) {
                const potentialTrueCountries = allCountries.filter(country => {
                    return country.flagKnown >= +minknown && country.flagKnown <= +maxknown
                })
                const potentialFalseCountries = allCountries.filter(country => {
                    return !(country.flagKnown >= +minknown && country.flagKnown <= +maxknown)
                })
                finalCountries = {
                    potentialTrueCountries,
                    potentialFalseCountries
                }
            }
            else if (minknown > maxknown) {
                res.status(400).json({
                    error: `definitional error - maxKnown must be bigger or equal to minKnown`
                })
                return
            }
            else if (minknown && !maxknown) {
                const potentialTrueCountries = allCountries.filter(country => {
                    return country.flagKnown >= +minknown
                })
                const potentialFalseCountries = allCountries.filter(country => {
                    return !(country.flagKnown >= +minknown)
                })
                finalCountries = {
                    potentialTrueCountries,
                    potentialFalseCountries
                }
            }
            else if (maxknown && !minknown) {
                const potentialTrueCountries = allCountries.filter(country => {
                    return country.flagKnown <= +maxknown
                })
                const potentialFalseCountries = allCountries.filter(country => {
                    return !(country.flagKnown <= +maxknown)
                })
                finalCountries = {
                    potentialTrueCountries,
                    potentialFalseCountries
                }
            }
            else {
                finalCountries = {
                    potentialTrueCountries: allCountries,
                    potentialFalseCountries: []
                }
            }
            // build questions

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

            // build every question
            const questions = [];
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
                // optional - splicing - causes false options are always different
                for (let i = 0; i < 3; i++) {
                    falseCountries.splice(falseCountriesIndexes[i], 1)
                }
                questions.push([trueCountries[i], ...questionFalseCountriesManipulated])
            }

            // return the questions array
            res.status(200).json(questions)

        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    })

module.exports = router;