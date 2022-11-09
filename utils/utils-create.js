const generateVerificationCode = (numOfChars) => {
    let code = '';
    for (let i = 0; i < numOfChars; i++) {
        let randomNum = Math.floor(Math.random() * 10);
        code += randomNum;
    }
    return code;
};

const generateArrayOfRanks = (arr1) => {
    //creating the 2 arrays
    // const arr1 = [15, 12, 12, 12, 10, 7, 7, 4, 3, 3, 3, 2, 2, 1];
    const arr2 = [];
    //creating additional iterator 
    let k = 0;
    //counter
    let counter = 0;
    //iterating through the first loop
    for (let i = 0; i < arr1.length; i++) {
        //zeroing the counter for the current iteration
        counter = 0;
        //if the next element is the same and a check to make sure that
        //we are not going out of index
        if (i < arr1.length - 1 && arr1[i] == arr1[i + 1]) {
            //first of all, inserting the current index to the correct place in arr2
            arr2[i] = i + 1;
            // making k equal to the next element in order to check against him
            k = i + 1;
            //iterating as long as the coming elements are equal to the current one
            while (arr1[i] === arr1[k]) {
                counter++;
                arr2[i + counter] = i + 1;
                k++;
            }
            //getting i to the place in the array which we need to check and subtracting 1 because
            // in the end of the current iteration he is going to get +1
            i = k - 1;
        } else {
            arr2[i] = i + 1;
        }
    }
    return arr2;
}




module.exports = { generateVerificationCode };