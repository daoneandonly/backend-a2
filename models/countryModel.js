const mongoose = require('mongoose');

//Structure in the collection 
const Schema = mongoose.Schema;

//https://mongoosejs.com/docs/guide.html
//Schema structure how to save in the collection
//Objects with a string and all are required
const countrySchema = new Schema({
    countryOne: {
        type: String
    },
    countryTwo: {
        type: String
    },
    countryThree: {
        type: String
    }
});

//mongoose model, Find info, model is based on the Schema
//export to use in app.js
const Countrydata = mongoose.model('Countrydata', countrySchema);
module.exports = Countrydata;