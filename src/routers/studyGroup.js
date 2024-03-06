const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');
const auth = require('../middleware/auth');
const StudyGroup = require('../models/studyGroup');

const router = express.Router();

router.post('/studygroup', auth, async (req, res) => {
    delete req.body.particpants
    delete req.body.owner
    const studyGroup = new StudyGroup({ ...req.body, owner: req.user._id });
    console.log(studyGroup);
    try {
        await studyGroup.save();
        res.status(HTTPStatusCode.CREATED).send({ group: studyGroup, okay: true});
    } catch(e) {
        console.log(e);
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    }
});

router.get('/studygroups', auth, async (req, res) => {
    const filter = { $and: [] };
    const projection = {
        name: 1,
        is_public: 1,
        max_participants: 1,
        description: 1,
        start_date: 1,
        end_date: 1,
        meeting_times: 1,
        school: 1,
        course_number: 1
    };

    filter.$and.push({
        $or: [
            { is_public: true },
            { owner: req.user._id }
        ]
    });

    const now = new Date();

    if (req.query.hasOwnProperty('ongoing')) {
        if (req.query.ongoing.toLowerCase() === 'true') {
            filter.$and.push({ start_date: { $lte: now }});
            filter.$and.push({ end_date: { $gt: now }});
        } else {
            filter.$and,push({ 
                $or: [
                    { start_date: { $gt: now }},
                    { end_date: { $lt: now }}
                ]
            });
        }
    }

    if (req.query.hasOwnProperty('search')) {
        filter.$and.push({
            $text: {
                $search: req.query.search
            }
        });
    }

    const options = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        options.sort = {};
        options.sort[parts[0]] = (parts[1] == 'asc') ? 1 : -1;
    }

    if (req.query.limit) {
        options.limit = req.query.limit;
    }

    if (req.query.skip) {
        options.skip = req.query.skip;
    }

    try {
        const results = await StudyGroup.find(filter, projection, options);
        res.send(results);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }

});

module.exports = router;