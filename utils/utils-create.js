const generateVerificationCode = (numOfChars) => {
    let code = '';
    for (let i = 0; i < numOfChars; i++) {
        let randomNum = Math.floor(Math.random() * 10);
        code += randomNum;
    }
    return code;
};

module.exports = { generateVerificationCode };