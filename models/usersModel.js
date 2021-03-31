const mongoose = require('mongoose');
const validator = require('validator');

//Structure in the collection 
const Schema = mongoose.Schema;

//https://mongoosejs.com/docs/guide.html
//Schema structure how to save in the collection
//Objects with a string and all are required
const usersSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
        
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: (value) => {
			return validator.isEmail(value);
		}   
	},
	password: {
		type: String,
		required: true,
		unique: true
	}
});

//mongoose model, Find info, model is based on the Schema
//export to use in app.js
const Users = mongoose.model('Users', usersSchema, 'users');

module.exports = Users;