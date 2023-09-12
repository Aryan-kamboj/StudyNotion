const { JsonWebTokenError } = require("jsonwebtoken");
const user = require("../models/user");
const otpObj = require("../models/otp");
const resetLinkObj = require("../models/passwordResetLink")
const student = require("../models/student");
const instructor = require("../models/instructor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const saltRounds = Number(process.env.SALT_ROUNDS);
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

const secret = process.env.JWT_SECRET;

exports.signUp = async (req,res) => {
    try {
        const  {userType,fName,lName,email,phone,password} = req.body;
        // console.log(await user.findOne({email}));
        if(await user.findOne({email})){
            const error = {
                messeage:"Email already exists"
            }
            throw(error);
        }
        const hashedPass = await bcrypt.hash(password,saltRounds);
        const newUser = await user.create({userType,fName,lName,email,phone,password:hashedPass});
        // console.log(newUser);
        const userId = newUser._id;
        console.log(userId);
        if(userType == "student"){
            try {
                const newStudent = await student.create({
                    user:userId,
                    email:email,
                    enrolledCources:[],
                    wishlist:[],
                    purchaseHistory:[]
                })
                // console.log(newStudent);
            } catch (error) {
                console.log(error);
            }
            
        }
        else if(userType == "instructor"){
            try {
                const newInstructor = await instructor.create({
                    user:userId,
                    email:email,
                })
                // console.log(newStudent);
            } catch (error) {
                console.log(error);
            }
        }
       
        res.status(200).json({
            success:true,
        })
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            success:false,
            error:error
        });
    }
}
function login_token_check(token) {
    
    try {
        jwt.verify(token,secret,(err,decoded)=>{
            if(err){  throw(err); }
            else{   return true;  }
        });
    }
    catch (error) { return false;  }
}
exports.login_token_check = login_token_check;
exports.logIn = async (req,res) => {
    // console.log(Object.keys(req.cookies).length === 0);
    if("logInCookie" in req.cookies){  // object even if empty ({}) give a truthy value so we have to check wheather the cookies object have any key:value paires in it
        // console.log(login_token_check(req.cookies.logInCookie));
        if(login_token_check(req.cookies.logInCookie))
            {
                // console.log("hii")
                res.status(200).send({
                    success:true,
                    messeage:"User logged in",
                })
            }
        else{
            res.clearCookie("logInCookie")
            res.status(440).send({
                success:false,
                messeage:"Session expired please log in again",
            })
        }
    }  
    else {  
        try {
                const {email,userType,password} = req.body;
                const requestedUser = await user.findOne({email});
                const userTypeCorrect = (userType==requestedUser.userType);
                if (!userTypeCorrect){
                    res.status(403).json({
                        success:false,
                        response:"incorrect user type selected"
                    })
                }
                else{
                    const passwordCorrect = await bcrypt.compare(password,requestedUser.password);
                    if(!passwordCorrect){
                        throw ("password is incorrect");
                    }
                    else{
                        const token = jwt.sign({
                                user:email,
                                userType:userType,
                                isLoggedIn:true,
                            },
                            secret,
                            {expiresIn:"2d"});
                        // console.log(token)
                        res.cookie("logInCookie" , token);
                        res.status(200).send({
                            success:true,
                            messeage:"User logged in",
                            token:token
                        });
                    }
                }
        } catch (error) {
                res.status(401).json({
                    error:error
                })
        }
    }
}

exports.resetPassword = async(req,res) =>{
    const email = req.body.email;

    // checking if user exists in DB
    const requestedUser = await user.findOne({email});
    if(requestedUser===null)
    {
        res.status(403).json({
            success:false,
            messeage:"Email not registered ",
        })
    }
    else{
        const reset_secret = email+secret;
        //checking if some link for reseting password is already there in the database and deleting it 
        await resetLinkObj.findOneAndDelete({email});

        //creating a jwt token to make a unique link
        const token = jwt.sign({
            email:email
        },reset_secret,{expiresIn:"15m"});

        //creating the link 
        const resetLink = `http://localhost:4000/api/authentication/resetPassword/${email}/${token}`;

        //creating the entry of that link in the database
        await resetLinkObj.create({email:email,token:token,expiry:Date.now()+1000*60*15});

        //sending the email to user 
        const info = await transporter.sendMail({
            from: 'Study Notion', // sender address
            to: `${email}`, // list of receivers
            subject: "ALERT -> Password reset link", // Subject line
            text: "", // plain text body
            html: `<h1>ALERT</h1><br/>
            <b>This is a one time usage password reset link valid for next 15 min only <br/> ******* DO NOT SHARE WITH ANYONE ****** </b>
            <br/>
            <p>${resetLink}<p>`, // html body
          });
        res.status(200).json({
            messeage:"Password reset link sent to your registerd email"
        });
    }
    

}

exports.resetPasswordGet = async (req,res)=>{
    const {email,token} = req.params;
    const password = req.body.password;
    try {
        if(!await resetLinkObj.findOne({email}))
        {
            throw(  {success:false, messeage:"Link expired please generate a new one",} )  ;
        }
        //verifying if the jwt token recived from user is expired or not
        const decoded = jwt.verify(token,email+secret);
        try {
            //checking if the token recived from the user contains the same email as the URL
            if(decoded.email === email)
            {
                //hashing and updating the password in the database
                const hash = await bcrypt.hash( password, saltRounds );
                await user.findOneAndUpdate({email},{password:hash});
                
                // deleting the used link from the database
                await resetLinkObj.findOneAndDelete({email});
                res.status(200).json({
                    success:true,
                    response:"Password reset succesful"
                })
            }
            else{throw("invalid email id")}
        } catch (error) {
            res.status(400).json({
                error:"Request is temperd",
                messeage:error,
            })
        }
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            error:error,
        })
    }
}

exports.changePassword = async(req,res)=>{
    const token = req.cookies.logInCookie;
    const {oldPassword,newPassword} = req.body;
    const decoded = await jwt.verify(token,secret);
    const email = decoded.user;
    const requestedUser = await user.findOne({email});
    const oldHash = requestedUser.password;
    if(await bcrypt.compare(oldPassword,oldHash))
    {
        const newHash = await bcrypt.hash(newPassword,saltRounds);

        await user.findOneAndUpdate({email},{password:newHash});
        res.status(200).json({
            success:true,
            messeage:"Password change succesful"
        })
    }
    else{
        res.status(400).json({
            success:false,
            messeage:"incorrect password entered"
        })
    }
}

async function otpSender (email,otpFor){
    try {
        await otpObj.findOneAndDelete({email})
        const otp = Math.floor(Math.random()*1000000);
        await otpObj.create({
            otp:otp,
            email:email,
            expiry:Date.now()+15*60*1000,
            attempts:3,
            otpFor:otpFor
        });
        const token = jwt.sign({email:email,otpFor:otpFor},secret,{expiresIn:"15m"});
        const info = await transporter.sendMail({
            from: 'Study Notion', // sender address
            to: `${email}`, // list of receivers
            subject: "ALERT -> Email verification", // Subject line
            text: "", // plain text body
            html: `<h1>ALERT</h1><br/>
            <b>This is a one time password valid for next 15 min only <br/> ******* DO NOT SHARE WITH ANYONE ****** </b>
            <br/>
            <p>${otp}<p>`, // html body
        });
        return {success:true,token:token};
    } catch (error) {
        return {success:false,err:error};
    }
    
}
async function otpChecker (tokenFromCookie,otp) {
    const decryptedToken = await jwt.verify(tokenFromCookie,secret);
    const otpFor = decryptedToken.otpFor;
    const email = decryptedToken.email;
    const dbOtp = await otpObj.findOne({email});
    if(dbOtp.attempts>0&&dbOtp.expiry>Date.now())
        {
            if(otp==dbOtp.otp&&otpFor==dbOtp.otpFor)
            {
                await otpObj.findOneAndDelete({email});
                return {success:true,otpFor:otpFor}
            }
            else{
                await otpObj.findOneAndUpdate({email},{attempts:(dbOtp.attempts-1)});
                return {success:false, err:"Invalid otp"};
            }
        }
    else{
        await otpObj.findOneAndDelete({email});
                return ({
                success:false,
                err:"expired"
            })
        }
}
exports.otpChecker = otpChecker;
exports.otpSender = otpSender;
exports.otpCaller = async (req,res)=>{
    const {email,otpFor} = req.body;
    const response = await otpSender(email,otpFor);
    if(response.success==true){
        res.cookie("otpVerificationCookie" , response.token);
        res.status(200).json({
            success:true,
            messeage:"OTP sent to email",
        });
    }
    else{
        res.status(400).json({
            error:response.err,
            messeage:"there was some error"
       })
    }
}

exports.otpValidator = async(req,res)=>{
        const otp = req.body.otp;
        if(!("otpVerificationCookie" in req.cookies)){
            res.status(400).json({
                error:"no otpVerificationCookie"
            })
        }
        else{
            //check if otp is expired or not 
            const tokenFromCookie = req.cookies.otpVerificationCookie;
            const checkOtp = await otpChecker(tokenFromCookie,otp);

            //sending otp verified cookie to client
            if(checkOtp.success==true){
                res.clearCookie("otpVerificationCookie");
                const otpVerifiedToken = jwt({otpVerifiedFor:checkOtp.otpFor},secret,{expiresIn:"15m"});
                res.cookies("otpVerifiedCookie",otpVerifiedToken);
                res.status(200).json({
                    success:true,
                    messeage:"otp verification succesful",
                })
            } 

            else if(checkOtp.success==false && checkOtp.err=="expired"){
                res.clearCookie("otpVerificationCookie");
                res.status(400).json({
                    success:false,
                    error:checkOtp.err,
                });
            }
            else{
                res.status(400).json({
                    success:false,
                    error:"A problem has accured"
                })
            }
        // console.log(error);
    }
}