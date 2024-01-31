const NotificationEnum = require('./NotificationEnum');

const NotificationTypeEnum = Object.freeze({
    MessageNotificationType: new NotificationEnum("Message", false),
    InvitationNotificationType: new NotificationEnum("Join", true),
    RequestNotificationType: new NotificationEnum("Request", true)
});
module.exports = NotificationTypeEnum;