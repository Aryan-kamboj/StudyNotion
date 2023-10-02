const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const courseSchema = require("../models/course");
const instructorSchema = require("../models/instructor");
const userSchema = require("../models/user");
const publicCourses = require("../models/publicCourses");
const reviewSchema = require("../models/review");
const { otpVerification, otpSender } = require("./authentication");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

async function uploadFileToCloudinary(file, folder, quality) {
    try {
        const options = {folder};
        console.log("path is "+file);
        if(quality) {
            options.quality = quality;
        }
        options.resource_type = "auto";
        console.log("hii");
        const res = await cloudinary.uploader.upload(file, options);
        return res;
    } catch (error) {
        return {success:false,error:error};
    }
}

exports.saveFiles = async (req,res)=>{
        try {
        const logInCookie = req.cookies.logInCookie;
        const loginInfo = await jwt.verify(logInCookie,secret);
        const email = loginInfo.user;
        const file = req.files.task;
        console.log(file);
        //making a direcotry with instructor name to prevent clashes amoung different users using the service 
        if(!fs.existsSync(`${__dirname}/files/${email}`))
            fs.mkdirSync(`${__dirname}/files/${email}`);

        // move file to the folder
        let path = __dirname + "/files/"+ email+"/" +file.name;
        //add path to the move fucntion
        file.mv(path , (err) => {
            // console.log(err);
        });
        const response = await uploadFileToCloudinary(path,"studyNotion");
        console.log(response);
        if(response.success==false){
            fs.rmSync(path);
            throw response.error;
        }
        else{
            console.log(response);
            fs.rmSync(path);
            res.status(200).json({
                success:true,
                secure_url:response.secure_url,
            })
        }
        
    } catch (error) {
        console.error(error);
        res.status(500);
    }
}
exports.createCourse = async (req,res) =>{
    // this is used for adding the course to the database
    // all the videos are to be uploaded before making this entry
    try {
        const logInCookie = req.cookies.logInCookie;
        
        // checking login info of the instructor 
        const loginInfo = await jwt.verify(logInCookie,secret);
        const email = loginInfo.user;
        const instructor = await instructorSchema.findOne({email});

        // getting all the body data out of req and parsing it 
        const {courseName,courseDetails,isPublic,dateCreated,sections} = req.body;
        console.log(req.body);
        const newCourse = await courseSchema.create({
            instructor:instructor,
            courseName:courseName,
            courseDetails:courseDetails,
            ratingSum:0,
            ratingCount:0,
            isPublic:isPublic,
            dateCreated:dateCreated,
            sections:sections,
        })
        console.log(newCourse);
        await instructorSchema.findOneAndUpdate({email},{$push: {myCources: newCourse._id} }, {new: true});
        res.status(200).json({
            success:true,
            message:"course created"
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error:error,
            message:"failllllll",
        })
    }
}

//gets the course details form the backend to the instructor's dashbord for update couse and couse details
exports.getCourse = async (req,res)=>{
    const {courseID}=req.body;
    try{
        const courseDetails = await courseSchema.findById(courseID);
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
        const finalCourse = await courseSchema.findByIdAndUpdate(courseID,updatedCourse);
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
            const finalCourse = await courseSchema.findByIdAndUpdate(courseID,updatedCourse);
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