const mongoose = require('mongoose');

const Student = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nim: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    study: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('StudentModel', Student);