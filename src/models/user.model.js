import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crpyto from "crypto"

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        unqiue:true,
        required:true
    },
    tempOTP:{
        type:Number,
        select:false
    },
    tempOTPExpiry:{
        type:Date,
        select:false
    },
    password:{
        type:String,
        select:false
    },
    name:{
        type:String,
    },
    branch:{
        type:String
    },
    year:{
        type:String
    },
    gender:{
        type:String
    },
    avatar:{
        type:String
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date

},{timestamps:true})


userSchema.pre("save", async function(next){

    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10);
    
    next()
})

userSchema.methods.isPasswordValid = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
   
    return jwt.sign({
        _id:this._id,
        email:this.email,
        role:this.role,
    }, 
    process.env.SECRETACCESSKEYJWT,
    {
        expiresIn:process.env.JWTEXPIRY
    })
}

userSchema.methods.generateForgotPassowordToken = function(){
   const resetToken = crpyto.randomBytes(16).toString('hex')
   const encryptedResetToken = crpyto.createHash('sha256').update(resetToken).digest('hex')
   this.forgotPasswordToken = encryptedResetToken;
   this.forgotPasswordExpiry = Date.now() + 1000*60*5;
   return resetToken;
}

export const User = mongoose.model("User",userSchema)