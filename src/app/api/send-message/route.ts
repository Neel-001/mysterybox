import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();
    const { username, content } = await request.json();
    try {
        console.log('Received username:', username);
        // Case-insensitive search and only verified users
        const user = await UserModel.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') },
            isVerified: true
        });
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Accept if undefined or true, only block if explicitly false
        if (user.isAcceptingMessage === false) {
            return Response.json({
                success: false,
                message: "User is not accepting messages"
            }, { status: 403 });
        }
        const newMessage = { content, createdAt: new Date() };
        user.messages.push(newMessage as Message);
        await user.save();
        return Response.json({
            success: true,
            message: "Message sent successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Failed to send message:", error);
        return Response.json({
            success: false,
            message: `Failed to send message: ${error instanceof Error ? error.message : ''}`
        }, { status: 500 });
    }
}