const express = require('express');
const HTTPStatusCode = require('../enums/HTTPStatusCodes');
const auth = require('../middleware/auth');
const StudyGroup = require('../models/studyGroup');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/studygroup', auth, async (req, res) => {
    delete req.body.owner
    const studyGroup = new StudyGroup({ ...req.body, owner: req.user._id });
    try {
        await studyGroup.save();
        res.status(HTTPStatusCode.CREATED).send({ group: studyGroup, okay: true});
    } catch(e) {
        console.log(e);
        res.status(HTTPStatusCode.BADREQUEST).send(e);
    }
});

router.get('/studygroup/:id', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
        res.status(HTTPStatusCode.BADREQUEST).send();
        return;
    }

    try {
        const studyGroup = await StudyGroup.findById(id);
        res.status(HTTPStatusCode.OKAY).send({group: studyGroup});
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
    }
});

router.delete('/studygroup/:id', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
        res.status(HTTPStatusCode.BADREQUEST).send();
        return;
    }

    try {
        const studyGroup = await StudyGroup.findById(id);
        const result = await StudyGroup.deleteOne(studyGroup);
        res.status(HTTPStatusCode.OKAY).send(result);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
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
        course_number: 1,
        owner: 1,
        participants: 1
    };

    if (req.query.hasOwnProperty('owned')) {
        if (req.query.owned === 'true') {
            filter.$and.push({ owner: req.user._id });
        } else {
            filter.$and.push({
                $or: [
                    { is_public: true },
                    { owner: req.user._id }
                ]
            });
        }
    }

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

    if (req.query.hasOwnProperty('member')) {
        if (req.query.member === 'true') {
            filter.$and.push({ participants: req.user._id });
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
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send(e);
    }
});

router.get('/studygroups/owned', auth, async (req, res) => {
    try {
        const studyGroups = await StudyGroup.find({ owner: req.user._id });
        res.send(studyGroups);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send(e);
        return;
    }
});

router.get('/studygroups/particpants', auth, async (req, res) => {
    try {
        const studyGroups = await StudyGroup.find({ participants: req.user._id });
        res.send(studyGroups);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send(e);
        return;
    }
});

router.patch('/studygroup/:id', auth, async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    const mods = req.body;

    let studygroup = undefined;
    const test = new mongoose.Types.ObjectId(id);
    if (test.toString() !== id) {
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
        console.log(e);
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send("Error Saving Studygroup");
    }
});

router.patch('/studygroup/:id/action', auth, async (req, res) => {
    const action = req.body.action;

    if (!mongoose.isValidObjectId(req.params.id)) {
        res.statusCode(HTTPStatusCode.BADREQUEST).send("Invalid StudyGroup Id");
        return;
    }

    let studyGroup = undefined;

    try {
        studyGroup = await StudyGroup.findById(req.params.id);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send(e);
        return;
    }

    switch(action) {
        case "join": {
            const user = req.user._id;

            if (studyGroup.owner === user) {
                res.status(HTTPStatusCode.UNAUTHROIZED).send("Owners cannot be participants");
                return;
            }

            if (studyGroup.participants.includes(user)) {
                res.status(HTTPStatusCode.UNAUTHROIZED).send("Already in Group");
                return;
            }

            studyGroup.participants.push(user);
            
            try {
                await studyGroup.save();
                res.send(HTTPStatusCode.OKAY).send();
                return;
            } catch (e) {
                res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
                return;
            }
        }

        case "leave": {
            const user = req.user._id;

            if (studyGroup.owner === user) {
                res.status(HTTPStatusCode.UNAUTHROIZED).send("Owner cannot leave study group");
                return;
            }

            if (!studyGroup.participants.includes(user)) {
                res.status(HTTPStatusCode.NOTFOUND).send("User is not a participant in this group");
                return;
            }

            studyGroup.participants.splice(studyGroup.participants.findIndex((p) => p === user), 1);

            try {
                await studyGroup.save();
                res.send(HTTPStatusCode.OKAY).send();
                return;
            } catch (e) {
                res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
                return;
            }
        }
        case "kick": {
            const owner = req.user._id;
            const userId = req.body.user;

            console.log(studyGroup.owner.equals(owner))
            if (!studyGroup.owner.equals(owner)) {
                res.status(HTTPStatusCode.UNAUTHROIZED).send("Only Owners can remove others");
                return;
            }

            if (!studyGroup.participants.includes(userId)) {
                res.status(HTTPStatusCode.NOTFOUND).send("Deleted User Not Found");
                return;
            }

            studyGroup.participants.splice(studyGroup.participants.findIndex((p) => p === userId), 1);

            try {
                await studyGroup.save();
                res.status(HTTPStatusCode.OKAY).send();
                return;
            } catch (e) {
                res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
                return;
            }
        }
        default:
            res.send(HTTPStatusCode.BADREQUEST).send("Unknown Action");
            return;
    }
});

router.delete('/studygroup/:id', auth, async (req, res) => {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
        res.statusCode(HTTPStatusCode.BADREQUEST).send("Invalid StudyGroup Id");
        return;
    }

    let studyGroup = undefined;

    try {
        studyGroup = await StudyGroup.findById(id);
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send();
        return;
    }

    if (req.user._id !== studyGroup.owner) {
        res.status(HTTPStatusCode.UNAUTHROIZED).send("Only Owners can delete Study Groups");
        return;
    }

    try {
        await studyGroup.deleteOne();
        res.status(HTTPStatusCode.OKAY).send();
    } catch (e) {
        res.status(HTTPStatusCode.INTERNALSERVERERROR).send("Failed to Delete Study Group");
    }
});

module.exports = router;