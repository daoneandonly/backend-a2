const mongoose = require('mongoose');

//Structure in the collection
const Schema = mongoose.Schema;

//https://mongoosejs.com/docs/guide.html
//Schema structure how to save in the collection
//Objects with a string and all are required
const profileSchema = new Schema({
	name: {
		type: String
	},
	photo: {
		type: String
	},
	age: {
		type: Number,
		min: 18
	},
	bio: {
		type: String
	}
});

//mongoose model, Find info, model is based on the Schema
//export to use in app.js
const Profile = mongoose.model('Profile', profileSchema, 'profs');
module.exports = Profile;