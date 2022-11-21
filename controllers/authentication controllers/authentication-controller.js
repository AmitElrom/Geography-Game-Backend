const signUpCtrl = async (req, res) => {
    console.log('req')
    console.log(req?.body)
    try {
        const { email, firstName, lastName, password1, password2 } = req.body;
        if (email && firstName && lastName && password1 && password2) {
            const existedUser = await User.findOne({ email });
            if (!existedUser) {
                if (password1 === password2) {
                    let salt = await genSalt(10);
                    let hashedPassword = await hash(password1, salt);

                    const newUser = await User.create({
                        firstName,
                        lastName,
                        email,
                        password: hashedPassword,
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
                    })

                    const userDataToToken = { email: newUser.email, _id: newUser._id };
                    const token = sign(userDataToToken, process.env.ACCESS_TOKEN_KEY);

                    res.status(201).json({
                        message: `Success message - a user with the email of ${email} was added.`,
                        userData: {
                            email,
                            firstName,
                            lastName,
                            fullName: `${newUser.firstName} ${newUser.lastName}`,
                        },
                        token,
                    })
                } else {
                    res.status(400).json({ error: "Error - passwords don't match." })
                }
            } else {
                res.status(400).json({ error: `Error - a user with an email of ${email} already exists.` })
            }
        } else {
            const reqBody = { email, firstName, lastName, password1, password2 };
            const missingFields = [];
            for (const prop in reqBody) {
                if (!reqBody[prop]) {
                    missingFields.push(prop);
                }
            }
            let auxiliaryVerb1 = missingFields.length === 1 ? ' a' : '';
            let auxiliaryVerb2 = missingFields.length === 1 ? '' : 's';
            let missingFieldsStr = missingFields.join(', ');
            res.status(400).json({ error: `Error - new user has${auxiliaryVerb1} missing field${auxiliaryVerb2} - ${missingFieldsStr}.` })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
};

module.exports = { signUpCtrl };