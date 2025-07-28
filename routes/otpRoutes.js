const express=require('express');
const { sendOtp, verifyOtp } = require('../controllers/userController');
const router=express.Router();

router.post('/register/send-otp',sendOtp);
router.post('/register/verify-otp',verifyOtp);

module.exports=router;