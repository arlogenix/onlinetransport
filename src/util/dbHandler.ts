import sessionModel from "../models/session";
import userModel from "../models/user";
import mongoose from "mongoose";

//# This for creating a NEW session
export async function createSession(phone_no: string): Promise<boolean> {
    console.log("createSession start");
        try {
            // Create a new session object
            const newSession = new sessionModel({
                id: new mongoose.Types.ObjectId().toString(), // Generate a new ObjectId and convert it to string
                phoneNumber: phone_no,
            });

            // Save the session object to the database
            await newSession.save();
            
            // If saving is successful, return true
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            console.error("Error creating session:", error);
            return false;
        }
}

//# This for update the EXISTING session
export async function updateSessionCurrentPath(sessionId: mongoose.Types.ObjectId, newCurrentPath: string): Promise<boolean> {
    console.log("updateSessionCurrentPath start");
        try {
            // Update the session's currentPath field
            const result = await sessionModel.findByIdAndUpdate(
                sessionId,
                { 
                    currentPath: newCurrentPath,
                    updatedTime: new Date()
                }, // Only updating the currentPath field
                { new: true }
            );
            console.log("updateSessionCurrentPath boolean ",!!result);
            return !!result; // If result is truthy, return true; otherwise, return false
        } catch (error) {
            console.error("Error updating updateSessionCurrentPath:", error);
            return false; // Return false in case of an error
        }
}


export async function deleteCurrentSession(existingSessionId: mongoose.Types.ObjectId) {
    try {
        // Delete the session document
        await sessionModel.deleteOne({ _id: existingSessionId }).exec();
        console.log('Session deleted successfully');
    } catch (error) {
        console.error('Error deleting session:', error);
    }
}

export async function createNewUser(phone_no: string): Promise<boolean> {
    console.log("createNewUser start");

        try {
            // Create a new user object
            const newUser = new userModel({
                id: new mongoose.Types.ObjectId().toString(), // Generate a new ObjectId and convert it to string
                phoneNumber: phone_no,
            });

            // Save the user object to the database
            await newUser.save();
            
            // If saving is successful, return true
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            console.error("Error creating user:", error);
            return false;
        }
}