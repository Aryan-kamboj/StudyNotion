const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
    dateOfBirth:{
        type:String,
        trim:true,
    },
    gender:{
        type:String,
        enum:["male","female","other"]
    },
    about:{
        type:String,
        trim:true
    },
    profession:{
        type:String,
        trim:true
    },
    profilePhoto:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
})
mongoose.exports = mongoose.model("profileInfo",profileSchema);