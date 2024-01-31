const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');
const NotificationTypeEnum = require('../enums/NotificationTypeEnum')
const Notification = require('../models/notification');

const router = express.Router();

router.post('/notification', async (req, res) => {
    const notification = new Notification(req.body);

    try {
        await notification.save();
        res.status(HTTPStatusCode.OKAY).send(notification);
    } catch(e) {
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    } 
});

router.get('/user/notification', (req, res) => {
    // Go into database and get notifications from user

    const notifications = [ // Test Data
    {
        id: "",
        title: "Joined Study Group",
        sender: "Owen Wood",
        body: "",
        isRead: false,
        notificationType: "",
        studyGroupId: ""
    },
    {
        id: "",
        title: "Delayed Study Group",
        sender: "",
        body: "",
        isRead: false,
        notificationType: "",
        studyGroupId: ""
    },
    {
        id: "",
        title: "",
        sender: "",
        body: "",
        isRead: false,
        notificationType: "",
        studyGroupId: ""
    }];

    res.status(HTTPStatusCode.OKAY).send(notifications);
});

router.post('/user/notifications', (req, res) => {
    const notification = req.body;
    if (notification.sender === undefined ||
        notification.sender === undefined ||
        (notification.subject === undefined || 
        notification.sender.length === 0) ||
        (notification.body === undefined || 
        notification.body.length === 0)) {
            req.status(HTTPStatusCode.BADREQUEST)
                .send("One or More invalid properties");
    }

    if (notification.notificationType === undefined) {
        notification.notificationType = NotificationTypeEnum.MessageNotificationType;
    }

    if (notification.notificationType.idRequired && 
        notification.studyGroupId === undefined) {
            req.status(HTTPStatusCode.BADREQUEST)
                .send("Notification Type Requires Study Group Id");
    }

    res.status(HTTPStatusCode.CREATED).send(notification);
});

router.delete('/user/notifications/:notificationId', (req, res) => {
    const id = req.params.notificationId;

    if (id === undefined) {
        req.status(HTTPStatusCode.BADREQUEST).send("Invalid Notification Id");
    }

    // Go into Database and find the notification by ID

    const notification = {
        id: id,
        title: "Joined Study Group",
        sender: "Owen Wood",
        body: "",
        isRead: false,
        notificationType: "",
        studyGroupId: ""
    };

    if (false) { // User should not be able to delete some notifications potentially.
        req.status(HTTPStatusCode.UNAUTHROIZED).send("User cannot delete this notification");
    }

    res.status(HTTPStatusCode.OKAY).send(notification);
});

router.delete('/user/notifications/all', (req, res) => {
    // Go to database and get all notifications from this user.
    if (id === undefined) {
        req.status(HTTPStatusCode.NOTFOUND).send("Notification Not Found");
    }

    if (false) { // User should not be able to delete some notifications potentially.
        req.status(HTTPStatusCode.UNAUTHROIZED).send("User cannot delete this notification");
    }

    res.status(HTTPStatusCode.OKAY).send([{title: "Hello"}, {title: "Hello"}, {title: "Hello"}]);
});

router.patch('/user/notifications', (req, res) => {
    const id = req.body.notificationId;
    const isRead = req.body.isRead;

    if (id === undefined) {
        res.status(HTTPStatusCode.BADREQUEST).send("One or more Invalid Properties");
    }

    if (isRead === undefined) {
        isRead = true;
    }

    // Find Notification in Database
    if (false) { // Not in Database
        res.status(HTTPStatusCode.NOTFOUND).send("Notification Not Found");
    }

    // Save Edit on Notification in Database

    const notification = {
        id: id,
        isRead: isRead
    }

    res.status(HTTPStatusCode.OKAY).send(notification);
});

module.exports = router;