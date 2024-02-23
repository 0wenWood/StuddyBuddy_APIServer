const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');
const auth = require('../middleware/auth');
const StudyGroup = require('../models/studyGroup');

const router = express.Router();

router.post('/studygroup', auth, async (req, res) => {
    delete req.body.particpants
    delete req.body.owner
    const studyGroup = new StudyGroup({ ...req.body, owner: req.user._id });

    try {
        await studyGroup.save();
        res.status(HTTPStatusCode.CREATED).send(studyGroup);
    } catch(e) {
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    }
});

module.exports = router;