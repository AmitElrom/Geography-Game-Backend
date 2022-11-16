const generateVerificationCode = (numOfChars) => {
    let code = '';
    for (let i = 0; i < numOfChars; i++) {
        let randomNum = Math.floor(Math.random() * 10);
        code += randomNum;
    }
    return code;
};

const msToTime = (duration) => {
    let milliseconds = Math.floor((duration % 1000) / 100);
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return { hours, minutes, seconds, milliseconds };
}

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { generateVerificationCode, msToTime, capitalizeFirstLetter };