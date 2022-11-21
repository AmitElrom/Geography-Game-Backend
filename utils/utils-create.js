const generateVerificationCode = (numOfChars) => {
    const arrWithRandomNums = Array.apply(null, Array(numOfChars)).map(item => Math.floor(Math.random() * 10));
    return arrWithRandomNums.join("").toString();
};


module.exports = { generateVerificationCode };