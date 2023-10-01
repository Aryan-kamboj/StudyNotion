const express = require("express");
const router = express.Router();
const {imageUpload} = require("../controllers/imageUpload");
const authentication = require("./authentication");
const courseBuilder = require("./courseBuilder");
const student = require("./student");
router.use("/authentication",authentication);
// console.log(imageUpload);
router.use("/courseBuilder",courseBuilder);
router.use("/student",student)
router.post("/image",imageUpload);
module.exports = router;