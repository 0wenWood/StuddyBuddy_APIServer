require('dotenv').config({ debug: true });

const express = require('express');
const cors = require('cors');
require('./database/mongoose.js');

const userRouter = require('./routers/user');
const notificationRouter = require('./routers/notification');
const groupsRouter = require('./routers/studyGroup');

const app = express();

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(notificationRouter);
app.use(groupsRouter);

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "https://salmon-wave-0f89c260f.4.azurestaticapps.net/");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    next();
});

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Configure the server to listen for connections on the port. 
// Print to the console when ready for connections
app.listen(port, () => {
    console.log('Server is up on port ' + port);
})