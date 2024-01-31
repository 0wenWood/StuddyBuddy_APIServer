const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');
const StudyGroup = require('../models/studyGroup');

const router = express.Router();

router.post('/studygroup', async (req, res) => {
    const studyGroup = new StudyGroup(req.body);

    try {
        await studyGroup.save();
        res.status(HTTPStatusCode.CREATED).send(studyGroup);
    } catch(e) {
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    }
});

module.exports = router;