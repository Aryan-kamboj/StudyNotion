require("dotenv").config();
const cloudinary = require('cloudinary');
exports.cloudinaryConnect = ()=>{
    try {
        cloudinary.v2.config({
        cloud_name: 'studynotion',
        api_key: '784814815567426',
        api_secret: '210tXYaA6YKmpxPuvi47sPVKfcg',
        secure: true,
        });
    } catch (error) {
        console.log(error);
    }    
}
