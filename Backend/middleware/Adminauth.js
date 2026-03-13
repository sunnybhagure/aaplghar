const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

exports.protectAdmin = async (req,res,next)=>{

let token

if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
token = req.headers.authorization.split(" ")[1]
}

if(!token){
return res.status(401).json({
success:false,
message:"Admin not authorized"
})
}

try{

const decoded = jwt.verify(token,process.env.JWT_SECRET)

req.admin = await Admin.findById(decoded.id)

if(!req.admin){
return res.status(404).json({
success:false,
message:"Admin not found"
})
}

next()

}catch(err){

return res.status(401).json({
success:false,
message:"Invalid admin token"
})

}

}