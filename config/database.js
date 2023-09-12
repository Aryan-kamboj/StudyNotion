const mongoose = require("mongoose");
require("dotenv").config();
const URL = process.env.URL;
    exports.connect = ()=>{
        mongoose.connect(URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    .then(()=>{
        console.log("DB connection sucessful");
    })
    .catch((error)=>{
    console.log(`there are some problems with DB connection error = ${error}`);
    process.exit(1);
})}