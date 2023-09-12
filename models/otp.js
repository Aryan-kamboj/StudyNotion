const mongoose = require("mongoose");
const otpSchema = mongoose.Schema({
    otp:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    attempts:{
        type:Number,
        enum:[0,1,2,3],
        required:true,
    },
    otpFor:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model("otpObj",otpSchema);