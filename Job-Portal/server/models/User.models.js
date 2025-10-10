import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  _id: { type: String, required: true },
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  resume: { type: String },
  image: { type: String, required: true },
},{
   timestamps:true
});


export const User = mongoose.model("User", userSchema);
