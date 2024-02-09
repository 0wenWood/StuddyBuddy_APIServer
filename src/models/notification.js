const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const NotificationTypeEnum = require('../enums/NotificationTypeEnum');

const Schema = mongoose.Schema;

const schema = new Schema({
    sender: {
        type: ObjectId,
        required: true
    },
    reciever: {
        type: ObjectId,
        required: true
    },
    subject: {
        type: String,
        required: true,
        minLength: 1
    },
    body: {
        type: String,
        required: true,
        minLength: 1
    },
    notification_type: {
        type: String,
        required: true,
        validate(val) {
            if (!NotificationTypeEnum.has(val)) {
                throw new Error("Invalid Notification Type")
            }
        }
    },
    is_read: {
        type: Boolean,
        default: false      
    },
    studygroup_id: ObjectId
});

schema.pre('save', async function(next) {

    const notification = this;

    if (notification.isModified('notification_type')) {
        if (NotificationTypeEnum.has(notification.notification_type)) {
            if (NotificationTypeEnum.get(notification.notification_type) 
                && notification.studygroup_id === undefined) {
                    throw new Error('Study Group Id is undefined');
            }
        }
    }

    next();
});

const notification = mongoose.model('Notification', schema);

module.exports = notification;