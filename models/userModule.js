const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber:String,

    otp:String,


    otpExpiration:Date,

});

const User = mongoose.model('User', userSchema);

module.exports= User;