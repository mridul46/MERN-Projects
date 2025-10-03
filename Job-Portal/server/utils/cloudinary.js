import {v2 as cloudinary} from "cloudinary"
import { asyncHandler } from "./async-handler.js"

const connectCloudinary= asyncHandler(async()=>{
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
    })
})
export default connectCloudinary