const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const course = require("../models/course");
const instructorSchema = require("../models/instructor");
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
    // console.log(req.body);
    // console.log(typeof courseName, courseName);
    // console.log(typeof courseDetails, courseDetails)
    // console.log(typeof isPublic, isPublic)
    // console.log(typeof dateCreated, dateCreated)
    // console.log(typeof reviews, reviews)
    // console.log(typeof enrolledStudents, enrolledStudents)
    // console.log(typeof sections, sections)

    // console.log(loginInfo);
    res.send();
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