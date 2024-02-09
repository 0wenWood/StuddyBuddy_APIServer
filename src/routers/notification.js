const express = require('express');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');

const router = express.Router();

router.post('/notification', async (req, res) => {
    const notification = new Notification(req.body);

    try {
        await notification.save();
        res.status(HTTPStatusCode.CREATED).send(notification);
    } catch(e) {
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    } 
});

router.get('/user/notification', auth, async (req, res) => {
    const user = req.user;
    let notifications = [];
    notifications.push(await Notification.find({'sender': user._id}));
    notifications.push(await Notification.find({'reciever': user._id}));

    res.status(HTTPStatusCode.OKAY).send(notifications);
});

router.post('/user/notification', auth, async (req, res) => {
    const notification = new Notification(req.body);

    try {
        await notification.save();
        res.status(HTTPStatusCode.CREATED).send(notification);
    } catch (e) {
        res.status(HTTPStatusCode.BADREQUEST).send(e)
    }
});

router.delete('/user/notification/:notificationId', auth, async (req, res) => {
    const id = req.params.notificationId;
    const userId = req.user._id;

    if (id === undefined) {
        res.status(HTTPStatusCode.BADREQUEST).send("Invalid Notification Id");
    }

    const notification = await Notification.findOneAndDelete({_id: id, $or: [{sender: userId}, {reciever: userId}]});
    if (!notification) {
        res.send(HTTPStatusCode.NOTFOUND).send("Notification Not Found");
    }

    if (false) { // User should not be able to delete some notifications potentially.
        req.status(HTTPStatusCode.UNAUTHROIZED).send("User cannot delete this notification");
    }

    res.status(HTTPStatusCode.OKAY).send(notification);
});

router.delete('/user/notifications/all', auth, async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.deleteMany({$or: [{sender: userId}, {reciever: userId}]});

    if (false) { // User should not be able to delete some notifications potentially.
        req.status(HTTPStatusCode.UNAUTHROIZED).send("User cannot delete this notification");
    }

    res.status(HTTPStatusCode.OKAY).send(notifications);
});

router.patch('/user/notifications', auth, async (req, res) => {
    const id = req.body.notificationId;
    const isRead = req.body.isRead;
    const userId = req.user._id;

    if (id === undefined) {
        res.status(HTTPStatusCode.BADREQUEST).send("One or more Invalid Properties");
    }

    if (isRead === undefined || isRead === null) {
        isRead = true;
    }
    
    const filter = {_id: id, $or: [{sender: userId}, {reciever: userId}]};

    const notification = await Notification.findByIdAndUpdate(filter, { isRead: isRead });

    res.status(HTTPStatusCode.OKAY).send(notification);
});

module.exports = router;