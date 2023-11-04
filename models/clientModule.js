const mongoose=require('mongoose');

const clientSchema = new mongoose.Schema({

    clientName:String,
    serviceName:String,
    serviceDate:String,
    serviceTime:String,
    professional:String,
    phoneNumber:String,

});

const Client = mongoose.model('Client', clientSchema);

module.exports= Client;