const express = require("express");
const authentication = express.Router();
const {signUp,logIn,resetPassword,resetPasswordGet,changePassword, otpValidator, otpCaller} = require("../controllers/authentication")
authentication.post("/signup", signUp);
authentication.post("/login", logIn);
authentication.post("/resetPassword",resetPassword)
authentication.get("/resetPassword/:email/:token",resetPasswordGet);
authentication.get("/otp",otpCaller);
authentication.post("/otp",otpValidator)
authentication.post("/changePassword",changePassword);
module.exports = authentication;