import { Letter } from "../models/letters.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {containsForbiddenWord} from "../utils/moderation.js"
import { decrypt } from "../models/letters.model.js";



const sendLetter = asyncHandler(async(req,res)=>{

    const {content }= req.body;
    const {to} = req.params;
    const from = req.user._id;
    const toBePublishedAt = new Date('2024-02-14');

    const existingLetter = await Letter.findOne({to,from})

    if(existingLetter){
        throw new ApiError(400,"Your Limit has already reached")
    }

    if(!content){
        throw new ApiError(400,"Letter Data is required")
    }

    // Moderation 

    if (containsForbiddenWord(content)) {
        throw new ApiError(400, "Content contains forbidden words");
    }
   
    const letter = await Letter.create({to,from,content,toBePublishedAt})
    await letter.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200 , "Letter Sent Successfully")
    )
})

// Sent Letters API

const sentLetters = asyncHandler(async(req,res)=>{

    let letterData = await Letter.aggregate([
        {
            $match:{
                from:req.user._id
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"to",
                foreignField:"_id",
                as:"to"             
            }
        },
        {
            $unwind: "$to" 
        },
        {
            $project:{
                to:"$to.name",
                content:1
            }
        }
    ])

    if(letterData.length === 0 ){
        return res.status(200).json( new ApiResponse(200 , "No Letters Sent Yet"))
    }
   
    letterData = letterData.map((letter)=> letter = {...letter , content:decrypt(letter.content)})

    return res
    .status(200)
    .json( 
        new ApiResponse(200 , "Letters Sent Successfully",letterData)
    )
})

const viewSentLetter = asyncHandler(async(req,res)=>{


    const {id} = req.params;
    
    const letterData = await Letter.findOne({_id:id , from:req.user._id })

    if(!letterData){
        throw new ApiError(400,"Letter Not Found")
    }

    const recieverData = await User.findById(letterData.to)
    
    const data = {
        name:recieverData.name,
        content: letterData.decryptContent(),
        comment:letterData.commentByRecipient
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , "Letter Sent Successfully",data)
    )
})


// List Recieved Letters API

const listRecievedLetters = asyncHandler(async(req,res)=>{

    let letterData = await Letter.aggregate([
        {
            $match:{
                to:req.user._id
            }
        }
    ])

    if(letterData.length === 0 ){
        return res.status(200).json( new ApiResponse(200 , "No Letters Recieved Yet"))
    }


    letterData = letterData.map((letter)=> letter = {...letter , content:decrypt(letter.content)})
    
    return res
    .status(200)
    .json(
        new ApiResponse(200 , "Letters Recieved Successfully",letterData)
    )
})
// View Recieved Letter

const viewRecievedLetter = asyncHandler(async(req,res)=>{

    const {id} = req.params;

    const letterData = await Letter.findOne({_id:id , to:req.user._id })

    if(!letterData){
        throw new ApiError(400,"Letter Not Found")
    }

    const content =  await letterData.decryptContent();

    return res
    .status(200)
    .json(
        new ApiResponse(200 , "Letter Recieved Successfully",content)
    )
})

// Add Comment API
const addReply = asyncHandler(async(req,res)=>{

    const {id} = req.params;
    const {comment} = req.body;

    const letterData = await Letter.findOne({_id:id , to:req.user._id })

    if(!letterData){
        throw new ApiError(400,"Letter Not Found")
    }

    letterData.commentByRecipient = comment;
    await letterData.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200 , "Comment Added Successfully")
    )
})



export {
    sendLetter,
    sentLetters,
    viewSentLetter,
    listRecievedLetters,
    addReply,
    viewRecievedLetter
}