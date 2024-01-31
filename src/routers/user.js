const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes.js')
const User = require('../models/user');

const router = express.Router();

router.post('/user', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(HTTPStatusCode.CREATED).send(user);
    } catch(e) {
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    }
});

module.exports = router;