const mongoose = require("mongoose");
const instructorSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    email:{
        type:String,
        required:true,
    },
    myCources:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course"
    }]
})
module.exports = mongoose.model("instructor",instructorSchema);