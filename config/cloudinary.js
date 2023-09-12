require("dotenv").config();
cloudinary = require("cloudinary");
exports.cloudinaryConnect = ()=>{
    try {
        cloudinary.config({ 
            cloud_name: process.env.CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true 
          });
    } catch (error) {
        console.log(error);
    }    
}
