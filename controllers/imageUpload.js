exports.imageUpload = (req,res)=>{
    const {name,email} = req.body
    console.log(name,email);
    console.log(req.files)
    res.json({
        success:true
    })
}