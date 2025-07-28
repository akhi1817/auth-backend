const mongoose=require('mongoose');
const User=require('../models/userModel.js');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const transporter = require('../config/mailer.js');
const Otp=require('../models/otpModel.js');




//register user
const registerUser=async(req,res)=>{
    try{
        const {username,email,password} =req.body;

        if(!username || !email || !password){
            return res.status(400).json({message:`please provide credentials`});
        }

        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:`User Already exists.`});
        }

        const hashPassword=await bcrypt.hash(password,10);

        const newUser = new User({
            username,
            email,
            password:hashPassword
        })

        const savedUser= await newUser.save();

        await transporter.sendMail({
            from:process.env.EMAIL_FROM,
            to:email,
            subject:'Registration successful',
            html:`<h2> Hello ${username},</h2><p>You have successfully registered on our platform !</p>`
        })

        res.status(201).json({message:`User registered successfully`,data:savedUser,error:false,success:true});


    }
    catch(err){
        res.status(400).json({message:`error in registering user`,data:err,error:true,success:false});
    }
}


//login user
const loginUser=async(req,res)=>{
    try{
        const {email , password} =req.body;
        
        if(!email || !password){
            return res.status(400).json({message:`Please provide credentials`});
        }

        const existingUser=await User.findOne({email});

        if(!existingUser){
            return res.status(400).json({message:`Invalid credentials`})
        }

        const comparePassword= await bcrypt.compare(password,existingUser.password);

        if(!comparePassword){
            return res.status(400).json({message:`Invalid credentials`})
        }

        const token= jwt.sign({userId:existingUser._id},process.env.JWT_SECRET_KEY,{expiresIn:`1d`});

        res.cookie('token',token ,{
            httpOnly:true,
            secure:true,
            sameSite:'Lax',
            maxAge:24*60*60*1000,
        })

        res.status(200).json({message:`Login successful`,data:token,existingUser,error:false,success:true});
    }
    catch(err){
        res.status(400).json({message:`error in logging user`,data:err,error:true,success:false});
    }
}


//logout user
const logoutUser=async(req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:true,
            sameSite:'Lax',
        });
        res.status(200).json({message:`Logout successfully`,error:false,success:true});
    }
     catch(err){
        res.status(400).json({message:`error in logout user`,data:err,error:true,success:false});
    }
}

//send otp
const sendOtp=async(req,res)=>{
    try{

        const {username,email,password}=req.body;

        
        if(!username || !email || !password){
            return res.status(400).json({message:`please provide credentials`});
        }

        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:`User Already exists.`});
        }

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt= new Date(Date.now()+5 * 60 * 1000);
        const hashPassword= await bcrypt.hash(password,10);

        //delete exisitng otp
        await Otp.deleteMany({email});

        //saved otp
         await Otp.create({
            email,
            otp:otpCode,
            expiresAt
        })
        


        //send email
        await transporter.sendMail({
            from:process.env.EMAIL_FROM,
            to:email,
            subject:`Verify your email with OTP `,
            html:`<h2> hello ${username}</h2>,<p>Your otp is <b>${otpCode}</b>.it will expires in 5 minutes.</p>`
        })

        res.status(200).json({message:`Otp sent to email`,data:{
            username,email,password:hashPassword
        }})

    }
    catch(err){
        res.status(500).json({message:`error in sending otp`,data:err,error:true,success:false});
    }
}

//verify otp
const verifyOtp=async(req,res)=>{
    try{
        const {username,otp,email,password}=req.body;

        if(!username || !otp || !email || !password){
            return res.status(400).json({message:`All fields are required`,error:true,success:false});
        }

        const otpRecord=await Otp.findOne({email});

        if(!otpRecord){
            return res.status(400).json({message:`OTP not found. Please try again`,error:true,success:false});
        }

        if(otpRecord.otp !== otp){
            return res.status(400).json({message:`Invalid OTP`,error:true,success:false});
        }

        if(otpRecord.expiresAt < Date.now()){
            await Otp.deleteMany({email});
            return res.status(400).json({message:`OTP expired`,error:true,success:false});
        }

        
            const existingUser = await User.findOne({ email });
                    if (existingUser) {
                            return res.status(400).json({ message: 'User already exists', error: true, success: false });
                        }

                    const hashedPassword = await bcrypt.hash(password, 10);

        const newUser= new User({
            username,
            email,
            password:hashedPassword
        })
        const savedUser= await newUser.save();

        await Otp.deleteMany({email});

        res.status(201).json({message:`User registered Successfully. Now you can login`,data:savedUser,error:false,success:true});

    }
   catch (err) {
    res.status(500).json({ message: 'OTP verification error', error: err.message,error:true,success:false });
  }
}

module.exports={
    registerUser,loginUser,logoutUser,sendOtp,verifyOtp
}