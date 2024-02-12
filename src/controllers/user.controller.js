import asyncHandler from "../utils/asyncHandler.js"
import {ApiResponse }from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import speakeasy from "speakeasy"
import { sendMail } from "../utils/sendmail.js"
import { deleteResource, uploadResource } from "../utils/cloudinary.js";
import crypto from "crypto"


const generateToken = async (userId) =>{
    try {
      const user = await User.findById(userId)

      const accessToken = await user.generateAccessToken()
  

      return accessToken ;
      
    } catch (error) {
      throw new ApiError(500,"Error While generating access token")
    }
}

const forgotPasswordTokenGenerator = async(email)=>{
    try {

        const user = await User.findOne({email})
        if(!user){
            throw new ApiError(400,"Given Email doesnt exist")
        }
        const forgotPasswordToken = await user.generateForgotPassowordToken()
        user.save();

        return forgotPasswordToken;
        
    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }
}

// Route Functions

const initiateLogin = asyncHandler(async(req,res)=>{

    const {email} = req.body 

    if(!email){
        throw new ApiError(400,"Email is required")
    }

    const ifUserExist = await User.findOne({email}).select("+tempOTP")
      
    console.log(ifUserExist)

    if(ifUserExist && ifUserExist.tempOTP === null){
        throw new ApiError(400,"Already Registered User with same email")
    }

    const secret = speakeasy.generateSecret()

    const otp = speakeasy.totp({
        secret:secret.base32,
        encoding:"base32"
    })

    const otpExpiry = new Date(Date.now() + 1000*60*5 )

    await sendMail(email,otp)

    const user = await User.create({
        email,
        tempOTP:otp,
        tempOTPExpiry:otpExpiry
    })
    
    await user.save()
    
    if(!user){
        throw new ApiError(500,"Error While Creating User")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , "User Creating Initaited")
    )
})

const createUser = asyncHandler(async(req,res)=>{

    const {otp , name , password , email , year , branch , gender} = req.body
    console.log(req.body)
    if(!otp || !name || !password || !email || !gender ){
        throw new ApiError(400 , "All feilds are required")
    }

    const user = await User.findOne({
        tempOTP:otp,
        tempOTPExpiry:{$gt: Date.now()}
    })


    if(!user){
        await User.deleteOne({email})
        throw new ApiError(400,"OTP Expired or Incorrect OTP")
    }

    if(user.email != email){
        throw new ApiError(400, "Registration gmail and input gmail dont match")
    }
    const randomIndex = Math.floor(Math.random() * 10) + 1;

    const URL = await uploadResource(`temp/${gender}_${randomIndex}.png`)

    user.name = name
    user.password = password
    user.tempOTP = null
    user.tempOTPExpiry = null
    user.year = year
    user.branch = branch
    user.avatar = URL.secure_url
    user.gender = gender
    
    await user.save()


    return res
    .status(200)
    .json(
        new ApiResponse(200,"Success",user)
    )

})

// login 

const login = asyncHandler(async(req,res)=>{

    const { email , password } = req.body;

    if(!email || !password){
        throw new ApiError(400,"All Fields are required")
    }
     
    const user = await User.findOne({email}).select("+password");

    if(!user){
        throw new ApiError(400,"No User exist with following email")
    }

    const isValid = await user.isPasswordValid(password);


    if(!isValid){
        throw new ApiError(400,"Incorrect Password")
    }
      
    
    const accessToken = await generateToken(user._id);

    const loggedInUserDetails = await User.findById(user._id)

    const options = {
        httpOnly:true,
        secure:true,
        SameSite:'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }


    return res
    .cookie("accessToken",accessToken,options)
    .status(200)
    .json(
        new ApiResponse(200,"User Login Success",{loggedInUserDetails,accessToken})
    )


})

// logout 

const logout = asyncHandler(async(req,res)=>{
   
    console.log("logout")
    
    const options = {
        httpOnly:true,
        secure:true,
        SameSite:'Strict',
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(200,"User logout success")
    )
})

const forgotPassword = asyncHandler(async(req,res)=>{
    

    const {email} = req.body

    if(!email){
        throw new ApiError(400,"Kindly Provide Email")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(400,"No User Exist with given email")
    }

    const forgotToken = await forgotPasswordTokenGenerator(email);

    const resetPasswordURL = `http://localhost:8090/api/v1/user/reset-password/${forgotToken}`


    await sendMail(email,resetPasswordURL)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Reset Email Sent Successfully")
    )
})

const resetPassword = asyncHandler(async(req,res)=>{
  
    const resetToken = req.params.resetToken;
    const {password} = req.body;

    if(!resetToken){
        throw new ApiError(400,"Invaild reset token")
    }

    const encryptedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({forgotPasswordToken:encryptedResetToken , forgotPasswordExpiry:{$gt:Date.now()}})

    console.log(user)

    if(!user){
        throw new ApiError(400,"Session Expired Try Again Later")
    }

    user.password = password ;

    user.forgotPasswordToken = null;
    user.forgotPasswordExpiry = null;

    await user.save();
     
    console.log(user)
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Reset Password Success")
    )
    
})

const updateProfile = asyncHandler(async(req,res)=>{

    const {year,branch,name} = req.body;

    console.log("flag")

    const user = await User.findByIdAndUpdate(req.user._id,{
        year,
        branch,
        name
    },{new:true})

    console.log("flag")

    if(!user){
        throw new ApiError(500,"Error While Updating Profile")
    }

    console.log("flag")

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Profile Updated Successfully",user)
    )

})

const serachUser =  asyncHandler(async(req,res)=>{

    const {name} = req.params;

    if(!name){
        throw new ApiError(400,"Kindly Provide Name")
    }

    const user = await User.find({
      name:{$regex : new RegExp(name,'igmu')}
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,"User Search Success", user)
    )
})

const getAllUsers = asyncHandler(async (req, res) => {

     let { page, limit } = req.params;
    const skip = (page - 1) * limit;

    if(!page){
        page = 1;
    }
  
    const users = await User.find({tempOTP:null , _id: { $ne: req.user._id } })
      .skip(skip)
      .limit(limit)
      .exec();
   

    if(users.length === 0){
        return res.status(200).json(new ApiResponse(200,"No Users Found"))
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"User Fetch Success", users )
    );
  });

  
const userProfile = asyncHandler(async(req,res)=>{

    const user = await User.findById(req.user?._id)
   
   return res
   .status(200)
   .json(
       new ApiResponse(200,"User Data Fetched Success",user)
   )
})

const filter = asyncHandler(async (req, res) => {

    let { page, limit } = req.params;
   const skip = (page - 1) * limit;
    const {year,branch} = req.body;
    let users;
   if(!page){
       page = 1;
   }

   if(year && branch){
     users = await User.find({tempOTP:null , _id: { $ne: req.user._id } , year , branch})
    .skip(skip)
    .limit(limit)
    .exec();

   }
   else if(year && !branch){
    
     users = await User.find({tempOTP:null , _id: { $ne: req.user._id } , year })
     .skip(skip)
     .limit(limit)
     .exec();

   }
   else if(!year && branch){
    users = await User.find({tempOTP:null , _id: { $ne: req.user._id } , branch })
    .skip(skip)
    .limit(limit)
    .exec();
   }
 
   
   if(users.length === 0){
        
       return res.status(200).json(new ApiResponse(200,"No Users Found"))
   }

   return res
   .status(200)
   .json(
       new ApiResponse(200,"User Fetch Success", users)
   );
 });

 

export {
    initiateLogin,
    createUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    serachUser,
    getAllUsers,
    userProfile,
    filter
}
