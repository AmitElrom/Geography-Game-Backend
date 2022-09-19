const { Schema } = require('mongoose');

const levelScoresSchema = new Schema({
    isCorrect: { type: Boolean, required: true },
    trueCountry: { type: String, required: true },
    falseCountry: { type: String, required: false },
    startTime: {},
    endTime: {}
});

const levelSchema = new Schema({
    totalScore: { type: Number, required: true },
    levelScores: [levelScoresSchema]
});

const scoreSchema = new Schema({
    beginner: levelSchema,
    amateur: levelSchema,
    medium: levelSchema,
    hard: levelSchema,
    expert: levelSchema,
});

module.exports = { scoreSchema };