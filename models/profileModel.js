const mongoose = require('mongoose');
const validator = require('validator');

//Structure in the collection
const Schema = mongoose.Schema;

//https://mongoosejs.com/docs/guide.html
const newProfileSchema = new Schema({
	email: { 
		type: String,
		unique: true,
		lowercase: true,
		validate: (value) => {
			return validator.isEmail(value);
		}   
	},
	password: {
		type: String,
	},
	profileData: {
		firstName: { 
			type: String,
			lowercase: true
		},
		LastName: { 
			type: String,
			lowercase: true
		},
		age: { 
			type: Number
		},
		bio: { 
			type: String
		},
		photo: { 
			type: String
		},
		gender: { 
			type: String
		}, 
		countries: { 
			type: Array
		},
		profilePicturePath: {
			type: String
		},
		preferences: {
			gender: { 
				type: String
			},
			minAge: { 
				type: Number
			},
			maxAge: { 
				type: Number
			},
			maxDistance: { 
				type: String
			}
		}
	}
});

//mongoose model, Find info, model is based on the Schema
//export to use in app.js
const newProfile = mongoose.model('newProfile', newProfileSchema, 'profiles');
module.exports = newProfile;