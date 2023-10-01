const express = require("express");
const  student = express.Router();
const {createReview} = require("../controllers/review");
student.post("/createReview",createReview);
module.exports = student;