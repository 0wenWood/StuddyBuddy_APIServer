const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId

const Schema = mongoose.Schema;

const studyGroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: ObjectId,
        required: true
    },
    is_public: {
        type: Boolean,
        default: true
    },
    max_participants: {
        type: Number,
        default: 6
    },
    start_date: Date,
    end_date: Date,
    meeting_days: [String],
    meeting_time: [String],
    description: String,
    location: String,
    school: String,
    class_number: Number,
    participants: [ObjectId]
});

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);

module.exports = StudyGroup;