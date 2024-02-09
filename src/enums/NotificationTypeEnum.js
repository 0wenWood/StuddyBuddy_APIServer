/** 
 * List of Valid Notification Types
 * 
 * Links Notification Name with the need to have a StudyGroupId
 * */ 
const NotificationTypeEnum = Object.freeze(new Map([
    ["MessageNotificationType", false],
    ["InvitationNotificationType", true],
    ["RequestNotificationType", true]
]));

module.exports = NotificationTypeEnum;