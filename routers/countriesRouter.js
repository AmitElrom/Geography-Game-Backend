const express = require('express');
const router = express.Router();

const { countries } = require('../countries.json');

router.route('/')
    .get((req, res) => {
        try {
            const minknown = +req.query.minknown;
            const maxknown = +req.query.maxknown;

            const allCountries = [...countries];

            if (maxknown >= minknown) {
                const potentialTrueCountries = allCountries.filter(country => {
                    return country.flagKnown >= +minknown && country.flagKnown <= +maxknown
                })
                const potentialFalseCountries = allCountries.filter(country => {
                    return !(country.flagKnown >= +minknown && country.flagKnown <= +maxknown)
                })
                res.status(200).json({
                    potentialTrueCountries,
                    potentialFalseCountries
                })
                return
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
                res.status(200).json({
                    potentialTrueCountries,
                    potentialFalseCountries
                })
                return
            }
            else if (maxknown && !minknown) {
                const potentialTrueCountries = allCountries.filter(country => {
                    return country.flagKnown <= +maxknown
                })
                const potentialFalseCountries = allCountries.filter(country => {
                    return !(country.flagKnown <= +maxknown)
                })
                res.status(200).json({
                    potentialTrueCountries,
                    potentialFalseCountries
                })
                return
            }
            else {
                res.status(200).json({
                    potentialTrueCountries: allCountries,
                    potentialFalseCountries: []
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