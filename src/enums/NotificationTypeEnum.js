class NotificationEnum {
    constructor(name, idRequired) {
        this.name = name;
        this.idRequired = idRequired; 
    }
}

const NotificationTypeEnum = Object.freeze({
    MessageNotificationType: new NotificationEnum("Message", false),
    InvitationNotificationType: new NotificationEnum("Join", true),
    RequestNotificationType: new NotificationEnum("Request", true)
});