//import { response } from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



//    creating method for generating accesstoken and refresh token

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //now saving the user's refresh token in our DB so user don't have to put password everytime
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating refresh and access token")
    }
}


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
    //console.log("email: ", email);

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
    const existedUser =await User.findOne({
        $or: [{email} , {username}]
    })
    if (existedUser){
        throw new ApiError(409, "username or email already exists")
    }

    //console.log(req.files);
    

    // image handling
    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    //cover image is not so necessary
    //if(!coverImageLocalPath) {
        //throw new ApiError(401, "cover image file is required")
    //}

    // handling cover image so we don't get the error of "cann't read properties of undefined[0]" if someone doesn't give cover image 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    } 


    //uploading images in cloudinary:
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    console.log("avatar result:", avatar)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log("COVER RESULT:", coverImage)

    // again checking if avatar is succesfully came or not beacuse avatar is a required field
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    // creating a user object and storing data into database
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase() 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // checking if user has come successfully or not
    if(!createdUser) {
        throw new ApiError (500, "something went wrong while registering the user")
    }


    // response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User sucessfully registered")
    )

} )



// login section

const loginUser = asyncHandler(async (req , res) => {

    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie


    // taking data from req.body

    const {username, email, password} = req.body

    if(!(username || email)) {
        throw new ApiError (400 , "username or email is required")
    }

    // through $or operator it will search in DB on the basis of username or email according to our frontend . here we are trying to balance with both of the matter without knowing our frontend is taking which fields for login

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // if user is not in our DB 
    if(!user) {
        throw new ApiError (404 , "user doesn't exist")
    }


    // password checking 

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError (401 , "Password incorrect") // or we can say " invalid user credentials"
    }


    // now if user's password is also right then create access and refresh token.
    // calling the generateAccessAndRefreshToken()

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    
    // filtering user info that we will send to frontend
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


})


export {
    registerUser,
    loginUser
}