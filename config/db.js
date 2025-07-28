const mongoose=require('mongoose');


const connectDB=async(req,res)=>{
    try{
        mongoose.connect(process.env.MONGODB_URI)
        console.log(`database connected successfully`);
    }
    catch(err){
        console.log(`error in connecting database`);
    }
}

module.exports=connectDB;