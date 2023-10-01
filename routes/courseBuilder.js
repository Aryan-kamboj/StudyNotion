const express = require("express");
const courseBuilder = express.Router();
const {createCourse,updateCourse, deleteCourse, getCourse, publishCourse} = require("../controllers/courseBuilder")
courseBuilder.post("/createCourse",createCourse);
courseBuilder.get("/getCourse",getCourse)
courseBuilder.put("/updateCourse",updateCourse);
courseBuilder.post("/publishCourse",publishCourse);
courseBuilder.delete("/deleteCourse",deleteCourse);
module.exports = courseBuilder;