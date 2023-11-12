const mongoose = require('mongoose');
const {Schema} = mongoose;

const AdminSchema = new mongoose.Schema({
    email:{type:String, unique:true},
    password:String,

});

const AdminModule=mongoose.model("Admin", AdminSchema);

module.exports= AdminModule;