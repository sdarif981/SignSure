import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
   name:{
    type:String,
    required:true,
    trim:true
   },
   email:{
    type:String,
    required:true,
    unique:true,

   },
   password:{
     type:String,
    required:true,
   },
   public_key:{
    type:String,
   },
   resetPasswordOtp: {
    type: String,
   },
   resetPasswordExpires: {
    type: Date,
   },
   
},{timestamps:true})

export const User=mongoose.model('User',userSchema);