const {Schema, model} = require('mongoose');

const logsSchema = new Schema({
    user:{
        type: String,
        required: true
    },
    action:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = model('Logs', logsSchema, 'logs');