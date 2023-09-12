const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    email:{
        type:String,
        required:true,
    },
    enrolledCources:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course"
    }],
    wishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course"
    }],
    purchaseHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course"
    }]
})
module.exports = mongoose.model("student",studentSchema);