const mongoose = require("mongoose");
const publicCourcesSchema = new mongoose.Schema({
        courseName:{
            type:String,
            required:true,
        },
        courseThumbnail:{
            type:String,
            required:true,
        },
        instructorName:{
            type:String,
            required:true,
        },
        courseCatagory:{
            type:String,
            required:true,
        },
        ratingSum:{
            type:Number,
            required:true,
        },
        ratingCount:{
            type:Number,
            required:true,
        },
        tags:[{
            type:String,
            required:true,
        }],
        courseID:{
            type:mongoose.Types.ObjectId,
            required:true,
        }
})
module.exports = mongoose.model("publicCourses",publicCourcesSchema);