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
    meeting_times: [{
        date: {
            type: Date,
            required: true,
            validate(value) {
                if (!validator.isISO8601(value.toJSON())) {
                    throw new Error("Invalid Meeting Date");
                } 
            }
        },
        location: {
            type: String,
            required: true
        },
        isWeekly: {
            type: Boolean,
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

schema.methods.toJSON = function() {
    const group = this;
    const groupObj = group.toObject();
    
    delete groupObj.__v;

    return groupObj;
}

const StudyGroup = mongoose.model('StudyGroup', schema);

module.exports = StudyGroup;