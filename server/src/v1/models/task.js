const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {schemaOptions} = require('./modelOptions')

let currentTime = new Date().toLocaleString("ru-RU", )
let currentDate = new Date()
let currentYear = new Date()

const taskSchema = new Schema({
    section: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    author: {
        type: String
    }, //currentDate.getDate() + "/" + (currentDate.getMonth()+1)  + "/" + currentDate.getFullYear() + "  " + currentTime
    date: {
        type: String
    },
    client: {
        type: String
    },
    quickly: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    mark: {
        type: String
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    count: {
        type: Number
    },
    plan: {
        type: String
    },
    position: {
        type: Number
    }
}, schemaOptions)

module.exports = mongoose.model('Task', taskSchema)