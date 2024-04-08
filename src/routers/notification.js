const express = require('express');
const Notification = require('../models/notification');
const User = require('../models/user');
const auth = require('../middleware/auth');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');

const router = express.Router();

router.post('/notification', auth, async (req, res) => {
    console.log(req.body);
    const notification = new Notification({...req.body, sender: req.user._id});
    try {
        await notification.save();

        const sender = await User.findById(req.user._id);
        sender.inbox.push(notification._id);

        const reciever = await User.findById(notification.reciever);
        reciever.inbox.push(notification._id);
        res.status(HTTPStatusCode.CREATED).send({ notification: notification, okay: true });
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send(e);
    }
});

router.get('/notifications', auth, async(req, res) => {
    const filter = {
        $and: [{
            $or: [
                { sender: req.user._id },
                { reciever: req.user._id }
            ]
        }
    ]};

    try {
        const result = await Notification.find(filter);
        res.send([...result]);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send(e);
    }
});

module.exports = router;