const express = require("express");
const courseBuilder = express.Router();
const {createCourse,updateCourse, deleteCourse, getCourse, publishCourse, saveFiles} = require("../controllers/courseBuilder")
courseBuilder.post("/createCourse",createCourse);
courseBuilder.post("/saveFiles",saveFiles);
courseBuilder.get("/getCourse",getCourse);
courseBuilder.put("/updateCourse",updateCourse);
courseBuilder.post("/publishCourse",publishCourse);
courseBuilder.delete("/deleteCourse",deleteCourse);
module.exports = courseBuilder;