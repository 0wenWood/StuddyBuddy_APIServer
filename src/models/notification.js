const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
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
        required: true
    },
    body: {
        type: String,
        required: true
    },
    notification_type: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false      
    },
    studygroup_id: ObjectId
});

const notification = mongoose.model('Notification', notificationSchema);

module.exports = notification;