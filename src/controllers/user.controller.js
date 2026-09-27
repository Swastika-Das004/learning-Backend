//import { response } from "express";
import {asyncHandler} from "../utils/asyncHandler.js";


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

} )


export {registerUser}