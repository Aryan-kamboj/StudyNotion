const express = require("express");
const router = express.Router();
const {imageUpload} = require("../controllers/imageUpload");
const authentication = require("./authentication");
const courseBuilder = require("./courseBuilder");
router.use("/authentication",authentication)
// console.log(imageUpload);
router.use("/courseBuilder",courseBuilder)
router.post("/image",imageUpload);
module.exports = router;