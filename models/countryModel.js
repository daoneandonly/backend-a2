const mongoose = require('mongoose');

//Structure in the collection 
const Schema = mongoose.Schema;

//https://mongoosejs.com/docs/guide.html
//Schema structure how to save in the collection
//Objects with a string and all are required
const countrySchema = new Schema({
    countryOne: {
        type: String,
        required: true
    },
    countryTwo: {
        type: String,
        required: true
    },
    countryThree: {
        type: String,
        required: true
    }
});

//mongoose model, Find info, model is based on the Schema
//export to use in app.js
const Prof = mongoose.model('Prof', countrySchema);
module.exports = Prof;