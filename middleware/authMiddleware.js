const jwt=require('jsonwebtoken');


const authMiddleware =(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        return res.status(401).json({message:`Unauthorized access...No token`,error:true,success:false});
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user=decoded;
        next();
    }
    catch(err){
        res.status(401).json({message:`Unauthorized access...No token`,error:true,success:false});
    }
}

module.exports=authMiddleware;