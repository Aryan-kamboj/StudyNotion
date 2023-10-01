const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    response:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        enum:[1,2,3,4,5],
        required:true,
    },
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course",
        required:true,
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    }
})
module.exports = mongoose.model("review",reviewSchema)