const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const course = require("../models/course");
const instructorSchema = require("../models/instructor");
const userSchema = require("../models/user");
const publicCourses = require("../models/publicCourses");
const reviewSchema = require("../models/review");
const { otpVerification, otpSender } = require("./authentication");
exports.createCourse = async (req,res) =>{
    const logInCookie = req.cookies.logInCookie;
    const {courseName,courseDetails,isPublic,dateCreated,reviews,enrolledStudents,sections} = req.body;
    const loginInfo = await jwt.verify(logInCookie,secret);
    const email = loginInfo.user
    const instructor = await instructorSchema.findOne({email});
    console.log(instructor);
    const newCourse = await course.create({
        courseName:courseName,
        instructor:instructor._id,
        courseDetails:courseDetails,
        isPublic:isPublic,
        dateCreated:dateCreated,
        reviews:reviews,
        enrolledStudents:enrolledStudents,
        sections:sections,
    })
    const updatedInstructor = await instructorSchema.findOneAndUpdate({email},{$push: {myCources: newCourse._id} }, {new: true});
    console.log(newCourse);
    console.log(updatedInstructor);
// {console.log(req.body);
    // console.log(typeof courseName, courseName);
    // console.log(typeof courseDetails, courseDetails)
    // console.log(typeof isPublic, isPublic)
    // console.log(typeof dateCreated, dateCreated)
    // console.log(typeof reviews, reviews)
    // console.log(typeof enrolledStudents, enrolledStudents)
    // console.log(typeof sections, sections)
    // console.log(loginInfo);}
    res.send();
}

//gets the course details form the backend to the instructor's dashbord for update couse and couse details
exports.getCourse = async (req,res)=>{
    const {courseID}=req.body;
    try{
        const courseDetails = await course.findById(courseID);
        // console.log(courseDetails);
        res.status(200).send(courseDetails);
    }
    catch(err){
        console.lod(err);
        res.send();
    }
    
}
exports.updateCourse = async (req,res) =>{
    const {courseID,updatedCourse} = req.body;
    try {
        const finalCourse = await course.findByIdAndUpdate(courseID,updatedCourse);
        console.log(finalCourse)
    } catch (error) {
        // console.log(error);
    }
    res.send();
}

// publish the couse on the website only if isPublic flag of the couse schema is marked true and a 
// published course can't be updated on fly it needs to be 
exports.publishCourse  = async (req,res) => {
    const {courseID,updatedCourse} = req.body;
    try {
        if(updatedCourse.isPublic==false){
            throw "isPublic flag marked false";
        }
        else{
            const finalCourse = await course.findByIdAndUpdate(courseID,updatedCourse);
            const {courseName,courseDetails} = req.body.updatedCourse;

            const instructorDetails = await instructorSchema.findById(finalCourse.instructor);
            const instructorUser = await userSchema.findById(instructorDetails.user);
            const instructorName = `${instructorUser.fName}`+` ${instructorUser.lName}`;

            const allReviews = await reviewSchema.find({courseID:courseID});
            const ratingSum = allReviews.reduce((total,review)=>{
                return total+review.rating;
            },0);
            const ratingCount = allReviews.length;
            
            const alreadyPublicCheck = await publicCourses.findOne({courseID:courseID});
            if(alreadyPublicCheck==null)
            {
                await publicCourses.create({
                    courseID:courseID,
                    courseName:courseName,
                    courseThumbnail:courseDetails.thumbnail,
                    instructorName:instructorName,
                    courseCatagory:courseDetails.courseCatagory,
                    // to prevent all the ratings form disappearing when somone edits and publishes a course again 
                    // we use a seperate rating/review schema ...... in which we search the given course id and fetch all the reviews
                    // to give the avg rating 
                    ratingSum:ratingSum,
                    ratingCount:ratingCount,
                })
                res.status(200).json({
                    success:true,
                    message:"Course is now live"
                });
            }
            else
                throw "course already public";
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error:error,
            success:false
        })
    }
    
}
//delete couse is a high risk operation so OTP verification is to be done to delete a course (need help implimenting that)
exports.deleteCourse = async (req,res)=>{
    // console.log(req.cookies.logInCookie);
    const loginToken = req.cookies.logInCookie;
    try {
        const decrypted = await jwt.verify(loginToken,secret);
        const otpVerifiedToken = req.cookie.otpVerifiedCookie;

        const decryptedOtpVerified = await jwt.verify(otpVerifiedToken,secret);
        
    } catch (error) {
        
    }
   

    
    


    //react will check if there is an otpVerifiedCookie avilabe or not 
    
    if(!("otpVerifiedCookie" in req.cookies)){
        res.clearCookie("otpVerifiedCookie");
    }
    // console.log(decrypted);
    const email = decrypted.user;
    const otpFor = "deleteCourse";
    const senderResponse = await otpSender(email,otpFor);
    res.cookie("otpVerificationCookie",senderResponse.token)
    res.redirect("/otpForm");
    // {
    //     success: true,
    //     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFyeWFua2FtYm96ekBnbWFpbC5jb20iLCJpYXQiOjE2OTI1MjkwMDYsImV4cCI6MTY5MjUyOTkwNn0.9SIL1ut_4yVSvTfKlEbnEiSvTJmtHXwCZHwB_DNvzM0'
    //   }
    console.log(senderResponse);
    // res.send();
}