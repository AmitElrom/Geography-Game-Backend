const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();

const User = require('../models/userModel');

const { authenticateToken } = require('../middlewares/authentication');

const { isEqualObjects } = require('../utils/utils-checks');
const { msToTime } = require('../utils/utils-create');

router.route('/')
    .patch(authenticateToken, async (req, res) => {

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

    })

router.route('/')
    .get(authenticateToken, async (req, res) => {
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

                return { levelHighestScoreGames, levelSmallestDurationGames };
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
                            },
                            amateur: {
                                title: "Amateur",
                                averageScore: user.score.amateur.games.length > 0 ? (user.score.amateur.totalScore / user.score.amateur.games.length).toFixed(2) : 0,
                                totalScore: user.score.amateur.totalScore,
                                totalGames: user.score.amateur.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[1].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[1].levelSmallestDurationGames,
                            },
                            medium: {
                                title: "Medium",
                                averageScore: user.score.medium.games.length > 0 ? (user.score.medium.totalScore / user.score.medium.games.length).toFixed(2) : 0,
                                totalScore: user.score.medium.totalScore,
                                totalGames: user.score.medium.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[2].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[2].levelSmallestDurationGames,
                            },
                            hard: {
                                title: "Hard",
                                averageScore: user.score.hard.games.length > 0 ? (user.score.hard.totalScore / user.score.hard.games.length).toFixed(2) : 0,
                                totalScore: user.score.hard.totalScore,
                                totalGames: user.score.hard.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[3].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[3].levelSmallestDurationGames,
                            },
                            expert: {
                                title: "Expert",
                                averageScore: user.score.expert.games.length > 0 ? (user.score.expert.totalScore / user.score.expert.games.length).toFixed(2) : 0,
                                totalScore: user.score.expert.totalScore,
                                totalGames: user.score.expert.games.length,
                                bestScore: levelsWithHighestScoreGamesAndSmallestDuration[4].levelHighestScoreGames,
                                bestTime: levelsWithHighestScoreGamesAndSmallestDuration[4].levelSmallestDurationGames,
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

            transformedUsers.sort((a, b) => b.userScore.beginner - a.userScore.beginner);
            transformedUsers.sort((a, b) => b.userScore.amateur - a.userScore.amateur);
            transformedUsers.sort((a, b) => b.userScore.medium - a.userScore.medium);
            transformedUsers.sort((a, b) => b.userScore.hard - a.userScore.hard);
            transformedUsers.sort((a, b) => b.userScore.expert - a.userScore.expert);

            const ranks = [];

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
    })


module.exports = router;