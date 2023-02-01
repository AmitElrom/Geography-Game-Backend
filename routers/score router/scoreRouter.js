const { v4: uuidv4 } = require('uuid');
const express = require('express');

const User = require('../../models/user model/userModel');

const { countries } = require('../../countries.json');

const { authenticateTokenMW } = require('../../middlewares/authentication/authenticate-token');

const { isEqualObjects } = require('../../utils/utils-checks');
const { msToTime, capitalizeFirstLetter } = require('../../utils/utils-manipulate');

const router = express.Router();

router.route('/')
    .patch(authenticateTokenMW, async (req, res) => {

        try {
            // expected variables : 
            // level => beginner/ amateur/ medium/ hard/ expert : String
            // totalScore (game) : Number
            // transformedUsers of questions => every item in the transformedUsers is an object with the fields => 
            // => isCorrect : Boolean, trueCountry : String, falseCountry : String || Undefined

            const {
                level,
                startTime,
                endTime,
                score,
                questions,
            } = req.body;

            const { _id } = req.user;
            const user = await User.findOne({ _id });

            if (user) {

                let newTotalScore = +score + (user.score ? +user?.score[level]?.totalScore : 0);
                const newGame = { totalScore: score, startTime, endTime, questions };

                const update = await User.updateOne({ _id }, {
                    score: {
                        ...user.score._doc,
                        [level]: {
                            totalScore: newTotalScore,
                            games: [...user.score[level].games, newGame]
                        }
                    }
                });

                res.status(200).json(update);
            }
        } catch (error) {
            res.status(400).json({ error });
        }

    });

router.route('/')
    .get(authenticateTokenMW, async (req, res) => {
        try {
            const { _id } = req.user;
            const user = await User.findOne({ _id });

            const levels = ['beginner', 'amateur', 'medium', 'hard', 'expert'];
            const levelsWithHighestScoreGamesAndSmallestDuration = levels.map(level => {
                let largest = 0;
                user.score[level].games.forEach(game => {
                    if (game.totalScore > largest) {
                        largest = game.totalScore;
                    }
                })

                let smallestTime = user.score[level].games.length > 0 ? user.score[level].games[0].endTime - user.score[level].games[0].startTime : 0;
                user.score[level].games.length > 0 && user.score[level].games.forEach(game => {
                    if (game.endTime - game.startTime < smallestTime) {
                        smallestTime = game.endTime - game.startTime;
                    }
                })

                const levelHighestScoreGames = user.score[level].games
                    .filter(game => game.totalScore === largest)
                    .map(game => {

                        const options = {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        };

                        const date = new Date(game.endTime);

                        return {
                            id: uuidv4(),
                            score: game.totalScore,
                            duration: msToTime(game.endTime - game.startTime),
                            time: date.toLocaleDateString("en-US", options)
                        }
                    })

                const levelSmallestDurationGames = user.score[level].games ?
                    user.score[level].games.filter(game => game.endTime - game.startTime === smallestTime)
                        .map(game => {

                            const options = {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            };

                            const date = new Date(game.endTime);

                            return {
                                id: uuidv4(),
                                score: game.totalScore,
                                duration: msToTime(game.endTime - game.startTime),
                                time: date.toLocaleDateString("en-US", options)
                            }
                        }) : [];

                const allLevelFails = [];
                user.score[level].games.forEach(game => {
                    const gameFails = game.questions.filter(question => question.isCorrect === false).map(question => {
                        const { name: falseCountry, flag: falseCountryFlag } = countries.find(country => country.id === question.falseCountry);
                        const { name: trueCountry, flag: trueCountryFlag } = countries.find(country => country.id === question.trueCountry);
                        return {
                            falseCountry,
                            falseCountryId: question.falseCountry,
                            falseCountryFlag,
                            trueCountry,
                            trueCountryId: question.trueCountry,
                            trueCountryFlag,
                            _id: question._id,
                        }
                    });

                    allLevelFails.push(...gameFails);
                })
                const levelFails = [];
                allLevelFails.forEach(fail => {
                    const existingCountry = levelFails.find(item => item.countryId === fail.trueCountryId);
                    if (existingCountry) {
                        const existingFalseCountry = existingCountry.falseCountries.find(falseCountry => falseCountry.countryId === fail.falseCountryId);
                        if (existingFalseCountry) {
                            existingFalseCountry.numOfFails = existingFalseCountry.numOfFails + 1;
                        } else {
                            existingCountry.falseCountries.push({
                                id: uuidv4(),
                                countryId: fail.falseCountryId,
                                countryName: fail.falseCountry,
                                countryFlag: fail.falseCountryFlag,
                                numOfFails: 1,
                            });
                        }
                    } else {
                        levelFails.push({
                            countryId: fail.trueCountryId,
                            countryName: fail.trueCountry,
                            countryFlag: fail.trueCountryFlag,
                            falseCountries: [{
                                id: uuidv4(),
                                countryId: fail.falseCountryId,
                                countryName: fail.falseCountry,
                                countryFlag: fail.falseCountryFlag,
                                numOfFails: 1,
                            }]
                        });
                    }
                })

                const levelFailsWithNumOfFailsPerFail = levelFails.map(fail => {
                    let numOfFails = 0;
                    fail.falseCountries.forEach(falseCountry => {
                        numOfFails += falseCountry.numOfFails;
                    })

                    return {
                        ...fail,
                        numOfFails
                    }
                });

                return { levelHighestScoreGames, levelSmallestDurationGames, levelFails: levelFailsWithNumOfFailsPerFail };
            })

            const users = await User.find({});

            const transformedUsers = users.map(user => {
                if (user._id.toString() === _id) {
                    return {
                        userDetails: {
                            userId: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                        userScore: {
                            beginner: user.score.beginner.games.length > 0 ? (user.score.beginner.totalScore / user.score.beginner.games.length).toFixed(2) : 0,
                            amateur: user.score.amateur.games.length > 0 ? (user.score.amateur.totalScore / user.score.amateur.games.length).toFixed(2) : 0,
                            medium: user.score.medium.games.length > 0 ? (user.score.medium.totalScore / user.score.medium.games.length).toFixed(2) : 0,
                            hard: user.score.hard.games.length > 0 ? (user.score.hard.totalScore / user.score.hard.games.length).toFixed(2) : 0,
                            expert: user.score.expert.games.length > 0 ? (user.score.expert.totalScore / user.score.expert.games.length).toFixed(2) : 0,
                        },
                        userLevelsData: {
                            beginner: {
                                title: "Beginner",
                                averageScore: user.score.beginner.games.length > 0 ? (user.score.beginner.totalScore / user.score.beginner.games.length).toFixed(2) : 0,
                                totalScore: user.score.beginner.totalScore,
                                totalGames: user.score.beginner.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[0].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[0].levelSmallestDurationGames,
                                fails: levelsWithHighestScoreGamesAndSmallestDuration[0].levelFails,

                            },
                            amateur: {
                                title: "Amateur",
                                averageScore: user.score.amateur.games.length > 0 ? (user.score.amateur.totalScore / user.score.amateur.games.length).toFixed(2) : 0,
                                totalScore: user.score.amateur.totalScore,
                                totalGames: user.score.amateur.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[1].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[1].levelSmallestDurationGames,
                                fails: levelsWithHighestScoreGamesAndSmallestDuration[1].levelFails,

                            },
                            medium: {
                                title: "Medium",
                                averageScore: user.score.medium.games.length > 0 ? (user.score.medium.totalScore / user.score.medium.games.length).toFixed(2) : 0,
                                totalScore: user.score.medium.totalScore,
                                totalGames: user.score.medium.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[2].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[2].levelSmallestDurationGames,
                                fails: levelsWithHighestScoreGamesAndSmallestDuration[2].levelFails,

                            },
                            hard: {
                                title: "Hard",
                                averageScore: user.score.hard.games.length > 0 ? (user.score.hard.totalScore / user.score.hard.games.length).toFixed(2) : 0,
                                totalScore: user.score.hard.totalScore,
                                totalGames: user.score.hard.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[3].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[3].levelSmallestDurationGames,
                                fails: levelsWithHighestScoreGamesAndSmallestDuration[3].levelFails,
                            },
                            expert: {
                                title: "Expert",
                                averageScore: user.score.expert.games.length > 0 ? (user.score.expert.totalScore / user.score.expert.games.length).toFixed(2) : 0,
                                totalScore: user.score.expert.totalScore,
                                totalGames: user.score.expert.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[4].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[4].levelSmallestDurationGames,
                                fails: levelsWithHighestScoreGamesAndSmallestDuration[4].levelFails,
                            },
                        },
                        theUser: true
                    }
                } else {
                    return {
                        userDetails: {
                            userId: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                        userScore: {
                            beginner: user.score.beginner.games.length > 0 ? (user.score.beginner.totalScore / user.score.beginner.games.length).toFixed(2) : 0,
                            amateur: user.score.amateur.games.length > 0 ? (user.score.amateur.totalScore / user.score.amateur.games.length).toFixed(2) : 0,
                            medium: user.score.medium.games.length > 0 ? (user.score.medium.totalScore / user.score.medium.games.length).toFixed(2) : 0,
                            hard: user.score.hard.games.length > 0 ? (user.score.hard.totalScore / user.score.hard.games.length).toFixed(2) : 0,
                            expert: user.score.expert.games.length > 0 ? (user.score.expert.totalScore / user.score.expert.games.length).toFixed(2) : 0,
                        }
                    }
                }
            })

            transformedUsers.sort(function (a, b) {
                if (a.userDetails.firstName < b.userDetails.firstName) {
                    return -1;
                }
                if (a.userDetails.firstName > b.userDetails.firstName) {
                    return 1;
                }
                return 0;
            });
            transformedUsers.sort(function (a, b) {
                if (a.userDetails.lastName < b.userDetails.lastName) {
                    return -1;
                }
                if (a.userDetails.lastName > b.userDetails.lastName) {
                    return 1;
                }
                return 0;
            });
            transformedUsers.sort((a, b) => b.userScore.beginner - a.userScore.beginner);
            transformedUsers.sort((a, b) => b.userScore.amateur - a.userScore.amateur);
            transformedUsers.sort((a, b) => b.userScore.medium - a.userScore.medium);
            transformedUsers.sort((a, b) => b.userScore.hard - a.userScore.hard);
            transformedUsers.sort((a, b) => b.userScore.expert - a.userScore.expert);

            //creating additional iterator 
            let k = 0;
            //counter
            let counter = 0;
            //iterating through the first loop
            for (let i = 0; i < transformedUsers.length; i++) {
                //zeroing the counter for the current iteration
                counter = 0;
                //if the next element is the same and a check to make sure that
                //we are not going out of index
                if (i < transformedUsers.length - 1) {
                    //first of all, inserting the current index to the correct place in ranks
                    transformedUsers[i].rank = i + 1;
                    if (isEqualObjects(transformedUsers[i]?.userScore, transformedUsers[i + 1]?.userScore)) {
                        // making k equal to the next element in order to check against him
                        k = i + 1;
                        //iterating as long as the coming elements are equal to the current one
                        while (isEqualObjects(transformedUsers[i]?.userScore, transformedUsers[k]?.userScore)) {
                            counter++;
                            transformedUsers[i + counter].rank = i + 1;
                            k++;
                        }
                        //getting i to the place in the array which we need to check and subtracting 1 because
                        // in the end of the current iteration he is going to get +1
                        i = k - 1;
                    } else {

                    }
                } else {
                    transformedUsers[i].rank = i + 1;
                }
            }

            res.status(200).json(transformedUsers);

        } catch (error) {
            res.status(403).json({ error });
        }
    });

router.route('/game-summary')
    .get(authenticateTokenMW, async (req, res) => {
        try {
            const { level } = req.query;
            const user = await User.findOne({ _id: req.user._id })
            const userLevel = user.score[level];
            let lastScoreAverage = userLevel.games.length === 1 ? 0 : +((userLevel.totalScore - userLevel.games[userLevel.games.length - 1].totalScore) / (userLevel.games.length - 1)).toFixed(2);
            let currentScoreAverage = +(userLevel.totalScore / userLevel.games.length).toFixed(2);
            const improvedLevelAverage = { isImproved: "equal", lastScoreAverage, currentScoreAverage, averageChange: Math.abs((currentScoreAverage - lastScoreAverage).toFixed(2)) };
            if (currentScoreAverage - lastScoreAverage > 0) {
                improvedLevelAverage.isImproved = "yes";
            }
            if (currentScoreAverage - lastScoreAverage < 0) {
                improvedLevelAverage.isImproved = "no";
            }

            let gameDuration = msToTime(userLevel.games[userLevel.games.length - 1].endTime - userLevel.games[userLevel.games.length - 1].startTime);

            const transformedQuestions = userLevel.games[userLevel.games.length - 1].questions.map((question, index) => {
                if (question.isCorrect) {
                    const { name, flag } = countries.find(country => country.id === question.trueCountry);
                    return {
                        _id: question._id,
                        index: index + 1,
                        isCorrect: question.isCorrect,
                        trueCountryName: name,
                        trueCountryFlag: flag,
                    }
                } else {
                    const { name: trueCountryName, flag: trueCountryFlag } = countries.find(country => country.id === question.trueCountry);
                    const { name: falseCountryName, flag: falseCountryFlag } = countries.find(country => country.id === question.falseCountry);
                    return {
                        _id: question._id,
                        index: index + 1,
                        isCorrect: question.isCorrect,
                        trueCountryName,
                        trueCountryFlag,
                        falseCountryName,
                        falseCountryFlag
                    }
                }
            });

            res.status(200).json({
                level: capitalizeFirstLetter(level),
                improvedLevelAverage,
                gameDuration,
                questions: {
                    numberOfQuestions: userLevel.games[userLevel.games.length - 1].questions.length,
                    numberOfTrueQuestions: userLevel.games[userLevel.games.length - 1].totalScore,
                    numberOfFalseQuestions: userLevel.games[userLevel.games.length - 1].questions.length - userLevel.games[userLevel.games.length - 1].totalScore,
                    questions: transformedQuestions,
                }
            })
        } catch (error) {
            res.status(403).json({ error });
        }
    });

router.route('/reset')
    .patch(authenticateTokenMW, async (req, res) => {
        try {
            const { email } = req.user;
            const user = await User.findOne({ email });
            if (!user) {
                res.status(404).json({ error: "User doesn't exist" });
            } else {
                const update = await User.updateOne({ email }, {
                    score: {
                        beginner: {
                            totalScore: 0,
                            games: []
                        },
                        amateur: {
                            totalScore: 0,
                            games: []
                        },
                        medium: {
                            totalScore: 0,
                            games: []
                        },
                        hard: {
                            totalScore: 0,
                            games: []
                        },
                        expert: {
                            totalScore: 0,
                            games: []
                        },
                    }
                });

                res.status(200).json(update);
            }
        } catch (error) {
            res.status(400).json({ error });
        }
    })



module.exports = router;