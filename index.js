const jwt = require("jsonwebtoken");
const express = require("express");

const app = express();
app.use(express.json());

const fileupload = require("express-fileupload");
app.use(fileupload());

var cookieParser = require('cookie-parser')
app.use(cookieParser());

const DB = require("./config/database");
DB.connect();

const cloudinary = require("./config/cloudinary");
cloudinary.cloudinaryConnect();

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`app is listening at port ${PORT}`)
})
// const { login_token_check } = require("./controllers/authentication");
const secret = process.env.JWT_SECRET;
function login_token_check(token) {
    
    try {
        jwt.verify(token,secret,(err,decoded)=>{
            if(err){  throw(err); }
            else{   return true;  }
        });
    }
    catch (error) { 
        console.log(error);
        return false;  }
}
// function sessionMiddleware(req, res, next) {
//     // Exclude certain routes from session check
//     if (req.path === '/login') {
//         return next(); // Skip session check for /login route
//     }

//     // Check if the session token exists in the cookies
//     const sessionToken = req.cookies.logInCookie;

//     // Perform token validation logic here
//     if (!sessionToken || !login_token_check(sessionToken)) {
//         // console.log(sessionToken);
//         console.log(login_token_check(sessionToken));
//         // return res.redirect('/login'); // Redirect to login page if token is invalid
//         return res.json({
//             message:"redirect to login"
//         });
//     }

//     next(); // Move on to the next middleware or route handler
// }

// Apply sessionMiddleware to all routes except /login
// app.use(sessionMiddleware);
const router = require("./routes/router");

app.use("/api",router);

