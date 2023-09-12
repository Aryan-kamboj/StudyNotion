const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    response:String,
    rating:{
        type:Number,
        enum:[1,2,3,4,5],
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    }
})
module.exports = mongoose.model("review",reviewSchema)