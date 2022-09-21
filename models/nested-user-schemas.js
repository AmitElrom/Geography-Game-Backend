const { Schema } = require('mongoose');

const questionSchema = new Schema({
    isCorrect: { type: Boolean, required: true },
    trueCountry: { type: String, required: true },
    falseCountry: { type: String, required: false },
});

const gameSchema = new Schema({
    totalScore: { type: Number, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    questions: [questionSchema]
});

const levelSchema = new Schema({
    totalScore: { type: Number, required: false },
    games: [gameSchema]
});

const scoreSchema = new Schema({
    beginner: levelSchema,
    amateur: levelSchema,
    medium: levelSchema,
    hard: levelSchema,
    expert: levelSchema,
});

module.exports = { scoreSchema, levelSchema, gameSchema, questionSchema };