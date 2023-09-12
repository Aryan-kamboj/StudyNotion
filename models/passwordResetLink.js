const mongoose = require("mongoose");
const resetLinkSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true,
    },
    expiry:{
        type:Date,
        require:true
    }
})

module.exports = mongoose.model("resetLink",resetLinkSchema);