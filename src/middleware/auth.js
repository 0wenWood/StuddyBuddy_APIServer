const jwt = require('jsonwebtoken');
const User = require('../models/user');
const HTTPStatusCodes = require('../enums/HTTPStatusCodes');

const auth = async (req, res, next) => {
    console.log();
    try {
        const token = req.header("Authorization").replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JSON_TOKEN);
        const user = await User.findOne({ _id: decoded._id, tokens: token });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();

    } catch (e) {
        res.status(HTTPStatusCodes.UNAUTHROIZED).send({error: "Authentication Needed"});
    }
}

module.exports = auth;