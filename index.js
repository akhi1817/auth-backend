const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const dotenv=require('dotenv');
dotenv.config();
const connectDB=require('./config/db.js');
const userRoutes=require('./routes/userRoutes.js');
const authRoutes=require('./routes/authRoutes.js');
const otpRoutes=require('./routes/otpRoutes.js');

const app=express();


//database connection
connectDB();

//middleware
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.end("home page");
})

//routes
app.use('/api/auth',userRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/auth',otpRoutes);


const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
})