const express = require("express");
const courseBuilder = express.Router();
const {createCourse,updateCourse, deleteCourse} = require("../controllers/courseBuilder")
courseBuilder.post("/createCourse",createCourse);
courseBuilder.put("/updateCourse",updateCourse);
courseBuilder.delete("/deleteCourse",deleteCourse);
module.exports = courseBuilder;