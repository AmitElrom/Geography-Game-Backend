const express = require('express');
const { authenticateTokenMW } = require('../../middlewares/authentication/authenticate-token');

const User = require('../../models/user model/userModel');
const { msToTime } = require('../../utils/utils-manipulate');

const router = express.Router();

router.route('/')
    .get(authenticateTokenMW, async (req, res) => {
        try {
            const { _id } = req.user;
            const user = await User.findOne({ _id });

            const levels = ['beginner', 'amateur', 'medium', 'hard', 'expert'];

            const dateOptions = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            };

            const allCorrectBadges = levels.map(level => {
                const levelGames = user.score[level].games;
                let questionsQuantity = level === "beginner" ? 10 : 20;
                const game = levelGames.find(game => game.totalScore === questionsQuantity);
                if (!game) {
                    return {
                        name: `${level}_badge`,
                        hasBadge: false
                    };

                } else {
                    const date = new Date(game.startTime);
                    let duration = msToTime(game.endTime - game.startTime);

                    return {
                        name: `${level}_badge`,
                        hasBadge: true,
                        date: date.toLocaleDateString("en-US", dateOptions),
                        duration
                    }
                }
            })

            const allCorrectAndTimerBadges = levels.map(level => {
                const levelGames = user.score[level].games;
                let questionsQuantity = level === "beginner" ? 10 : 20;
                let levelTimeRequested = 0;
                if (level === "beginner") levelTimeRequested = 45;
                if (level === "amateur") levelTimeRequested = 65;
                if (level === "medium") levelTimeRequested = 70;
                if (level === "hard") levelTimeRequested = 80;
                if (level === "expert") levelTimeRequested = 90;

                const game = levelGames.find(game => game.totalScore === questionsQuantity && (game.endTime - game.startTime) / 1000 <= levelTimeRequested);
                if (!game) {
                    return {
                        name: `${level}_and_timer_badge`,
                        hasBadge: false
                    };

                } else {
                    const date = new Date(game.startTime);
                    let duration = msToTime(game.endTime - game.startTime);

                    return {
                        name: `${level}_and_timer_badge`,
                        hasBadge: true,
                        date: date.toLocaleDateString("en-US", dateOptions),
                        duration
                    }
                }
            })

            const badges = [...allCorrectBadges, ...allCorrectAndTimerBadges];

            res.status(200).json(badges);
        } catch (error) {
            res.status(400).json({ error });
        }
    });

module.exports = router;