var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var mongoosePages = require('mongoose-pages');

var bcrypt = require('bcrypt-nodejs');
var userSchema;

module.exports = function (mongoose){
    userSchema = mongoose.Schema({
        username     : String,
        local: {
            email        : String,
            username     : String,
            password     : String
        },
        facebook: {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        google: {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        role         : { type: String, required: true}
    });

    userSchema.methods.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    };

    userSchema.methods.validPassword = function (password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    userSchema.methods.getUsername = function getUsername() {
        if (this.facebook.name) {
            return this.facebook.name;
        }
        else if (this.google.name) {
            return this.google.name;
        }
        else {
            return this.local.username;
        }
    };

    userSchema.methods.getUserEmail = function getUserEmail() {
        if (this.facebook.email) {
            return this.facebook.email;
        }
        else if (this.google.email) {
            return this.google.email;
        }
        else {
            return this.local.email;
        }
    };

    userSchema.plugin(mongoosePaginate);
    mongoosePages.skip(userSchema); // makes the findPaginated() method available

    mongoose.model('User', userSchema)
};