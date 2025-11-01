import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import userRoute from './routes/user.route.js';
import keyRoute from './routes/key.route.js';
dotenv.config();
const app =express();
const PORT=process.env.PORT || 5000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173',"https://sign-sure.vercel.app"], 
  credentials: true
}));
app.use(cookieParser());
app.use("/api/user",userRoute);
app.use("/api/key",keyRoute);

app.listen(PORT,()=>{
  connectDB();
  console.log(`server started listening on  http://localhost:${PORT}`);
})