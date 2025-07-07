import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request){
    console.log("=== GET /api/get-messages called ===");
    
    await dbConnect();
    
    try {
        const session = await getServerSession(authOptions);
        
        console.log("Session object:", JSON.stringify(session, null, 2));
        
        if(!session) {
            console.log("No session found");
            return Response.json({
                success: false,
                message: "No session found"
            }, { status: 401 });
        }
        
        if(!session.user) {
            console.log("No user in session");
            return Response.json({
                success: false,
                message: "No user in session"
            }, { status: 401 });
        }
        
        const user = session.user as User;
       
        
        if (!user._id) {
            console.log("No user ID found");
            return Response.json({
                success: false,
                message: "No user ID found"
            }, { status: 401 });
        }
        
        const userId = new mongoose.Types.ObjectId(user._id);
        
        const userWithMessages = await UserModel.aggregate([
            {$match: {_id: userId}},
            {$unwind: "$messages"},
            {$sort: {"messages.createdAt": -1}},
            {$group:{_id:"$_id",messages: {$push: "$messages"}}},
        ]);
        
        if(!userWithMessages || userWithMessages.length === 0){
            return Response.json({
                success: false,
                message: "No messages found"
            }, { status: 200 });
        }
        
        return Response.json({
            success: true,
            messages: userWithMessages[0].messages
        }, { status: 200 });
        
    } catch (error) {
        console.error("Failed to get messages:", error);
        return Response.json({
            success: false,
            message: "Failed to get messages"
        }, { status: 500 });
    }
}