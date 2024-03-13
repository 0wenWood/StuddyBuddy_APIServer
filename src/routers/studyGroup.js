const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');
const auth = require('../middleware/auth');
const StudyGroup = require('../models/studyGroup');
const { default: mongoose } = require('mongoose');

const router = express.Router();

router.post('/studygroup', auth, async (req, res) => {
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

    if (req.query.hasOwnProperty('ongoing')) {
        const now = new Date();
        switch (req.query.ongoing.toLowerCase()) {
            case 'true':
                filter.$and.push({ start_date: { $lte: now }});
                filter.$and.push({ end_date: { $gt: now }});
                break;
            case 'false':
                filter.$and.push({ 
                    $or: [
                        { start_date: { $gt: now }},
                        { end_date: { $lt: now }}
                    ]
                });
                break;
            default:
                break;
        }
    }

    if (req.query.hasOwnProperty('search')) {
        if (req.query.search.length !== 0) {
            filter.$and.push({
                $text: {
                    $search: req.query.search
                }
            });
        }
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

router.patch('/studygroup/:id', auth, async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    const mods = req.body;

    let studygroup = undefined;

    if (mongoose.isValidObjectId(id)) {
        res.status(HTTPStatusCode.BADREQUEST).send("Invalid Studygroup Id");
        return;
    }

    try {
        studygroup = await StudyGroup.findById(id);

        if (!studygroup.owner.equals(user._id)) {
            throw new Error();
        }

    } catch (e) {
        res.send(HTTPStatusCode.INTERNALSERVERERROR).send("Error Finding Studygroup");
        return;
    }

    const props = Object.keys(mods);
    const modifiable = [
        "name",
        "is_public",
        "max_participants",
        "start_date",
        "end_date",
        "meeting_times",
        "description",
        "school",
        "course_number"
    ];

    if (!props.every((p) => modifiable.includes(p))) {
        res.status(HTTPStatusCode.BADREQUEST).send("One or More Invalid Properties");
        return;
    }

    try {
        props.forEach((p) => studygroup[p] = mods[p]);
        await studygroup.save();

        res.send(studygroup);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send("Error Saving Studygroup");
    }
});

module.exports = router;