const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes.js')
const User = require('../models/user');
const auth = require('../middleware/auth.js');
const { IgApiClient } = require('instagram-private-api');
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

router.patch('/user', auth, async (req, res) => {
    const mods = req.body;
    const user = req.user;

    const props = Object.keys(mods);
    const modifiable = [
        "username",
        "email",
        "password",
        "school",
        "ig",
        "majors",
        "friends",
        "inbox"
    ];

    if (props.includes("password") && mods["password"].length === 0) {
        mods["password"] = user.password;
    }

    if (!props.every((p) => modifiable.includes(p))) {
        res.status(HTTPStatusCode.BADREQUEST).send("One or More Invalid Properties");
        return;
    }

    try {
        props.forEach((p) => user[p] = mods[p]);
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send("Error Saving User");
    }
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

router.post('/user/instagram', auth, async (req, res) => {
    const user = req.user;
    const isCreated = req.query.isCreated;
    const name = req.query.group;
    try {
        const data = {
            img_url: "https://as1.ftcdn.net/v2/jpg/03/56/73/14/1000_F_356731435_KWwMysbXYKSHjQAIkja9PlvJBzd0Y4Xi.jpg",
            caption: isCreated === "true" ? `${user.username} created a new Study Group called ${name}!` : `${user.username} joined ${name} StudyGroup!`
        }

        const ig = new IgApiClient(); 
        ig.state.generateDevice(user.ig.username);
        await ig.account.login(user.ig.username, user.ig.password);

        let imgBuffer = "";
        await fetch(data.img_url).then(res => res.arrayBuffer().then(r => imgBuffer = Buffer.from(r)));

        await ig.publish.photo({
            file: imgBuffer,
            caption: data.caption
        });

        res.status(HTTPStatusCode.CREATED).send("Instagram Post Created");
    } catch (e) {
        console.log(e);
        res.status(HTTPStatusCode.BADREQUEST).send("Unable to Post on Instagram");
    }
});

module.exports = router;