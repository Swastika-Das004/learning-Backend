//import { response } from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler ( async(req, res) => {
    // get user details from frontend
    // validation - if the email is filled up by the user or is all fields are fillep up or not let's say through not empty
    // check if user already exists: username , email
    // check for images, check for avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token fiels from response
    // check the user creation 
    // return response


    //getting user details

    const {fullname , email, username, password} = req.body
    console.log("email: ", email);

//    if (fullname ===""){
//        throw new ApiError(400, "fullname is required")
//    } 

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }
    //checking email @ only
    if (!email.includes("@")) {     

       throw new ApiError(400, "@ must be used")
    }  

    // checking if user already exits or not
    const existedUser = User.findOne({
        $or: [{email} , {username}]
    })
    if (existedUser){
        throw new ApiError(409, "username or email already exists")
    }

    // image handling
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    //cover image is not so necessary
    if(!coverImageLocalPath) {
        throw new ApiError(401, "cover image file is required")
    }


    //uploading images in cloudinary:
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // again checking if avatar is succesfully came or not beacuse avatar is a required field
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

} )


export {registerUser}