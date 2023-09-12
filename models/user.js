const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    userType:{
        type:String,
        enum:["student","instructor","admin"],
        required:true
    },
    fName:{
        type:String,
        trim:true,
        required:true,
    },
    lName:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
    },
    phone:{
        type:Number,
        trim:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profileInfo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"profileInfo",
    }
})
module.exports = mongoose.model("user",userSchema);