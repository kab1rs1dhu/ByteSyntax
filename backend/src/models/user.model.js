import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{ type : String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true},
    clerkId: { type: String, required: true, unique: true }

}, { timestamps : true }); // need for created at and updated at

export const User = mongoose.model("User", userSchema); // create a user model based on the schema
