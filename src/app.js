const HTTPStatusCode = require('./enums/HTTPStatusCodes.js');
const NotificationTypeEnum = require('./enums/NotificationTypeEnum.js');

const express = require('express');
const cors = require('cors');
const app = express();
const userRouter = require('./routers/user');
const notificationRouter = require('./routers/notification.js');
const groupsRouter = require('./routers/studyGroup');

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(notificationRouter);
app.use(groupsRouter);


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-All-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
});

// Configure the server to listen for connections on the port. 
// Print to the console when ready for connections
app.listen(port, () => {
    console.log('Server is up on port ' + port);
})