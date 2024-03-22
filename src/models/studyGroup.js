const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId
const validator = require('validator')

const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: { 
        type: ObjectId,
        ref: 'User', 
        required: true 
    },
    start_date: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toJSON())) {
                throw new Error("Invalid Meeting Date");
            } 
        }
    },
    end_date: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toJSON())) {
                throw new Error("Invalid Meeting Date");
            } 
        }
    },
    meeting_times: [{
        dates: {
            type: [Date],
            required: true,
        },
        location: {
            type: String,
            required: true
        }
    }],
    is_public: {
        type: Boolean,
        default: true
    },
    max_participants: {
        type: Number,
        default: 6
    },
    description: String,
    school: String,
    course_number: String,
    participants: [{
        type: ObjectId,
        ref: 'User'
    }]
});

schema.index({name: 'text', description: 'text', course_number: 'text'});

schema.methods.toJSON = function() {
    const group = this;
    const groupObj = group.toObject();
    
    delete groupObj.__v;

    return groupObj;
}

const StudyGroup = mongoose.model('StudyGroup', schema);

module.exports = StudyGroup;