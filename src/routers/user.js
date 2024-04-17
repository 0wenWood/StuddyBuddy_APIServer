const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes.js')
const User = require('../models/user');
const auth = require('../middleware/auth.js');

const { sendVerificationEmail } = require('../emails/account.js');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/user', async (req, res) => {
    delete req.body.email_verification;
    delete req.body.tokens;
    
    const user = new User(req.body);
    
    try {
        await user.save();
        const token = await user.generateAuthToken();
        
        sendVerificationEmail(user.email, user.username, token);
        res.status(HTTPStatusCode.CREATED).send({ user: user, okay: true });
    } catch (error) {
        res.status(HTTPStatusCode.BADREQUEST).send(error);
    }
});

router.get('/user/:id', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
        res.status(HTTPStatusCode.BADREQUEST).send();
        return;
    }

    try {
        const user = await User.findById(id);
        res.status(HTTPStatusCode.OKAY).send({ name: user.username });
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }
});

router.get('/user/verification', auth, async (req, res) => {
    const user = req.user;

    user.email_verification = true;
    await user.save();

    res.send();
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        if (user.email_verification === true) {
            const token = await user.generateAuthToken();
            const okay = true;
            res.status(HTTPStatusCode.OKAY).send({ user, token, okay });
        }
    } catch (e) {
        console.log(e);
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }
});

router.patch('/user/logout', auth, async (req, res) => {
    const user = req.user;
    
    try {
        user.tokens = user.tokens.filter((token) => token !== req.token);
        await user.save();

        res.send();
    } catch(e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }
});

module.exports = router;