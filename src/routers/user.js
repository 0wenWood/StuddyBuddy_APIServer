const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes.js')
const User = require('../models/user');
const auth = require('../middleware/auth.js');

const { sendVerificationEmail } = require('../emails/account.js');

const router = express.Router();

router.post('/user', async (req, res) => {
    delete req.body.email_verification;
    delete req.body.tokens;
    
    const user = new User(req.body);
    
    try {
        await user.save();
        const token = await user.generateAuthToken();
        
        sendVerificationEmail(user.email, user.username, token);
        res.status(HTTPStatusCode.CREATED).send(user);
    } catch (error) {
        console.error(error);
        res.status(HTTPStatusCode.BADREQUEST).send(user);
    }
});

router.get('/user/verification', auth, async (req, res) => {
    const user = req.user;
    const token = req.token;
    console.log(token);

    user.email_verification = true;
    await user.save();

    res.send();
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if (user.email_verification === true) {
            const token = await user.generateAuthToken();

            res.status(HTTPStatusCode.OKAY).send({ user, token });
        }
    } catch (e) {
        console.log(e);
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }
});

router.post('/user/logout', async (req, res) => {
    try {
        const user = await User.findOne({ "tokens": token });

        if (!user) {
            res.send(HTTPStatusCode.BADREQUEST).send("Invalid Token");
        }

        user.tokens = user.tokens.filter((token) => token !== req.token);
        await user.save();

        res.send();
    } catch(e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }
});

module.exports = router;