const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true,
        default: 'user'
    },
    image:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    registerDate:{
        type: Date,
        default: Date.now,
        required: true
    },
    lastLogin:{
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = model('Users', userSchema, 'users');