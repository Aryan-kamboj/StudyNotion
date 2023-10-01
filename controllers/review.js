const reviewSchema = require("../models/review");
const publicCourses = require("../models/publicCourses");
const course = require("../models/course");
exports.createReview = async (req,res)=>{
    const {response,rating,courseID,userID} = req.body;
    try {
        const reviewCheck = await reviewSchema.findOne({userID:userID,courseID:courseID});
        if(reviewCheck==null){
            // updating the public course array with review details
            {
                const public_course_to_be_updated = await publicCourses.findOne({courseID:courseID});
                const ratingSum = public_course_to_be_updated.ratingSum+rating;
                const ratingCount = public_course_to_be_updated.ratingCount+1;
                await publicCourses.findOneAndUpdate({courseID:courseID},{ratingSum:ratingSum,ratingCount:ratingCount});
            }
            

            // updating the main course array with review details
            {   
                const main_course_to_be_updated = await course.findById(courseID);
                const ratingSum = main_course_to_be_updated.ratingSum+rating;
                const ratingCount = main_course_to_be_updated.ratingCount+1;
                await course.findByIdAndUpdate(courseID,{ratingSum:ratingSum,ratingCount:ratingCount});
            }

            // creating the review in reviews array
            await reviewSchema.create({
                response:response,
                rating:rating,
                courseID:courseID,
                userID:userID,
            })
            res.status(200).json({
                success:true,
            })
        }
        else{
            throw "review already exists" ;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error});
    }
}