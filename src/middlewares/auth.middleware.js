//it will only verify if user is there or not

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    //if we don't have the token
    if(!token) {
        throw new ApiError(401, "unauthorized request")

    }

    
})