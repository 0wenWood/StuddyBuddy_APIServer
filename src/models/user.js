const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const schema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('Invalid Email');
            }
        }
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8
    },
    school: {
        type: String,
        required: true
    },
    email_verification: {
        type: Boolean,
        default: false
    },
    majors: [String],
    tokens: [String],
    friends: [ObjectId],
    profile_pic: Buffer
});

schema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

schema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_TOKEN);

    user.tokens.push(token);
    await user.save();

    return token;
};

schema.methods.toJSON = function() {
    const user = this;

    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.email_verification;
    delete userObj.__v;

    return userObj;
};

schema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login - no match");
    }

    return user;
}

const User = mongoose.model('User', schema);

module.exports = User;